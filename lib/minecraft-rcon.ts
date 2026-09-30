import net from "node:net";

export interface MinecraftRconConfig {
  host: string;
  port: number;
  password?: string;
}

export interface MinecraftFormattedChunk {
  text: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
}

export interface MinecraftServerOverview {
  connected: boolean;
  host: string;
  port: number;
  hasPassword: boolean;
  latencyMs: number;
  error?: string;
  version?: string;
  players: {
    online: number;
    max: number;
    list: string[];
  };
  time?: {
    ticks: number;
    timeOfDay: string;
    dayCount: number;
  };
  difficulty?: string;
  seed?: string;
  whitelist?: {
    enabled?: boolean;
    players: string[];
  };
  bannedPlayers?: string[];
  bannedIps?: string[];
  lastChecked: string;
}

// Minecraft Color Map (Standard Minecraft Formatting Codes)
export const MINECRAFT_COLORS: Record<string, string> = {
  "0": "#000000", // Black
  "1": "#0000AA", // Dark Blue
  "2": "#00AA00", // Dark Green
  "3": "#00AAAA", // Dark Aqua
  "4": "#AA0000", // Dark Red
  "5": "#AA00AA", // Dark Purple
  "6": "#FFAA00", // Gold
  "7": "#AAAAAA", // Gray
  "8": "#555555", // Dark Gray
  "9": "#5555FF", // Blue
  "a": "#55FF55", // Green
  "b": "#55FFFF", // Aqua
  "c": "#FF5555", // Red
  "d": "#FF55FF", // Light Purple
  "e": "#FFFF55", // Yellow
  "f": "#FFFFFF", // White
};

/**
 * Returns RCON configuration from environment variables with sensible defaults.
 * Port defaults to 25575.
 * Host defaults to 127.0.0.1 (same host server when deployed).
 */
export function getMinecraftRconConfig(): MinecraftRconConfig {
  return {
    host: process.env.MINECRAFT_RCON_HOST?.trim() || "127.0.0.1",
    port: parseInt(process.env.MINECRAFT_RCON_PORT?.trim() || "25575", 10),
    password: process.env.MINECRAFT_RCON_PASSWORD || "",
  };
}

/**
 * Strip Minecraft color codes (§0-§f, §k-§r) and ANSI escape sequences
 */
