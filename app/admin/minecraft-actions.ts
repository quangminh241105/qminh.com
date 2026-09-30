"use server";

import { isAuthenticatedAdmin } from "@/lib/auth";
import {
  executeRconCommand,
  getMinecraftServerOverview,
  getMinecraftRconConfig,
  type MinecraftServerOverview,
} from "@/lib/minecraft-rcon";

async function requireAuth() {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    throw new Error("Unauthorized: Admin access required.");
  }
}

function actionFailure(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  return { ok: false as const, error: message };
}

/**
 * Returns complete live overview of the Minecraft server via RCON
 */
export async function getMinecraftStatusAction(): Promise<MinecraftServerOverview> {
  await requireAuth();
  return await getMinecraftServerOverview();
}

/**
 * Returns basic RCON connection settings (sanitized, password omitted)
 */
export async function getMinecraftConfigAction() {
  await requireAuth();
  const config = getMinecraftRconConfig();
  return {
    host: config.host,
    port: config.port,
    hasPassword: Boolean(config.password && config.password.length > 0),
  };
}

export type ExecuteCommandResult =
  | { ok: true; command: string; response: string; latencyMs: number }
  | { ok: false; error: string; latencyMs?: number };

/**
 * Executes an arbitrary command on the Minecraft server via RCON
 */
