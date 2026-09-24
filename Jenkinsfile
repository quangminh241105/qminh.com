pipeline {
    agent any

    environment {
        TARGET_SERVER = '192.168.1.199'
        TARGET_USER = 'deployer'

        APP_NAME = 'qminh'
        APP_PORT = '3000'
        DEPLOY_PATH = '/opt/webapps/qminh'
        UPLOADS_HOST_PATH = '/opt/webapps/qminh-data/uploads'
        SSH_OPTS = '-o StrictHostKeyChecking=no -o ServerAliveInterval=15 -o ServerAliveCountMax=6 -o ConnectTimeout=10'
    }

    triggers {
        githubPush()
    }

    options {
        // Do not race the blue-green state files or candidate ports.
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Verify Files') {
            steps {
                sh '''
                    echo "=== Jenkins Build Info ==="
                    pwd
                    ls -la

                    test -f package.json || { echo "ERROR: package.json missing"; exit 1; }
                    test -f Dockerfile || { echo "ERROR: Dockerfile missing"; exit 1; }
                    test -f docker-compose.yml || { echo "ERROR: docker-compose.yml missing"; exit 1; }

                    echo "Git commit:"
                    git log -1 --oneline
                '''
            }
        }

        stage('Deploy Files') {
            steps {
                sshagent(['ubuntu-vm-jenkins']) {
                    sh '''
                        ssh ${SSH_OPTS} ${TARGET_USER}@${TARGET_SERVER} "mkdir -p ${DEPLOY_PATH}"

                        rsync -avz --delete \
                            --exclude '.git' \
                            --exclude 'node_modules' \
                            --exclude '.env' \
                            --exclude '.qminh-active' \
                            --exclude '.qminh-candidate' \
                            --exclude '*.log' \
                            ./ ${TARGET_USER}@${TARGET_SERVER}:${DEPLOY_PATH}/
                    '''
                }
            }
        }

        stage('Inject .env from Jenkins') {
            steps {
                withCredentials([file(credentialsId: 'qminh-env', variable: 'ENV_FILE')]) {
                    sshagent(['ubuntu-vm-jenkins']) {
                        sh '''
                            scp ${SSH_OPTS} $ENV_FILE ${TARGET_USER}@${TARGET_SERVER}:${DEPLOY_PATH}/.env.new
                            ssh ${SSH_OPTS} ${TARGET_USER}@${TARGET_SERVER} \
                                "mv -f ${DEPLOY_PATH}/.env.new ${DEPLOY_PATH}/.env"
                        '''
                    }
                }
            }
        }

        stage('Prepare Upload Directory') {
            steps {
                sshagent(['ubuntu-vm-jenkins']) {
                    sh '''
                        ssh ${SSH_OPTS} ${TARGET_USER}@${TARGET_SERVER} \
                            "mkdir -p ${UPLOADS_HOST_PATH}"
                    '''
                }
            }
        }

        stage('Build Candidate') {
            steps {
                sshagent(['ubuntu-vm-jenkins']) {
                    sh(script: '''
                        ssh ${SSH_OPTS} ${TARGET_USER}@${TARGET_SERVER} \
                            "bash -s -- '${DEPLOY_PATH}' '${APP_NAME}' '${APP_PORT}' '${BUILD_NUMBER}' '${UPLOADS_HOST_PATH}'" <<'REMOTE_SCRIPT'
                        set -eu

                        DEPLOY_PATH="$1"
                        APP_NAME="$2"
                        APP_PORT="$3"
                        BUILD_NUMBER="$4"
                        UPLOADS_HOST_PATH="$5"

                        cd "$DEPLOY_PATH"

                        IMAGE="${APP_NAME}:${BUILD_NUMBER}"
                        CANDIDATE_CONTAINER="${APP_NAME}-candidate-${BUILD_NUMBER}"
                        CANDIDATE_STATE="$DEPLOY_PATH/.qminh-candidate"
                        ACTIVE_STATE="$DEPLOY_PATH/.qminh-active"

                        cleanup_candidate_on_error() {
                            if [ "${CANDIDATE_READY:-0}" != '1' ]; then
                                docker rm -f "$CANDIDATE_CONTAINER" > /dev/null 2>&1 || true
                                docker image rm "$IMAGE" > /dev/null 2>&1 || true
                                rm -f "$CANDIDATE_STATE" "$CANDIDATE_STATE.tmp"
                            fi
                        }
                        trap cleanup_candidate_on_error EXIT

                        is_running() {
                            [ -n "$1" ] && [ "$(docker inspect -f '{{.State.Running}}' "$1" 2>/dev/null || true)" = "true" ]
                        }

                        ACTIVE_CONTAINER=""

                        if [ -f "$ACTIVE_STATE" ]; then
                            ACTIVE_FROM_STATE="$(sed -n 's/^ACTIVE_CONTAINER=//p' "$ACTIVE_STATE" | head -n 1)"
                            if is_running "$ACTIVE_FROM_STATE"; then
                                ACTIVE_CONTAINER="$ACTIVE_FROM_STATE"
                            fi
                        fi

                        if [ -z "$ACTIVE_CONTAINER" ]; then
                            ACTIVE_CONTAINER="$(docker ps --filter "label=com.qminh.role=app" --format '{{.Names}}' | grep -v -- '-candidate-' | head -n 1 || true)"
                        fi

                        if [ -z "$ACTIVE_CONTAINER" ]; then
                            # Also find the old direct-run container when it has no blue-green label
                            # and uses host networking (there is no port mapping to inspect).
                            for RUNNING_NAME in $(docker ps --format '{{.Names}}'); do
                                case "$RUNNING_NAME" in
                                    "$APP_NAME"|"$APP_NAME"-[0-9]*)
                                        ACTIVE_CONTAINER="$RUNNING_NAME"
                                        break
                                        ;;
                                esac
                            done
                        fi

                        if [ -z "$ACTIVE_CONTAINER" ]; then
                            # Compatibility fallback for the pre-blue-green container.
                            ACTIVE_CONTAINER="$(docker ps --format '{{.Names}} {{.Ports}}' | awk -v port=":${APP_PORT}->" '$0 ~ port {print $1; exit}' || true)"
                        fi

                        if [ -n "$ACTIVE_CONTAINER" ]; then
                            echo "Keeping current app online: $ACTIVE_CONTAINER"
                        else
                            echo 'No existing app container found; this is the first blue-green deployment.'
                        fi

                        # Only an abandoned application candidate is cleaned up here.
                        # Existing MongoDB containers are deliberately never touched.
                        if [ -f "$CANDIDATE_STATE" ]; then
                            OLD_CANDIDATE="$(sed -n 's/^CANDIDATE_CONTAINER=//p' "$CANDIDATE_STATE" | head -n 1)"
                            if [ -n "$OLD_CANDIDATE" ]; then
                                docker rm -f "$OLD_CANDIDATE" > /dev/null 2>&1 || true
                            fi
                            rm -f "$CANDIDATE_STATE"
                        fi

                        echo "Building $IMAGE without stopping the current app or starting MongoDB..."
                        docker build --pull \
                            --build-arg "NEXT_DEPLOYMENT_ID=$BUILD_NUMBER" \
                            -t "$IMAGE" "$DEPLOY_PATH"

                        CANDIDATE_PORT=""
                        for PORT in 31001 31002; do
                            if command -v ss > /dev/null 2>&1; then
                                if ! ss -ltn 2>/dev/null | grep -Eq "[.:]${PORT}[[:space:]]"; then
                                    CANDIDATE_PORT="$PORT"
                                    break
                                fi
                            elif ! docker ps --format '{{.Ports}}' | grep -Eq "[.:]${PORT}->"; then
                                CANDIDATE_PORT="$PORT"
                                break
                            fi
                        done

                        if [ -z "$CANDIDATE_PORT" ]; then
                            echo 'ERROR: neither blue nor green candidate port (31001/31002) is available'
                            docker image rm "$IMAGE" > /dev/null 2>&1 || true
                            exit 1
                        fi

                        echo "Starting candidate $CANDIDATE_CONTAINER on localhost:$CANDIDATE_PORT..."
                        docker run -d \
                            --name "$CANDIDATE_CONTAINER" \
                            --label 'com.qminh.role=app' \
                            --label "com.qminh.build=$BUILD_NUMBER" \
                            --restart no \
                            --network host \
                            --add-host mongo:127.0.0.1 \
                            --add-host mongodb:127.0.0.1 \
                            --add-host qminh-mongo:127.0.0.1 \
                            --add-host qminh-mongodb:127.0.0.1 \
                            --env-file "$DEPLOY_PATH/.env" \
                            -e PORT="$CANDIDATE_PORT" \
                            -e HOSTNAME=0.0.0.0 \
                            -v "$UPLOADS_HOST_PATH:/app/public/uploads" \
                            "$IMAGE" > /dev/null

                        {
                            echo "CANDIDATE_CONTAINER=$CANDIDATE_CONTAINER"
                            echo "CANDIDATE_PORT=$CANDIDATE_PORT"
                            echo "IMAGE=$IMAGE"
                            echo "PREVIOUS_CONTAINER=$ACTIVE_CONTAINER"
                        } > "$CANDIDATE_STATE.tmp"
                        mv -f "$CANDIDATE_STATE.tmp" "$CANDIDATE_STATE"
                        CANDIDATE_READY=1
                        trap - EXIT
                        echo 'Candidate is running; the current app was not stopped.'
REMOTE_SCRIPT
                    '''.stripIndent())
                }
            }
        }

        stage('Health Check Candidate') {
            steps {
                sshagent(['ubuntu-vm-jenkins']) {
                    sh(script: '''
                        ssh ${SSH_OPTS} ${TARGET_USER}@${TARGET_SERVER} \
                            "bash -s -- '${DEPLOY_PATH}'" <<'REMOTE_SCRIPT'
                        set -eu

                        DEPLOY_PATH="$1"
                        CANDIDATE_STATE="$DEPLOY_PATH/.qminh-candidate"

                        if [ ! -f "$CANDIDATE_STATE" ]; then
                            echo 'ERROR: blue-green candidate state is missing'
                            exit 1
                        fi

                        . "$CANDIDATE_STATE"
                        echo "Waiting for $CANDIDATE_CONTAINER on localhost:$CANDIDATE_PORT..."

                        for i in $(seq 1 30); do
                            if curl -sS -f -L --max-time 10 "http://127.0.0.1:$CANDIDATE_PORT/" > /dev/null 2>&1; then
                                echo "Candidate $CANDIDATE_CONTAINER is serving the website"
                                exit 0
                            fi
                            echo "Candidate health attempt $i/30 failed; waiting 2s..."
                            sleep 2
                        done

                        echo 'ERROR: candidate health check failed; keeping the previous app untouched'
                        docker logs "$CANDIDATE_CONTAINER" --tail 100 || true
                        docker rm -f "$CANDIDATE_CONTAINER" > /dev/null 2>&1 || true
                        docker image rm "$IMAGE" > /dev/null 2>&1 || true
                        rm -f "$CANDIDATE_STATE"
                        exit 1
REMOTE_SCRIPT
                    '''.stripIndent())
                }
            }
        }

        stage('Switch Traffic') {
            steps {
                sshagent(['ubuntu-vm-jenkins']) {
                    sh(script: '''
                        ssh ${SSH_OPTS} ${TARGET_USER}@${TARGET_SERVER} \
                            "bash -s -- '${DEPLOY_PATH}' '${APP_NAME}' '${APP_PORT}' '${BUILD_NUMBER}' '${UPLOADS_HOST_PATH}'" <<'REMOTE_SCRIPT'
                        set -eu

                        DEPLOY_PATH="$1"
                        APP_NAME="$2"
                        APP_PORT="$3"
                        BUILD_NUMBER="$4"
                        UPLOADS_HOST_PATH="$5"
                        CANDIDATE_STATE="$DEPLOY_PATH/.qminh-candidate"
                        ACTIVE_STATE="$DEPLOY_PATH/.qminh-active"

                        if [ ! -f "$CANDIDATE_STATE" ]; then
                            echo 'ERROR: cannot switch traffic without a healthy candidate state'
                            exit 1
                        fi

                        . "$CANDIDATE_STATE"
                        NEW_CONTAINER="${APP_NAME}-${BUILD_NUMBER}"

                        if [ "$(docker inspect -f '{{.State.Running}}' "$CANDIDATE_CONTAINER" 2>/dev/null || true)" != 'true' ]; then
                            echo 'ERROR: candidate stopped before traffic switch'
                            exit 1
                        fi

                        run_app() {
                            CONTAINER="$1"
                            PORT="$2"
                            RESTART_POLICY="$3"

                            docker run -d \
                                --name "$CONTAINER" \
                                --label 'com.qminh.role=app' \
                                --label "com.qminh.build=$BUILD_NUMBER" \
                                --restart "$RESTART_POLICY" \
                                --network host \
                                --add-host mongo:127.0.0.1 \
                                --add-host mongodb:127.0.0.1 \
                                --add-host qminh-mongo:127.0.0.1 \
                                --add-host qminh-mongodb:127.0.0.1 \
                                --env-file "$DEPLOY_PATH/.env" \
                                -e PORT="$PORT" \
                                -e HOSTNAME=0.0.0.0 \
                                -v "$UPLOADS_HOST_PATH:/app/public/uploads" \
                                "$IMAGE" > /dev/null
                        }

                        wait_for_health() {
                            PORT="$1"
                            CONTAINER="$2"

                            for i in $(seq 1 30); do
                                if curl -sS -f -L --max-time 10 "http://127.0.0.1:$PORT/" > /dev/null 2>&1; then
                                    return 0
                                fi
                                echo "Active health attempt $i/30 failed; waiting 2s..."
                                sleep 2
                            done

                            echo "ERROR: $CONTAINER failed the post-switch health check"
                            docker logs "$CONTAINER" --tail 100 || true
                            return 1
                        }

                        echo "Candidate is healthy. Switching localhost:$APP_PORT to $NEW_CONTAINER..."
                        if [ -n "${PREVIOUS_CONTAINER:-}" ] && [ "$PREVIOUS_CONTAINER" != "$CANDIDATE_CONTAINER" ]; then
                            docker stop "$PREVIOUS_CONTAINER" > /dev/null
                        fi

                        docker rm -f "$NEW_CONTAINER" > /dev/null 2>&1 || true
                        if ! run_app "$NEW_CONTAINER" "$APP_PORT" unless-stopped || ! wait_for_health "$APP_PORT" "$NEW_CONTAINER"; then
                            echo 'ERROR: switch failed; rolling back to the previous app container'
                            docker rm -f "$NEW_CONTAINER" > /dev/null 2>&1 || true
                            if [ -n "${PREVIOUS_CONTAINER:-}" ]; then
                                docker start "$PREVIOUS_CONTAINER" > /dev/null 2>&1 || true
                            fi
                            docker rm -f "$CANDIDATE_CONTAINER" > /dev/null 2>&1 || true
                            docker image rm "$IMAGE" > /dev/null 2>&1 || true
                            rm -f "$CANDIDATE_STATE"
                            exit 1
                        fi

                        # Remove the old container only after the new stable container is healthy.
                        if [ -n "${PREVIOUS_CONTAINER:-}" ] && [ "$PREVIOUS_CONTAINER" != "$NEW_CONTAINER" ]; then
                            docker rm -f "$PREVIOUS_CONTAINER" > /dev/null 2>&1 || true
                        fi
                        docker rm -f "$CANDIDATE_CONTAINER" > /dev/null 2>&1 || true

                        {
                            echo "ACTIVE_CONTAINER=$NEW_CONTAINER"
                            echo "IMAGE=$IMAGE"
                        } > "$ACTIVE_STATE.tmp"
                        mv -f "$ACTIVE_STATE.tmp" "$ACTIVE_STATE"
                        rm -f "$CANDIDATE_STATE"

                        # Remove only superseded qminh app images; MongoDB and unrelated
                        # Docker images are never pruned by this deployment.
                        for OLD_IMAGE in $(docker images "$APP_NAME" --format '{{.Repository}}:{{.Tag}}' | grep -v -F "$IMAGE" || true); do
                            docker image rm "$OLD_IMAGE" > /dev/null 2>&1 || true
                        done

                        echo "Blue-green deployment complete: $NEW_CONTAINER is serving on port $APP_PORT"
REMOTE_SCRIPT
                    '''.stripIndent())
                }
            }
        }

    }

    post {
        success {
            echo 'Deployment successful'
            echo 'qminh running on 192.168.1.199:3000'
            echo 'Domain: https://qminh.com'
        }

        failure {
            echo 'Deployment failed'

            // If Jenkins loses the connection after a candidate was started, remove only
            // that candidate. The active app and all database containers remain untouched.
            sshagent(['ubuntu-vm-jenkins']) {
                sh(script: '''
                    ssh ${SSH_OPTS} ${TARGET_USER}@${TARGET_SERVER} \
                        "bash -s -- '${DEPLOY_PATH}'" <<'REMOTE_SCRIPT' || true
                    set +e
                    DEPLOY_PATH="$1"
                    CANDIDATE_STATE="$DEPLOY_PATH/.qminh-candidate"
                    if [ -f "$CANDIDATE_STATE" ]; then
                        . "$CANDIDATE_STATE"
                        docker rm -f "$CANDIDATE_CONTAINER" > /dev/null 2>&1 || true
                        docker image rm "$IMAGE" > /dev/null 2>&1 || true
                        rm -f "$CANDIDATE_STATE"
                    fi
REMOTE_SCRIPT
                '''.stripIndent())
            }
        }

        always {
            cleanWs()
        }
    }
}