export function stripMinecraftFormatting(text: string): string {
  if (!text) return "";
  return text
    .replace(/§[0-9a-fk-or]/gi, "")
    .replace(/&[0-9a-fk-or]/gi, "")
    .replace(/\x1b\[[0-9;]*m/g, "")
    .trim();
}

/**
 * Parses Minecraft formatting codes into styled chunks for rich terminal rendering
 */
export function parseMinecraftColors(text: string): MinecraftFormattedChunk[] {
  if (!text) return [];

  const chunks: MinecraftFormattedChunk[] = [];
  // Normalize color code symbols
  const normalized = text.replace(/\x1b\[[0-9;]*m/g, "");

  let currentColor: string | undefined = undefined;
  let isBold = false;
  let isItalic = false;
  let isUnderlined = false;
  let isStrikethrough = false;

  let buffer = "";

  const flushBuffer = () => {
    if (buffer.length > 0) {
      chunks.push({
        text: buffer,
        color: currentColor,
        bold: isBold,
        italic: isItalic,
        underlined: isUnderlined,
        strikethrough: isStrikethrough,
      });
      buffer = "";
    }
  };

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if ((char === "§" || char === "&") && i + 1 < normalized.length) {
      const code = normalized[i + 1].toLowerCase();
      if (MINECRAFT_COLORS[code]) {
        flushBuffer();
        currentColor = MINECRAFT_COLORS[code];
        isBold = false;
        isItalic = false;
        isUnderlined = false;
        isStrikethrough = false;
        i++;
        continue;
      } else if (code === "l") {
        flushBuffer();
        isBold = true;
        i++;
        continue;
      } else if (code === "o") {
        flushBuffer();
        isItalic = true;
        i++;
        continue;
      } else if (code === "n") {
        flushBuffer();
        isUnderlined = true;
        i++;
        continue;
      } else if (code === "m") {
        flushBuffer();
        isStrikethrough = true;
        i++;
        continue;
      } else if (code === "r") {
        flushBuffer();
        currentColor = undefined;
        isBold = false;
        isItalic = false;
        isUnderlined = false;
        isStrikethrough = false;
        i++;
        continue;
      }
    }
    buffer += char;
  }

  flushBuffer();
  return chunks;
}

/**
 * Creates an RCON packet buffer according to Valve / Minecraft RCON protocol
 */
function createRconPacket(id: number, type: number, body: string): Buffer {
  const bodyBuffer = Buffer.from(body, "utf-8");
  // packet size: 4 (id) + 4 (type) + body length + 2 null bytes (body null + padding)
  const packetSize = 4 + 4 + bodyBuffer.length + 2;
  const buffer = Buffer.alloc(packetSize + 4);

  buffer.writeInt32LE(packetSize, 0);
  buffer.writeInt32LE(id, 4);
  buffer.writeInt32LE(type, 8);
  bodyBuffer.copy(buffer, 12);
  buffer.writeUInt8(0, 12 + bodyBuffer.length);
  buffer.writeUInt8(0, 12 + bodyBuffer.length + 1);

  return buffer;
}

/**
 * Dedicated Minecraft RCON Client
 */
export class MinecraftRconClient {
  private host: string;
  private port: number;
  private password: string;
  private socket: net.Socket | null = null;
  private reqId = 10;
  private accumulatedBuffer: Buffer = Buffer.alloc(0);
  private authResolver: ((success: boolean) => void) | null = null;
  private activeCommandCallbacks = new Map<number, (data: string) => void>();

  constructor(config?: Partial<MinecraftRconConfig>) {
    const defaults = getMinecraftRconConfig();
    this.host = config?.host || defaults.host;
    this.port = config?.port || defaults.port;
    this.password = config?.password ?? defaults.password ?? "";
  }

  public async connect(timeoutMs = 5000): Promise<void> {
    if (!this.password) {
      throw new Error(
        "MINECRAFT_RCON_PASSWORD is not set. Please set MINECRAFT_RCON_PASSWORD in your .env configuration file."
      );
    }

    return new Promise<void>((resolve, reject) => {
      let isSettled = false;

      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          this.destroy();
          reject(
            new Error(
              `Connection to Minecraft RCON at ${this.host}:${this.port} timed out after ${timeoutMs}ms.`
            )
          );
        }
      }, timeoutMs);

      const socket = new net.Socket();
      this.socket = socket;

      socket.on("error", (err: NodeJS.ErrnoException) => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          this.destroy();
          if (err.code === "ECONNREFUSED") {
            reject(
              new Error(
                `Connection refused at ${this.host}:${this.port}. Is Minecraft running and enable-rcon=true configured on port 25575?`
              )
            );
          } else {
            reject(new Error(`RCON socket error: ${err.message}`));
          }
        }
      });

      socket.on("close", () => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          reject(new Error("RCON socket closed unexpectedly before authentication completed."));
        }
      });

      socket.on("data", (chunk: Buffer) => {
        this.accumulatedBuffer = Buffer.concat([this.accumulatedBuffer, chunk]);
        this.processIncomingPackets();
      });

      socket.connect(this.port, this.host, () => {
        // Connected! Now send SERVERDATA_AUTH (type 3)
        const authReqId = 1;
        this.authResolver = (success: boolean) => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);
            if (success) {
              resolve();
            } else {
              this.destroy();
              reject(
                new Error(
                  `RCON authentication failed. Verify that MINECRAFT_RCON_PASSWORD matches rcon.password in server.properties.`
                )
              );
            }
          }
        };

        socket.write(createRconPacket(authReqId, 3, this.password));
      });
    });
  }

  private processIncomingPackets() {
    while (this.accumulatedBuffer.length >= 4) {
      const packetLength = this.accumulatedBuffer.readInt32LE(0);
      const totalLength = packetLength + 4;

      if (this.accumulatedBuffer.length < totalLength) {
        // Incomplete packet in buffer; wait for more data
        break;
      }

      const packetBuf = this.accumulatedBuffer.subarray(0, totalLength);
      this.accumulatedBuffer = this.accumulatedBuffer.subarray(totalLength);

      const id = packetBuf.readInt32LE(4);
      const type = packetBuf.readInt32LE(8);
      const bodyLength = packetLength - 10;
      const body = bodyLength > 0 ? packetBuf.toString("utf-8", 12, 12 + bodyLength) : "";

      if (type === 2) {
        // SERVERDATA_AUTH_RESPONSE
        if (this.authResolver) {
          const success = id !== -1;
          this.authResolver(success);
          this.authResolver = null;
        }
      } else if (type === 0) {
        // SERVERDATA_RESPONSE_VALUE
        if (this.activeCommandCallbacks.has(id)) {
          this.activeCommandCallbacks.get(id)!(body);
        }
      }
    }
  }

  public async send(command: string, timeoutMs = 6000): Promise<string> {
    if (!this.socket || this.socket.destroyed) {
      throw new Error("RCON socket is not connected.");
    }

    const socket = this.socket;
    const cmdId = ++this.reqId;
    const sentinelId = ++this.reqId;

    return new Promise<string>((resolve, reject) => {
      let isSettled = false;
      let fullResponse = "";
      let debounceTimer: NodeJS.Timeout | null = null;

      const finish = () => {
        if (!isSettled) {
          isSettled = true;
          if (timeoutTimer) clearTimeout(timeoutTimer);
          if (debounceTimer) clearTimeout(debounceTimer);
          this.activeCommandCallbacks.delete(cmdId);
          this.activeCommandCallbacks.delete(sentinelId);
          resolve(fullResponse);
        }
      };

      const timeoutTimer = setTimeout(() => {
        if (!isSettled) {
          // If we received any response so far, return it; otherwise reject
          if (fullResponse.length > 0) {
            finish();
          } else {
            isSettled = true;
            this.activeCommandCallbacks.delete(cmdId);
            this.activeCommandCallbacks.delete(sentinelId);
            reject(new Error(`Command '${command}' timed out after ${timeoutMs}ms.`));
          }
        }
      }, timeoutMs);

      this.activeCommandCallbacks.set(cmdId, (body: string) => {
        fullResponse += body;
        // In case the server does not support sentinel packets, reset a small debounce timer
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(finish, 250);
      });

      this.activeCommandCallbacks.set(sentinelId, () => {
        // Sentinel received: indicates all response chunks for the previous command are complete
        finish();
      });

      // Send command (type 2)
      socket.write(createRconPacket(cmdId, 2, command));
      // Send empty sentinel packet (type 0)
      socket.write(createRconPacket(sentinelId, 0, ""));
    });
  }

  public destroy(): void {
    if (this.socket) {
      try {
        this.socket.removeAllListeners();
        this.socket.destroy();
      } catch {
        // Ignore
      }
      this.socket = null;
    }
    this.accumulatedBuffer = Buffer.alloc(0);
    this.activeCommandCallbacks.clear();
    this.authResolver = null;
  }
}

