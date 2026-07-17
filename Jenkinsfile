pipeline {
    agent any

    environment {
        TARGET_SERVER = '192.168.1.199'
        TARGET_USER = 'deployer'

        APP_NAME = 'qminh'
        APP_PORT = '3000'

        DEPLOY_PATH = '/opt/webapps/qminh'

        // Must match UPLOADS_HOST_PATH in the qminh-env Jenkins credential
        // (see .env.example) - outside DEPLOY_PATH so `rsync --delete` below
        // never touches uploaded media.
        UPLOADS_HOST_PATH = '/opt/webapps/qminh-data/uploads'
    }

    triggers {
        githubPush()
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

                    if [ ! -f package.json ]; then
                        echo "ERROR: package.json missing"
                        exit 1
                    fi
                    
                    if [ ! -f Dockerfile ]; then
                        echo "ERROR: Dockerfile missing"
                        exit 1
                    fi

                    if [ ! -f docker-compose.yml ]; then
                        echo "ERROR: docker-compose.yml missing"
                        exit 1
                    fi

                    echo "Git commit:"
                    git log -1 --oneline
                '''
            }
        }

        stage('Deploy Files') {
            steps {
                sshagent(['ubuntu-vm-jenkins']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ${TARGET_USER}@${TARGET_SERVER} "
                            mkdir -p ${DEPLOY_PATH}
                        "

                        rsync -avz --delete \
                            --exclude '.git' \
                            --exclude 'node_modules' \
                            --exclude '.env' \
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
                            scp -o StrictHostKeyChecking=no $ENV_FILE ${TARGET_USER}@${TARGET_SERVER}:${DEPLOY_PATH}/.env
                        '''
                    }
                }
            }
        }

        stage('Prepare Upload Directory') {
            steps {
                sshagent(['ubuntu-vm-jenkins']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ${TARGET_USER}@${TARGET_SERVER} "
                            echo 'Ensuring upload host directory exists: ${UPLOADS_HOST_PATH}'
                            mkdir -p ${UPLOADS_HOST_PATH}
                        "
                    '''
                }
            }
        }

        stage('Build & Start Application') {
            steps {
                sshagent(['ubuntu-vm-jenkins']) {
                    sh '''
                        ssh ${TARGET_USER}@${TARGET_SERVER} "
                            cd ${DEPLOY_PATH}

                            echo 'Building and starting app + mongo via docker compose...'
                            docker compose up -d --build

                            docker compose ps
                        "
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                sshagent(['ubuntu-vm-jenkins']) {
                    sh '''
                        ssh ${TARGET_USER}@${TARGET_SERVER} "
                            echo 'Waiting for application to start...'
                            
                            for i in {1..12}; do
                                if curl -s -f -L http://localhost:${APP_PORT} > /dev/null 2>&1; then
                                    echo '✓ qminh healthy'
                                    exit 0
                                fi
                                echo \"Attempt \$i failed. Waiting 5s...\"
                                sleep 5
                            done

                            echo '✗ Health check failed after 60 seconds'
                            docker logs ${APP_NAME} --tail 50
                            exit 1
                        "
                    '''
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
        }

        always {
            cleanWs()
        }
    }
}
