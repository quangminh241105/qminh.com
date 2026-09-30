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