/**
 * Executes a single command over a fresh RCON connection.
 */
export async function executeRconCommand(
  command: string,
  config?: Partial<MinecraftRconConfig>,
  timeoutMs = 6000
): Promise<{ ok: boolean; response: string; error?: string; latencyMs: number }> {
  const startTime = Date.now();
  const client = new MinecraftRconClient(config);

  try {
    await client.connect(timeoutMs);
    const rawResponse = await client.send(command, timeoutMs);
    const latencyMs = Date.now() - startTime;
    return {
      ok: true,
      response: rawResponse,
      latencyMs,
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      response: "",
      error: message,
      latencyMs,
    };
  } finally {
    client.destroy();
  }
}

/**
 * Executes multiple commands in sequence over a single RCON connection.
 */
export async function executeRconBatch(
  commands: string[],
  config?: Partial<MinecraftRconConfig>,
  timeoutMs = 8000
): Promise<{
  ok: boolean;
  results: Record<string, { ok: boolean; response: string; error?: string }>;
  error?: string;
  latencyMs: number;
}> {
  const startTime = Date.now();
  const client = new MinecraftRconClient(config);
  const results: Record<string, { ok: boolean; response: string; error?: string }> = {};

  try {
    await client.connect(timeoutMs);

    for (const cmd of commands) {
      try {
        const resp = await client.send(cmd, 3500);
        results[cmd] = { ok: true, response: resp };
      } catch (cmdErr: unknown) {
        results[cmd] = {
          ok: false,
          response: "",
          error: cmdErr instanceof Error ? cmdErr.message : String(cmdErr),
        };
      }
    }

    return {
      ok: true,
      results,
      latencyMs: Date.now() - startTime,
    };
  } catch (err: unknown) {
    return {
      ok: false,
      results,
      error: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - startTime,
    };
  } finally {
    client.destroy();
  }
}

// ----------------------------------------------------------------------------
// Output Parsers
// ----------------------------------------------------------------------------

export function parsePlayerListOutput(raw: string): { online: number; max: number; list: string[] } {
  const clean = stripMinecraftFormatting(raw);
  let online = 0;
  let max = 0;
  let list: string[] = [];

  // Match: "There are 2 of a max of 20 players online:" or "Online: 2/20:"
  const countMatch = clean.match(/(?:There are|Online:?)\s*(\d+)\s*(?:of a max of|\/)\s*(\d+)/i);
  if (countMatch) {
    online = parseInt(countMatch[1], 10);
    max = parseInt(countMatch[2], 10);
  }

  const colonIdx = clean.indexOf(":");
  if (colonIdx !== -1) {
    const playersPart = clean.slice(colonIdx + 1).trim();
    if (playersPart) {
      list = playersPart
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
    }
  }

  return { online, max, list };
}