export async function executeMinecraftCommandAction(rawCommand: string): Promise<ExecuteCommandResult> {
  try {
    await requireAuth();
    const command = rawCommand.trim().replace(/^\//, "");
    if (!command) {
      return { ok: false, error: "Command cannot be empty." };
    }

    const result = await executeRconCommand(command);
    if (!result.ok) {
      return { ok: false, error: result.error || "RCON command failed.", latencyMs: result.latencyMs };
    }

    return {
      ok: true,
      command,
      response: result.response,
      latencyMs: result.latencyMs,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to execute Minecraft command.";
    return { ok: false, error: message };
  }
}

/**
 * Change world time (e.g. 0, 6000, 12000, 18000, or preset names)
 */
export async function setMinecraftTimeAction(time: string | number) {
  try {
    await requireAuth();
    const cmd = `time set ${time}`;
    const result = await executeRconCommand(cmd);
    if (!result.ok) throw new Error(result.error);
    return { ok: true as const, response: result.response };
  } catch (error) {
    return actionFailure(error, "Failed to set time.");
  }
}

/**
 * Change world weather
 */
export async function setMinecraftWeatherAction(
  weather: "clear" | "rain" | "thunder",
  durationSeconds?: number
) {
  try {
    await requireAuth();
    const cmd = durationSeconds && durationSeconds > 0
      ? `weather ${weather} ${durationSeconds}`
      : `weather ${weather}`;
    const result = await executeRconCommand(cmd);
    if (!result.ok) throw new Error(result.error);
    return { ok: true as const, response: result.response };
  } catch (error) {
    return actionFailure(error, "Failed to set weather.");
  }
}

/**
 * Change game difficulty
 */
export async function setMinecraftDifficultyAction(
  difficulty: "peaceful" | "easy" | "normal" | "hard"
) {
  try {
    await requireAuth();
    const cmd = `difficulty ${difficulty}`;
    const result = await executeRconCommand(cmd);
    if (!result.ok) throw new Error(result.error);
    return { ok: true as const, response: result.response };
  } catch (error) {
    return actionFailure(error, "Failed to set difficulty.");
  }
}

export type PlayerActionType =
  | "gamemode"
  | "op"
  | "deop"
  | "kick"
  | "ban"
  | "pardon"
  | "kill"
  | "clear"
  | "msg"
  | "give"
  | "xp"
  | "heal"
  | "feed"
  | "tp";

export interface PlayerActionPayload {
  player: string;
  target?: string;
  reason?: string;
  mode?: "survival" | "creative" | "adventure" | "spectator";
  item?: string;
  amount?: number;
  message?: string;
  coords?: { x: string; y: string; z: string };
}

/**
 * Executes a targeted player management action
 */
export async function playerActionServerAction(
  action: PlayerActionType,
  payload: PlayerActionPayload
) {
  try {
    await requireAuth();
    const player = payload.player.trim();
    if (!player) throw new Error("Player name is required.");

    let command = "";
    switch (action) {
      case "gamemode":
        command = `gamemode ${payload.mode || "survival"} ${player}`;
        break;
      case "op":
        command = `op ${player}`;
        break;
      case "deop":
        command = `deop ${player}`;
        break;
      case "kick":
        command = `kick ${player} ${payload.reason || "Kicked by server administrator"}`;
        break;
      case "ban":
        command = `ban ${player} ${payload.reason || "Banned by server administrator"}`;
        break;
      case "pardon":
        command = `pardon ${player}`;
        break;
      case "kill":
        command = `kill ${player}`;
        break;
      case "clear":
        command = `clear ${player}`;
        break;
      case "heal":
        command = `effect give ${player} instant_health 1 255`;
        break;
      case "feed":
        command = `effect give ${player} saturation 1 255`;
        break;
      case "msg":
        command = `tellraw ${player} {"text":"[Admin] ${payload.message || ""}","color":"yellow","bold":false}`;
        break;
      case "give":
        command = `give ${player} ${payload.item || "diamond"} ${payload.amount || 1}`;
        break;
      case "xp":
        command = `experience add ${player} ${payload.amount || 10} levels`;
        break;
      case "tp":
        if (payload.coords) {
          command = `tp ${player} ${payload.coords.x} ${payload.coords.y} ${payload.coords.z}`;
        } else if (payload.target) {
          command = `tp ${player} ${payload.target}`;
        } else {
          throw new Error("Teleport target or coordinates are required.");
        }
        break;
      default:
        throw new Error(`Unsupported player action: ${action}`);
    }

    const result = await executeRconCommand(command);
    if (!result.ok) throw new Error(result.error);
    return { ok: true as const, command, response: result.response };
  } catch (error) {
    return actionFailure(error, "Player action failed.");
  }
}

/**
 * Broadcast in-game announcements (Chat / Title / Actionbar)
 */
export async function broadcastServerAction(payload: {
  message: string;
  type: "say" | "title" | "subtitle" | "actionbar";
  color?: string;
  target?: string;
}) {
  try {
    await requireAuth();
    const msg = payload.message.trim();
    if (!msg) throw new Error("Broadcast message cannot be empty.");

    const target = payload.target?.trim() || "@a";
    let cmd = "";

    if (payload.type === "say") {
      cmd = `say ${msg}`;
    } else if (payload.type === "title") {
      cmd = `title ${target} title {"text":"${msg}","color":"${payload.color || "gold"}","bold":true}`;
    } else if (payload.type === "subtitle") {
      cmd = `title ${target} subtitle {"text":"${msg}","color":"${payload.color || "yellow"}"}`;
    } else if (payload.type === "actionbar") {
      cmd = `title ${target} actionbar {"text":"${msg}","color":"${payload.color || "green"}"}`;
    }

    const result = await executeRconCommand(cmd);
    if (!result.ok) throw new Error(result.error);
    return { ok: true as const, response: result.response };
  } catch (error) {
    return actionFailure(error, "Failed to broadcast message.");
  }
}

/**
 * Play a sound to all players
 */
export async function playSoundServerAction(soundId: string, target = "@a") {
  try {
    await requireAuth();
    const cmd = `playsound ${soundId} master ${target}`;
    const result = await executeRconCommand(cmd);
    if (!result.ok) throw new Error(result.error);
    return { ok: true as const, response: result.response };
  } catch (error) {
    return actionFailure(error, "Failed to play sound.");
  }
}

/**
 * Whitelist operations
 */
export async function whitelistServerAction(
  action: "on" | "off" | "add" | "remove" | "reload",
  player?: string
) {
  try {
    await requireAuth();
    let cmd = `whitelist ${action}`;
    if ((action === "add" || action === "remove") && player) {
      cmd = `whitelist ${action} ${player.trim()}`;
    }

    const result = await executeRconCommand(cmd);
    if (!result.ok) throw new Error(result.error);
    return { ok: true as const, response: result.response };
  } catch (error) {
    return actionFailure(error, "Whitelist action failed.");
  }
}

/**
 * Ban & IP Ban operations
 */
export async function banManagementServerAction(
  action: "ban" | "ban-ip" | "pardon" | "pardon-ip",
  target: string,
  reason?: string
) {
  try {
    await requireAuth();
    const tgt = target.trim();
    if (!tgt) throw new Error("Target player or IP is required.");

    let cmd = `${action} ${tgt}`;
    if ((action === "ban" || action === "ban-ip") && reason) {
      cmd += ` ${reason.trim()}`;
    }

    const result = await executeRconCommand(cmd);
    if (!result.ok) throw new Error(result.error);
    return { ok: true as const, response: result.response };
  } catch (error) {
    return actionFailure(error, "Ban action failed.");
  }
}

/**
 * Gamerule operations
 */
export async function gameruleServerAction(rule: string, value?: string | boolean | number) {
  try {
    await requireAuth();
    const ruleName = rule.trim();
    if (!ruleName) throw new Error("Gamerule name is required.");

    const cmd = value !== undefined ? `gamerule ${ruleName} ${value}` : `gamerule ${ruleName}`;
    const result = await executeRconCommand(cmd);
    if (!result.ok) throw new Error(result.error);
    return { ok: true as const, response: result.response };
  } catch (error) {
    return actionFailure(error, "Failed to update gamerule.");
  }
}

/**
 * World saving operations
 */
export async function worldSaveServerAction(action: "save-all" | "save-off" | "save-on") {
  try {
    await requireAuth();
    const cmd = action === "save-all" ? "save-all flush" : action;
    const result = await executeRconCommand(cmd);
    if (!result.ok) throw new Error(result.error);
    return { ok: true as const, response: result.response };
  } catch (error) {
    return actionFailure(error, "World save action failed.");
  }
}

/**
 * World border operations
 */
export async function worldBorderServerAction(
  action: "get" | "set" | "center",
  size?: number,
  x?: number,
  z?: number
) {
  try {
    await requireAuth();
    let cmd = `worldborder ${action}`;
    if (action === "set" && size !== undefined) {
      cmd = `worldborder set ${size}`;
    } else if (action === "center" && x !== undefined && z !== undefined) {
      cmd = `worldborder center ${x} ${z}`;
    }

    const result = await executeRconCommand(cmd);
    if (!result.ok) throw new Error(result.error);
    return { ok: true as const, response: result.response };
  } catch (error) {
    return actionFailure(error, "Worldborder action failed.");
  }
}

/**
 * Server reload and stop actions
 */
export async function serverLifecycleAction(action: "reload" | "stop") {
  try {
    await requireAuth();
    const result = await executeRconCommand(action);
    if (!result.ok) throw new Error(result.error);
    return { ok: true as const, response: result.response };
  } catch (error) {
    return actionFailure(error, `Server ${action} action failed.`);
  }
}