export function parseTimeQueryOutput(raw: string): { ticks: number; timeOfDay: string; dayCount: number } {
  const clean = stripMinecraftFormatting(raw);
  const match = clean.match(/(\d+)/);
  const ticks = match ? parseInt(match[1], 10) : 0;

  // Day tick calculation: 0 = 6:00 AM, 6000 = 12:00 PM, 12000 = 6:00 PM, 18000 = Midnight
  const dayTick = ticks % 24000;
  const dayCount = Math.floor(ticks / 24000) + 1;

  let timeOfDay = "Day";
  if (dayTick >= 0 && dayTick < 1000) timeOfDay = "Sunrise / Morning";
  else if (dayTick >= 1000 && dayTick < 6000) timeOfDay = "Day / Morning";
  else if (dayTick >= 6000 && dayTick < 11500) timeOfDay = "Noon / Afternoon";
  else if (dayTick >= 11500 && dayTick < 13500) timeOfDay = "Sunset / Dusk";
  else if (dayTick >= 13500 && dayTick < 18000) timeOfDay = "Night";
  else timeOfDay = "Midnight";

  return { ticks, timeOfDay, dayCount };
}

export function parseDifficultyOutput(raw: string): string {
  const clean = stripMinecraftFormatting(raw);
  const match = clean.match(/The difficulty is\s+([a-zA-Z]+)/i) || clean.match(/Difficulty:\s*([a-zA-Z]+)/i);
  if (match) return match[1].toLowerCase();
  return clean.toLowerCase().includes("hard")
    ? "hard"
    : clean.toLowerCase().includes("normal")
    ? "normal"
    : clean.toLowerCase().includes("easy")
    ? "easy"
    : clean.toLowerCase().includes("peaceful")
    ? "peaceful"
    : "normal";
}

export function parseSeedOutput(raw: string): string {
  const clean = stripMinecraftFormatting(raw);
  const match = clean.match(/Seed:\s*\[?(-?\d+)\]?/i);
  return match ? match[1] : clean.replace(/^Seed:\s*/i, "");
}

export function parseWhitelistOutput(raw: string): { enabled?: boolean; players: string[] } {
  const clean = stripMinecraftFormatting(raw);
  const colonIdx = clean.indexOf(":");
  let players: string[] = [];
  if (colonIdx !== -1) {
    const listPart = clean.slice(colonIdx + 1).trim();
    if (listPart) {
      players = listPart
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
    }
  }
  return { players };
}

export function parseBanlistOutput(raw: string): string[] {
  const clean = stripMinecraftFormatting(raw);
  const colonIdx = clean.indexOf(":");
  if (colonIdx === -1) return [];
  const listPart = clean.slice(colonIdx + 1).trim();
  if (!listPart) return [];
  return listPart
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Fetches comprehensive live overview of the Minecraft server via RCON.
 */
export async function getMinecraftServerOverview(): Promise<MinecraftServerOverview> {
  const config = getMinecraftRconConfig();
  const now = new Date().toISOString();

  if (!config.password) {
    return {
      connected: false,
      host: config.host,
      port: config.port,
      hasPassword: false,
      latencyMs: 0,
      error: "MINECRAFT_RCON_PASSWORD is not configured in .env",
      players: { online: 0, max: 0, list: [] },
      lastChecked: now,
    };
  }

  // Execute batch status query
  const batchRes = await executeRconBatch(
    [
      "list",
      "version",
      "difficulty",
      "time query daytime",
      "time query day",
      "seed",
      "whitelist list",
      "banlist players",
      "banlist ips",
    ],
    config,
    7000
  );

  if (!batchRes.ok) {
    return {
      connected: false,
      host: config.host,
      port: config.port,
      hasPassword: true,
      latencyMs: batchRes.latencyMs,
      error: batchRes.error || "Failed to reach Minecraft RCON on port 25575",
      players: { online: 0, max: 0, list: [] },
      lastChecked: now,
    };
  }

  const r = batchRes.results;
  const listData = r["list"]?.ok ? parsePlayerListOutput(r["list"].response) : { online: 0, max: 0, list: [] };
  const timeData = r["time query daytime"]?.ok
    ? parseTimeQueryOutput(r["time query daytime"].response)
    : undefined;
  const difficulty = r["difficulty"]?.ok ? parseDifficultyOutput(r["difficulty"].response) : undefined;
  const seed = r["seed"]?.ok ? parseSeedOutput(r["seed"].response) : undefined;
  const whitelist = r["whitelist list"]?.ok ? parseWhitelistOutput(r["whitelist list"].response) : undefined;
  const bannedPlayers = r["banlist players"]?.ok ? parseBanlistOutput(r["banlist players"].response) : [];
  const bannedIps = r["banlist ips"]?.ok ? parseBanlistOutput(r["banlist ips"].response) : [];
  const version = r["version"]?.ok ? stripMinecraftFormatting(r["version"].response) : undefined;

  return {
    connected: true,
    host: config.host,
    port: config.port,
    hasPassword: true,
    latencyMs: batchRes.latencyMs,
    version,
    players: listData,
    time: timeData,
    difficulty,
    seed,
    whitelist,
    bannedPlayers,
    bannedIps,
    lastChecked: now,
  };
}
