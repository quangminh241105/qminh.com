"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Terminal,
  Users,
  Shield,
  Volume2,
  Settings,
  Clock,
  CloudRain,
  Sun,
  Moon,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Zap,
  MessageSquare,
  Send,
  Skull,
  Compass,
  Radio,
  FileText,
  Play,
} from "lucide-react";
import {
  getMinecraftStatusAction,
  executeMinecraftCommandAction,
  setMinecraftTimeAction,
  setMinecraftWeatherAction,
  setMinecraftDifficultyAction,
  playerActionServerAction,
  broadcastServerAction,
  playSoundServerAction,
  whitelistServerAction,
  banManagementServerAction,
  gameruleServerAction,
  worldSaveServerAction,
  worldBorderServerAction,
  serverLifecycleAction,
  type PlayerActionType,
} from "@/app/admin/minecraft-actions";
import {
  parseMinecraftColors,
  type MinecraftServerOverview,
} from "@/lib/minecraft-types";

type McTab =
  | "console"
  | "players"
  | "world"
  | "access"
  | "broadcast"
  | "utilities"
  | "config";

interface ConsoleLogEntry {
  id: string;
  timestamp: string;
  type: "command" | "response" | "system" | "error";
  text: string;
  latencyMs?: number;
}

const COMMON_ITEMS = [
  { id: "minecraft:diamond", name: "Diamond", count: 64 },
  { id: "minecraft:netherite_ingot", name: "Netherite Ingot", count: 16 },
  { id: "minecraft:golden_apple", name: "Golden Apple", count: 32 },
  { id: "minecraft:elytra", name: "Elytra", count: 1 },
  { id: "minecraft:totem_of_undying", name: "Totem of Undying", count: 1 },
  { id: "minecraft:cooked_beef", name: "Cooked Beef", count: 64 },
  { id: "minecraft:iron_ingot", name: "Iron Ingot", count: 64 },
  { id: "minecraft:torch", name: "Torches", count: 64 },
  { id: "minecraft:emerald", name: "Emerald", count: 64 },
];

const COMMON_SOUNDS = [
  { id: "minecraft:block.bell.use", name: "Bell Toll", desc: "Town bell ring" },
  { id: "minecraft:entity.experience_orb.pickup", name: "Experience Ding", desc: "Classic XP chime" },
  { id: "minecraft:ui.toast.challenge_complete", name: "Challenge Complete", desc: "Advancement fanfare" },
  { id: "minecraft:entity.player.levelup", name: "Level Up", desc: "Level up fanfare" },
  { id: "minecraft:entity.ender_dragon.growl", name: "Dragon Roar", desc: "Deep ominous roar" },
  { id: "minecraft:entity.wither.spawn", name: "Wither Spawn", desc: "Dramatic boss boom" },
  { id: "minecraft:event.raid.horn", name: "Raid Horn", desc: "Illager war horn" },
  { id: "minecraft:block.anvil.land", name: "Anvil Clang", desc: "Heavy metal drop" },
];

const GAMERULES_LIST = [
  { rule: "keepInventory", desc: "Players keep items & XP upon death", type: "boolean" },
  { rule: "mobGriefing", desc: "Creepers/Endermen destroy terrain", type: "boolean" },
  { rule: "doDaylightCycle", desc: "Natural day/night cycle progresses", type: "boolean" },
  { rule: "doWeatherCycle", desc: "Rain and storms occur naturally", type: "boolean" },
  { rule: "doFireTick", desc: "Fire spreads and burns out", type: "boolean" },
  { rule: "doMobSpawning", desc: "Monsters and animals spawn naturally", type: "boolean" },
  { rule: "showDeathMessages", desc: "Broadcast death messages in chat", type: "boolean" },
  { rule: "naturalRegeneration", desc: "Health heals when hunger is full", type: "boolean" },
  { rule: "fallDamage", desc: "Players take fall damage", type: "boolean" },
  { rule: "fireDamage", desc: "Damage from fire and lava", type: "boolean" },
  { rule: "drowningDamage", desc: "Damage from lack of oxygen", type: "boolean" },
  { rule: "doTileDrops", desc: "Blocks drop items when mined", type: "boolean" },
  { rule: "commandBlockOutput", desc: "Broadcast command block feedback", type: "boolean" },
  { rule: "randomTickSpeed", desc: "Speed of crop growth (default: 3)", type: "number" },
  { rule: "spawnRadius", desc: "Spawn protection radius in blocks", type: "number" },
];

export default function MinecraftManager() {
  const [activeTab, setActiveTab] = useState<McTab>("console");
  const [status, setStatus] = useState<MinecraftServerOverview | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Console state
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLogEntry[]>([
    {
      id: "init",
      timestamp: new Date().toLocaleTimeString(),
      type: "system",
      text: "RCON Terminal Initialized. Connecting to Minecraft server on port 25575...",
    },
  ]);
  const [commandInput, setCommandInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecutingCmd, setIsExecutingCmd] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Player action modal state
  const [playerActionModal, setPlayerActionModal] = useState<{
    type: PlayerActionType;
    player: string;
  } | null>(null);
  const [modalInput, setModalInput] = useState("");
  const [modalItem, setModalItem] = useState("minecraft:diamond");
  const [modalAmount, setModalAmount] = useState(1);
  const [tpCoords, setTpCoords] = useState({ x: "0", y: "64", z: "0" });

  // Whitelist & Ban form state
  const [newWhitelistUser, setNewWhitelistUser] = useState("");
  const [newBanUser, setNewBanUser] = useState("");
  const [banReason, setBanReason] = useState("");
  const [newBanIp, setNewBanIp] = useState("");
  const [ipBanReason, setIpBanReason] = useState("");

  // Broadcast state
  const [chatBroadcast, setChatBroadcast] = useState("");
  const [titleText, setTitleText] = useState("");
  const [subtitleText, setSubtitleText] = useState("");
  const [titleColor, setTitleColor] = useState("gold");
  const [actionbarText, setActionbarText] = useState("");

  // Utilities state
  const [borderSize, setBorderSize] = useState("5000");
  const [borderCenter, setBorderCenter] = useState({ x: "0", z: "0" });
  const [copiedSeed, setCopiedSeed] = useState(false);

  // Gamerule values cache
  const [gameruleValues, setGameruleValues] = useState<Record<string, string>>({});

  const showToast = useCallback((text: string, type: "success" | "error" = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4500);
  }, []);

  const addConsoleLog = useCallback((type: ConsoleLogEntry["type"], text: string, latencyMs?: number) => {
    setConsoleLogs((prev) => [
      ...prev.slice(-300), // Keep up to 300 logs
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        type,
        text,
        latencyMs,
      },
    ]);
  }, []);

  // Fetch server status
  const refreshStatus = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoadingStatus(true);
    try {
      const data = await getMinecraftStatusAction();
      setStatus(data);
      if (data.connected) {
        if (!quiet) {
          addConsoleLog("system", `✓ Connected to ${data.version || "Minecraft"} (Latency: ${data.latencyMs}ms)`);
        }
      } else {
        if (!quiet) {
          addConsoleLog("error", `✗ RCON Offline: ${data.error || "Cannot reach server on 127.0.0.1:25575"}`);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (!quiet) {
        addConsoleLog("error", `Failed to query RCON status: ${message}`);
        showToast(message, "error");
      }
    } finally {
      if (!quiet) setIsLoadingStatus(false);
    }
  }, [addConsoleLog, showToast]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Auto-scroll terminal
  useEffect(() => {
    if (autoScroll && activeTab === "console") {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLogs, autoScroll, activeTab]);

  // Execute terminal command
  const handleExecuteCommand = async (cmdToRun?: string) => {
    const raw = cmdToRun !== undefined ? cmdToRun : commandInput;
    const trimmed = raw.trim();
    if (!trimmed || isExecutingCmd) return;

    const formattedCmd = trimmed.replace(/^\//, "");
    setIsExecutingCmd(true);
    addConsoleLog("command", `> /${formattedCmd}`);

    if (cmdToRun === undefined) {
      setCommandHistory((prev) => [trimmed, ...prev.filter((c) => c !== trimmed)].slice(0, 50));
      setHistoryIndex(-1);
      setCommandInput("");
    }

    try {
      const result = await executeMinecraftCommandAction(formattedCmd);
      if (result.ok) {
        addConsoleLog("response", result.response || "[No response from server]", result.latencyMs);
      } else {
        addConsoleLog("error", result.error || "Command execution failed.", result.latencyMs);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addConsoleLog("error", `Error: ${msg}`);
    } finally {
      setIsExecutingCmd(false);
    }
  };

  // Keyboard history navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setCommandInput(commandHistory[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const prevIdx = historyIndex - 1;
        setHistoryIndex(prevIdx);
        setCommandInput(commandHistory[prevIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput("");
      }
    }
  };

  // World Time Action
  const handleSetTime = async (time: string | number) => {
    try {
      const res = await setMinecraftTimeAction(time);
      if (res.ok) {
        showToast(`Time set: ${res.response}`);
        addConsoleLog("response", res.response);
        refreshStatus(true);
      } else {
        showToast(res.error, "error");
      }
    } catch (err: unknown) {
      showToast(String(err), "error");
    }
  };

  // Weather Action
  const handleSetWeather = async (weather: "clear" | "rain" | "thunder") => {
    try {
      const res = await setMinecraftWeatherAction(weather);
      if (res.ok) {
        showToast(`Weather set to ${weather}: ${res.response}`);
        addConsoleLog("response", res.response);
      } else {
        showToast(res.error, "error");
      }
    } catch (err: unknown) {
      showToast(String(err), "error");
    }
  };

  // Difficulty Action
  const handleSetDifficulty = async (difficulty: "peaceful" | "easy" | "normal" | "hard") => {
    try {
      const res = await setMinecraftDifficultyAction(difficulty);
      if (res.ok) {
        showToast(`Difficulty set: ${res.response}`);
        addConsoleLog("response", res.response);
        refreshStatus(true);
      } else {
        showToast(res.error, "error");
      }
    } catch (err: unknown) {
      showToast(String(err), "error");
    }
  };

  // Execute Player Action
  const handlePlayerAction = async (type: PlayerActionType, player: string) => {
    try {
      const res = await playerActionServerAction(type, {
        player,
        reason: modalInput,
        mode: modalInput as "survival" | "creative" | "adventure" | "spectator",
        message: modalInput,
        item: modalItem,
        amount: modalAmount,
        coords: tpCoords,
      });

      if (res.ok) {
        showToast(`Action ${type} succeeded: ${res.response}`);
        addConsoleLog("response", res.response);
        setPlayerActionModal(null);
        setModalInput("");
        refreshStatus(true);
      } else {
        showToast(res.error, "error");
      }
    } catch (err: unknown) {
      showToast(String(err), "error");
    }
  };

  // Query / Set Gamerule
  const handleGamerule = async (rule: string, value?: string | boolean | number) => {
    try {
      const res = await gameruleServerAction(rule, value);
      if (res.ok) {
        showToast(`Gamerule ${rule}: ${res.response}`);
        addConsoleLog("response", res.response);
        if (value !== undefined) {
          setGameruleValues((prev) => ({ ...prev, [rule]: String(value) }));
        }
      } else {
        showToast(res.error, "error");
      }
    } catch (err: unknown) {
      showToast(String(err), "error");
    }
  };

  // Whitelist Actions
  const handleWhitelist = async (action: "on" | "off" | "add" | "remove" | "reload", player?: string) => {
    try {
      const res = await whitelistServerAction(action, player);
      if (res.ok) {
        showToast(`Whitelist ${action}: ${res.response}`);
        addConsoleLog("response", res.response);
        if (action === "add") setNewWhitelistUser("");
        refreshStatus(true);
      } else {
        showToast(res.error, "error");
      }
    } catch (err: unknown) {
      showToast(String(err), "error");
    }
  };

  // Ban Actions
  const handleBan = async (action: "ban" | "ban-ip" | "pardon" | "pardon-ip", target: string, reason?: string) => {
    try {
      const res = await banManagementServerAction(action, target, reason);
      if (res.ok) {
        showToast(`Ban action ${action}: ${res.response}`);
        addConsoleLog("response", res.response);
        if (action === "ban") {
          setNewBanUser("");
          setBanReason("");
        }
        if (action === "ban-ip") {
          setNewBanIp("");
          setIpBanReason("");
        }
        refreshStatus(true);
      } else {
        showToast(res.error, "error");
      }
    } catch (err: unknown) {
      showToast(String(err), "error");
    }
  };

  // Broadcast
  const handleBroadcast = async (type: "say" | "title" | "subtitle" | "actionbar") => {
    try {
      let msg = chatBroadcast;
      if (type === "title") msg = titleText;
      if (type === "subtitle") msg = subtitleText;
      if (type === "actionbar") msg = actionbarText;

      const res = await broadcastServerAction({
        type,
        message: msg,
        color: titleColor,
      });

      if (res.ok) {
        showToast(`Broadcast sent!`);
        addConsoleLog("response", `[Broadcast] ${msg}`);
        if (type === "say") setChatBroadcast("");
        if (type === "title") setTitleText("");
        if (type === "subtitle") setSubtitleText("");
        if (type === "actionbar") setActionbarText("");
      } else {
        showToast(res.error, "error");
      }
    } catch (err: unknown) {
      showToast(String(err), "error");
    }
  };

  // Play Sound
  const handlePlaySound = async (soundId: string) => {
    try {
      const res = await playSoundServerAction(soundId);
      if (res.ok) {
        showToast(`Played ${soundId}`);
        addConsoleLog("response", `Played sound: ${soundId}`);
      } else {
        showToast(res.error, "error");
      }
    } catch (err: unknown) {
      showToast(String(err), "error");
    }
  };

  // Save World
  const handleSaveWorld = async (action: "save-all" | "save-off" | "save-on") => {
    try {
      const res = await worldSaveServerAction(action);
      if (res.ok) {
        showToast(`World save (${action}): ${res.response}`);
        addConsoleLog("response", res.response);
      } else {
        showToast(res.error, "error");
      }
    } catch (err: unknown) {
      showToast(String(err), "error");
    }
  };

  // World Border
  const handleSetWorldBorder = async () => {
    try {
      const sizeNum = parseInt(borderSize, 10);
      if (isNaN(sizeNum)) throw new Error("Invalid border size number");
      const res = await worldBorderServerAction("set", sizeNum);
      if (res.ok) {
        showToast(`World border set to ${sizeNum} blocks`);
        addConsoleLog("response", res.response);
      } else {
        showToast(res.error, "error");
      }
    } catch (err: unknown) {
      showToast(String(err), "error");
    }
  };

  const handleCenterWorldBorder = async () => {
    try {
      const x = parseInt(borderCenter.x, 10);
      const z = parseInt(borderCenter.z, 10);
      if (isNaN(x) || isNaN(z)) throw new Error("Invalid border coordinates");
      const res = await worldBorderServerAction("center", undefined, x, z);
      if (res.ok) {
        showToast(`World border centered at ${x}, ${z}`);
        addConsoleLog("response", res.response);
      } else {
        showToast(res.error, "error");
      }
    } catch (err: unknown) {
      showToast(String(err), "error");
    }
  };

  // Reload / Stop Server
  const handleServerAction = async (action: "reload" | "stop") => {
    if (action === "stop") {
      const confirmText = prompt("CRITICAL: Type 'CONFIRM' to immediately shut down the Minecraft server via RCON:");
      if (confirmText !== "CONFIRM") return;
    }

    try {
      const res = await serverLifecycleAction(action);
      if (res.ok) {
        showToast(`Server ${action} executed`);
        addConsoleLog("response", res.response);
      } else {
        showToast(res.error, "error");
      }
    } catch (err: unknown) {
      showToast(String(err), "error");
    }
  };

  const isConnected = Boolean(status?.connected);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`border-2 p-3 font-mono text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0px_#000000] ${
            statusMessage.type === "success"
              ? "border-black bg-[#ffe600] text-black"
              : "border-red-600 bg-red-100 text-red-800"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* RCON Telemetry & Server Header Card */}
      <div className="border-2 border-black bg-white p-5 shadow-[5px_5px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-block h-3.5 w-3.5 border border-black ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
                aria-label={isConnected ? "RCON Online" : "RCON Offline"}
              />
              <h2 className="font-mono text-lg font-black uppercase tracking-wider text-black dark:text-[#ffe600]">
                Minecraft Server Control (RCON Port 25575)
              </h2>
              <span
                className={`border border-black px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                  isConnected
                    ? "bg-[#22c55e] text-black"
                    : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
                }`}
              >
                {isConnected ? "ONLINE & READY" : "OFFLINE / UNREACHABLE"}
              </span>
            </div>

            <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
              Host: <span className="font-bold text-black dark:text-white">127.0.0.1:25575</span> (Same Host Server) •
              Latency:{" "}
              <span className="font-bold text-black dark:text-white">
                {status?.latencyMs !== undefined ? `${status.latencyMs}ms` : "—"}
              </span>{" "}
              • Core:{" "}
              <span className="font-bold text-black dark:text-white">
                {status?.version ? status.version.slice(0, 40) : "Minecraft"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => refreshStatus(false)}
              disabled={isLoadingStatus}
              className="inline-flex items-center gap-1.5 border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[2px_2px_0px_#000000] hover:bg-[#ffe600] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingStatus ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => handleSaveWorld("save-all")}
              disabled={!isConnected}
              className="inline-flex items-center gap-1.5 border-2 border-black bg-[#ffe600] px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[2px_2px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <SaveIcon className="h-3.5 w-3.5" />
              <span>Save World</span>
            </button>

            <button
              onClick={() => handleServerAction("stop")}
              disabled={!isConnected}
              className="inline-flex items-center gap-1.5 border-2 border-black bg-red-100 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-red-700 shadow-[2px_2px_0px_#000000] hover:bg-red-200 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Skull className="h-3.5 w-3.5" />
              <span>Stop Server</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5 border-t-2 border-black pt-4 dark:border-zinc-700">
          <div className="border border-black bg-zinc-50 p-2.5 dark:bg-zinc-800 dark:border-zinc-700">
            <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">Players Online</p>
            <p className="font-mono text-lg font-black text-black dark:text-white">
              {status?.players ? `${status.players.online} / ${status.players.max}` : "0 / 0"}
            </p>
          </div>

          <div className="border border-black bg-zinc-50 p-2.5 dark:bg-zinc-800 dark:border-zinc-700">
            <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">Time of Day</p>
            <p className="font-mono text-xs font-black uppercase text-black dark:text-white truncate">
              {status?.time?.timeOfDay || "Unknown"}
            </p>
            <p className="font-mono text-[9px] text-zinc-500">
              {status?.time ? `Day ${status.time.dayCount} (${status.time.ticks} ticks)` : ""}
            </p>
          </div>

          <div className="border border-black bg-zinc-50 p-2.5 dark:bg-zinc-800 dark:border-zinc-700">
            <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">Difficulty</p>
            <p className="font-mono text-sm font-black uppercase text-black dark:text-white">
              {status?.difficulty || "Normal"}
            </p>
          </div>

          <div className="border border-black bg-zinc-50 p-2.5 dark:bg-zinc-800 dark:border-zinc-700">
            <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">Whitelisted</p>
            <p className="font-mono text-sm font-black text-black dark:text-white">
              {status?.whitelist?.players.length || 0} players
            </p>
          </div>

          <div className="border border-black bg-zinc-50 p-2.5 dark:bg-zinc-800 dark:border-zinc-700 col-span-2 sm:col-span-4 lg:col-span-1">
            <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">RCON Password</p>
            <p className="font-mono text-xs font-black text-black dark:text-white flex items-center gap-1">
              {status?.hasPassword ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-600" />
                  <span>Set in .env</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                  <span className="text-red-600">Missing in .env</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Offline Warning Banner */}
        {!isConnected && (
          <div className="mt-4 border-2 border-red-600 bg-red-50 p-3 font-mono text-xs text-red-950 dark:bg-red-950/40 dark:text-red-100">
            <p className="font-black uppercase tracking-wider">Cannot Connect to Minecraft RCON on Port 25575</p>
            <p className="mt-1 leading-relaxed text-[11px]">
              {status?.error || "Connection refused. Please ensure the Minecraft server is running on the host machine and enable-rcon=true with rcon.port=25575 is configured in server.properties."}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setActiveTab("config")}
                className="underline font-bold text-red-800 dark:text-red-200 cursor-pointer"
              >
                View Setup & Configuration Guide →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Minecraft Sub-Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b-2 border-black pb-2 dark:border-zinc-700">
        {[
          { id: "console", label: "Interactive Console", icon: Terminal },
          { id: "players", label: `Players (${status?.players?.online || 0})`, icon: Users },
          { id: "world", label: "World & Environment", icon: Sun },
          { id: "access", label: "Whitelist & Bans", icon: Shield },
          { id: "broadcast", label: "Broadcast & Alerts", icon: Volume2 },
          { id: "utilities", label: "World Utilities", icon: Settings },
          { id: "config", label: "RCON Settings & Guide", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as McTab)}
              className={`inline-flex items-center gap-2 border-2 border-black px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? "bg-[#ffe600] text-black shadow-[3px_3px_0px_#000000] -translate-y-0.5"
                  : "bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: INTERACTIVE CONSOLE */}
      {activeTab === "console" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm font-black uppercase tracking-wider text-black dark:text-white">
              Live RCON Terminal (Port 25575)
            </h3>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 font-mono text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="accent-black dark:accent-[#ffe600]"
                />
                <span>Auto-scroll</span>
              </label>
              <button
                onClick={() => setConsoleLogs([])}
                className="border-2 border-black bg-white px-2.5 py-1 font-mono text-[11px] font-bold uppercase shadow-[2px_2px_0px_#000000] hover:bg-zinc-100 cursor-pointer dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
              >
                Clear Terminal
              </button>
            </div>
          </div>

          {/* Terminal Window */}
          <div className="border-2 border-black bg-black p-4 font-mono shadow-[5px_5px_0px_#000000] dark:border-[#ffe600]">
            <div className="h-96 overflow-y-auto space-y-1.5 text-xs text-[#55FF55]">
              {consoleLogs.map((log) => {
                const chunks = parseMinecraftColors(log.text);
                return (
                  <div key={log.id} className="leading-relaxed break-words flex gap-2">
                    <span className="text-zinc-500 shrink-0 select-none">[{log.timestamp}]</span>
                    {log.type === "command" && (
                      <span className="text-[#FFFF55] font-bold">{log.text}</span>
                    )}
                    {log.type === "system" && (
                      <span className="text-[#55FFFF] italic">{log.text}</span>
                    )}
                    {log.type === "error" && (
                      <span className="text-[#FF5555] font-bold">{log.text}</span>
                    )}
                    {log.type === "response" && (
                      <span>
                        {chunks.length > 0 ? (
                          chunks.map((c, i) => (
                            <span
                              key={i}
                              style={{
                                color: c.color || "#FFFFFF",
                                fontWeight: c.bold ? "bold" : "normal",
                                fontStyle: c.italic ? "italic" : "normal",
                                textDecoration: c.underlined ? "underline" : "none",
                              }}
                            >
                              {c.text}
                            </span>
                          ))
                        ) : (
                          <span className="text-zinc-200">{log.text}</span>
                        )}
                        {log.latencyMs !== undefined && (
                          <span className="ml-2 text-[10px] text-zinc-600 select-none">
                            ({log.latencyMs}ms)
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteCommand();
              }}
              className="mt-3 flex gap-2 border-t-2 border-zinc-800 pt-3"
            >
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-[#55FF55] select-none">
                  /
                </span>
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isExecutingCmd}
                  placeholder="Enter Minecraft command (e.g. list, seed, weather clear, say Hello!)..."
                  className="w-full border-2 border-black bg-zinc-950 pl-7 pr-3 py-2 font-mono text-sm text-[#55FF55] focus:outline-none focus:border-[#ffe600] dark:border-zinc-700"
                />
              </div>
              <button
                type="submit"
                disabled={isExecutingCmd || !commandInput.trim()}
                className="inline-flex items-center gap-1.5 border-2 border-black bg-[#ffe600] px-4 py-2 font-mono text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{isExecutingCmd ? "Sending..." : "Execute"}</span>
              </button>
            </form>
          </div>

          {/* Quick Command Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[11px] font-bold uppercase text-zinc-500 mr-1">
              Quick Commands:
            </span>
            {[
              "list",
              "version",
              "seed",
              "tps",
              "time query daytime",
              "weather clear",
              "difficulty",
              "whitelist list",
              "banlist players",
              "save-all",
              "help",
            ].map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleExecuteCommand(cmd)}
                disabled={isExecutingCmd}
                className="border border-black bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-black shadow-[2px_2px_0px_#000000] hover:bg-[#ffe600] cursor-pointer dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700"
              >
                /{cmd}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PLAYERS MANAGEMENT */}
      {activeTab === "players" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm font-black uppercase tracking-wider text-black dark:text-white">
              Online Players ({status?.players?.online || 0} / {status?.players?.max || 20})
            </h3>
            <button
              onClick={() => refreshStatus(false)}
              className="inline-flex items-center gap-1 border border-black bg-white px-3 py-1 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#000000] hover:bg-zinc-100 cursor-pointer dark:bg-zinc-800 dark:text-white"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh Player List</span>
            </button>
          </div>

          {/* Players Cards Grid */}
          {status?.players?.list && status.players.list.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {status.players.list.map((playerName) => (
                <div
                  key={playerName}
                  className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <div className="flex items-center gap-3">
                    {/* Minecraft Skin Avatar */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://mc-heads.net/avatar/${encodeURIComponent(playerName)}/48`}
                      alt={playerName}
                      className="h-12 w-12 border-2 border-black bg-zinc-200 shadow-[2px_2px_0px_#000000]"
                      onError={(e) => {
                        // Fallback placeholder
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%23ffe600'/%3E%3C/svg%3E";
                      }}
                    />
                    <div>
                      <h4 className="font-mono text-base font-black text-black dark:text-[#ffe600]">
                        {playerName}
                      </h4>
                      <p className="font-mono text-[11px] text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        Online Now
                      </p>
                    </div>
                  </div>

                  {/* Player Quick Actions */}
                  <div className="mt-4 border-t-2 border-black pt-3 dark:border-zinc-700 space-y-2">
                    <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">Gamemode</p>
                    <div className="grid grid-cols-4 gap-1">
                      {(["survival", "creative", "adventure", "spectator"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => {
                            setModalInput(mode);
                            handlePlayerAction("gamemode", playerName);
                          }}
                          className="border border-black bg-white py-1 font-mono text-[10px] font-bold uppercase hover:bg-[#ffe600] cursor-pointer dark:bg-zinc-800 dark:text-white"
                        >
                          {mode.slice(0, 4)}
                        </button>
                      ))}
                    </div>

                    <p className="font-mono text-[10px] font-bold uppercase text-zinc-500 pt-1">Admin Tools</p>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => handlePlayerAction("op", playerName)}
                        className="border border-black bg-white py-1 font-mono text-[10px] font-bold uppercase hover:bg-zinc-100 cursor-pointer dark:bg-zinc-800 dark:text-white"
                      >
                        OP
                      </button>
                      <button
                        onClick={() => handlePlayerAction("deop", playerName)}
                        className="border border-black bg-white py-1 font-mono text-[10px] font-bold uppercase hover:bg-zinc-100 cursor-pointer dark:bg-zinc-800 dark:text-white"
                      >
                        De-OP
                      </button>
                      <button
                        onClick={() => handlePlayerAction("heal", playerName)}
                        className="border border-black bg-white py-1 font-mono text-[10px] font-bold uppercase hover:bg-green-100 text-green-700 cursor-pointer dark:bg-zinc-800 dark:text-green-400"
                      >
                        Heal
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1">
                      <button
                        onClick={() => {
                          setPlayerActionModal({ type: "msg", player: playerName });
                        }}
                        className="border border-black bg-white py-1 font-mono text-[10px] font-bold uppercase hover:bg-zinc-100 cursor-pointer dark:bg-zinc-800 dark:text-white"
                      >
                        Whisper
                      </button>
                      <button
                        onClick={() => {
                          setPlayerActionModal({ type: "give", player: playerName });
                        }}
                        className="border border-black bg-white py-1 font-mono text-[10px] font-bold uppercase hover:bg-zinc-100 cursor-pointer dark:bg-zinc-800 dark:text-white"
                      >
                        Give
                      </button>
                      <button
                        onClick={() => {
                          setPlayerActionModal({ type: "tp", player: playerName });
                        }}
                        className="border border-black bg-white py-1 font-mono text-[10px] font-bold uppercase hover:bg-zinc-100 cursor-pointer dark:bg-zinc-800 dark:text-white"
                      >
                        Teleport
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1 pt-1">
                      <button
                        onClick={() => {
                          setPlayerActionModal({ type: "kick", player: playerName });
                        }}
                        className="border border-black bg-amber-100 py-1 font-mono text-[10px] font-bold uppercase text-amber-900 hover:bg-amber-200 cursor-pointer"
                      >
                        Kick
                      </button>
                      <button
                        onClick={() => {
                          setPlayerActionModal({ type: "ban", player: playerName });
                        }}
                        className="border border-black bg-red-100 py-1 font-mono text-[10px] font-bold uppercase text-red-900 hover:bg-red-200 cursor-pointer"
                      >
                        Ban
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900">
              <Users className="mx-auto h-10 w-10 text-zinc-400" />
              <p className="mt-3 font-mono text-sm font-bold uppercase text-zinc-600 dark:text-zinc-300">
                No Players Online Right Now
              </p>
              <p className="mt-1 font-mono text-xs text-zinc-500">
                When players join your Minecraft server, they will appear here with one-click admin actions.
              </p>
            </div>
          )}

          {/* Offline / Direct Player Action Bar */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 space-y-4">
            <h4 className="font-mono text-xs font-black uppercase tracking-wider text-black dark:text-white">
              Target Specific Player (Online or Offline)
            </h4>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Enter player username..."
                id="targetPlayerInput"
                className="flex-1 min-w-[200px] border-2 border-black bg-white p-2 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
              />
              <button
                onClick={() => {
                  const input = (document.getElementById("targetPlayerInput") as HTMLInputElement)?.value.trim();
                  if (input) handleWhitelist("add", input);
                }}
                className="border-2 border-black bg-[#ffe600] px-3 py-1.5 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                Whitelist
              </button>
              <button
                onClick={() => {
                  const input = (document.getElementById("targetPlayerInput") as HTMLInputElement)?.value.trim();
                  if (input) handleBan("pardon", input);
                }}
                className="border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#000000] cursor-pointer dark:bg-zinc-800 dark:text-white"
              >
                Pardon
              </button>
              <button
                onClick={() => {
                  const input = (document.getElementById("targetPlayerInput") as HTMLInputElement)?.value.trim();
                  if (input) handleBan("ban", input, "Banned by administrator");
                }}
                className="border-2 border-black bg-red-100 text-red-800 px-3 py-1.5 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                Ban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WORLD & ENVIRONMENT */}
      {activeTab === "world" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Time Controls */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3 dark:border-zinc-700">
              <Clock className="h-5 w-5 text-[#ffe600]" />
              <h4 className="font-mono text-sm font-black uppercase text-black dark:text-white">
                World Time Controls
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { label: "Sunrise", ticks: 1000, icon: Sun },
                { label: "Noon", ticks: 6000, icon: Sun },
                { label: "Sunset", ticks: 12000, icon: SunsetIcon },
                { label: "Night", ticks: 13000, icon: Moon },
                { label: "Midnight", ticks: 18000, icon: Moon },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.label}
                    onClick={() => handleSetTime(t.ticks)}
                    className="flex flex-col items-center justify-center p-3 border-2 border-black bg-zinc-50 shadow-[2px_2px_0px_#000000] hover:bg-[#ffe600] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                  >
                    <Icon className="h-5 w-5 mb-1 text-black dark:text-[#ffe600]" />
                    <span className="font-mono text-xs font-black uppercase">{t.label}</span>
                    <span className="font-mono text-[9px] text-zinc-500">{t.ticks} ticks</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleExecuteCommand("time add 1000")}
                className="flex-1 border-2 border-black bg-white py-1.5 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#000000] hover:bg-zinc-100 cursor-pointer dark:bg-zinc-800 dark:text-white"
              >
                +1,000 Ticks
              </button>
              <button
                onClick={() => handleExecuteCommand("time add 6000")}
                className="flex-1 border-2 border-black bg-white py-1.5 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#000000] hover:bg-zinc-100 cursor-pointer dark:bg-zinc-800 dark:text-white"
              >
                +6,000 Ticks (1/4 Day)
              </button>
            </div>
          </div>

          {/* Weather & Difficulty */}
          <div className="space-y-6">
            {/* Weather */}
            <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-black pb-3 dark:border-zinc-700">
                <CloudRain className="h-5 w-5 text-blue-500" />
                <h4 className="font-mono text-sm font-black uppercase text-black dark:text-white">
                  Weather Control
                </h4>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSetWeather("clear")}
                  className="flex flex-col items-center justify-center p-3 border-2 border-black bg-zinc-50 shadow-[2px_2px_0px_#000000] hover:bg-[#ffe600] cursor-pointer dark:bg-zinc-800 dark:text-white"
                >
                  <Sun className="h-5 w-5 mb-1 text-amber-500" />
                  <span className="font-mono text-xs font-bold uppercase">Clear Sky</span>
                </button>

                <button
                  onClick={() => handleSetWeather("rain")}
                  className="flex flex-col items-center justify-center p-3 border-2 border-black bg-zinc-50 shadow-[2px_2px_0px_#000000] hover:bg-blue-100 cursor-pointer dark:bg-zinc-800 dark:text-white"
                >
                  <CloudRain className="h-5 w-5 mb-1 text-blue-500" />
                  <span className="font-mono text-xs font-bold uppercase">Rain</span>
                </button>

                <button
                  onClick={() => handleSetWeather("thunder")}
                  className="flex flex-col items-center justify-center p-3 border-2 border-black bg-zinc-50 shadow-[2px_2px_0px_#000000] hover:bg-purple-100 cursor-pointer dark:bg-zinc-800 dark:text-white"
                >
                  <Zap className="h-5 w-5 mb-1 text-purple-600" />
                  <span className="font-mono text-xs font-bold uppercase">Thunder</span>
                </button>
              </div>
            </div>

            {/* Difficulty */}
            <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-black pb-3 dark:border-zinc-700">
                <Skull className="h-5 w-5 text-red-500" />
                <h4 className="font-mono text-sm font-black uppercase text-black dark:text-white">
                  Difficulty Level
                </h4>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {(["peaceful", "easy", "normal", "hard"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleSetDifficulty(diff)}
                    className={`border-2 border-black py-2 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] transition-all cursor-pointer ${
                      status?.difficulty === diff
                        ? "bg-[#ffe600] text-black -translate-y-0.5"
                        : "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-white"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Gamerules Grid (Full Width) */}
          <div className="md:col-span-2 border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#ffe600]" />
                <h4 className="font-mono text-sm font-black uppercase text-black dark:text-white">
                  Minecraft Game Rules (Gamerules)
                </h4>
              </div>
              <span className="font-mono text-xs text-zinc-500">Live /gamerule controls</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {GAMERULES_LIST.map((gr) => (
                <div
                  key={gr.rule}
                  className="border border-black bg-zinc-50 p-3 shadow-[2px_2px_0px_#000000] dark:bg-zinc-800 dark:border-zinc-700 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-xs font-black text-black dark:text-[#ffe600]">
                        {gr.rule}
                      </span>
                      {gameruleValues[gr.rule] && (
                        <span className="border border-black bg-[#ffe600] px-1 text-[9px] font-bold text-black">
                          {gameruleValues[gr.rule]}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400 leading-tight">
                      {gr.desc}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-1 border-t border-zinc-300 pt-2 dark:border-zinc-700">
                    {gr.type === "boolean" ? (
                      <>
                        <button
                          onClick={() => handleGamerule(gr.rule, "true")}
                          className="flex-1 border border-black bg-white py-1 font-mono text-[10px] font-bold uppercase hover:bg-green-100 hover:text-green-800 cursor-pointer dark:bg-zinc-900 dark:text-zinc-200"
                        >
                          True
                        </button>
                        <button
                          onClick={() => handleGamerule(gr.rule, "false")}
                          className="flex-1 border border-black bg-white py-1 font-mono text-[10px] font-bold uppercase hover:bg-red-100 hover:text-red-800 cursor-pointer dark:bg-zinc-900 dark:text-zinc-200"
                        >
                          False
                        </button>
                        <button
                          onClick={() => handleGamerule(gr.rule)}
                          className="border border-black bg-zinc-200 px-2 py-1 font-mono text-[10px] font-bold hover:bg-zinc-300 cursor-pointer dark:bg-zinc-700"
                          title="Query rule value"
                        >
                          ?
                        </button>
                      </>
                    ) : (
                      <div className="flex w-full gap-1">
                        <input
                          type="number"
                          placeholder="Value"
                          defaultValue={gr.rule === "randomTickSpeed" ? "3" : "10"}
                          id={`gr_${gr.rule}`}
                          className="w-16 border border-black bg-white px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                        />
                        <button
                          onClick={() => {
                            const val = (document.getElementById(`gr_${gr.rule}`) as HTMLInputElement)?.value;
                            if (val) handleGamerule(gr.rule, val);
                          }}
                          className="flex-1 border border-black bg-[#ffe600] py-0.5 font-mono text-[10px] font-bold uppercase text-black cursor-pointer"
                        >
                          Set
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACCESS CONTROL (WHITELIST & BANS) */}
      {activeTab === "access" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Whitelist Section */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#ffe600]" />
                <h4 className="font-mono text-sm font-black uppercase text-black dark:text-white">
                  Server Whitelist
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleWhitelist("on")}
                  className="border border-black bg-green-100 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-green-800 hover:bg-green-200 cursor-pointer"
                >
                  Enable
                </button>
                <button
                  onClick={() => handleWhitelist("off")}
                  className="border border-black bg-red-100 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-red-800 hover:bg-red-200 cursor-pointer"
                >
                  Disable
                </button>
                <button
                  onClick={() => handleWhitelist("reload")}
                  className="border border-black bg-zinc-100 px-2 py-1 font-mono text-[10px] font-bold hover:bg-zinc-200 cursor-pointer dark:bg-zinc-800 dark:text-white"
                  title="Reload whitelist.json"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Add Whitelist Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newWhitelistUser.trim()) handleWhitelist("add", newWhitelistUser.trim());
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Minecraft Username to Whitelist..."
                value={newWhitelistUser}
                onChange={(e) => setNewWhitelistUser(e.target.value)}
                className="flex-1 border-2 border-black bg-white p-2 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
              />
              <button
                type="submit"
                className="border-2 border-black bg-[#ffe600] px-4 py-2 font-mono text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Add
              </button>
            </form>

            {/* Whitelisted Players List */}
            <div className="space-y-2">
              <p className="font-mono text-xs font-bold uppercase text-zinc-500">
                Whitelisted Players ({status?.whitelist?.players.length || 0})
              </p>
              <div className="max-h-60 overflow-y-auto space-y-1.5 border border-black p-2 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-700">
                {status?.whitelist?.players && status.whitelist.players.length > 0 ? (
                  status.whitelist.players.map((p) => (
                    <div
                      key={p}
                      className="flex items-center justify-between border border-zinc-200 bg-white p-2 dark:bg-zinc-900 dark:border-zinc-800"
                    >
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://mc-heads.net/avatar/${encodeURIComponent(p)}/24`}
                          alt={p}
                          className="h-6 w-6 border border-black"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect width='24' height='24' fill='%23ffe600'/%3E%3C/svg%3E";
                          }}
                        />
                        <span className="font-mono text-xs font-bold text-black dark:text-white">{p}</span>
                      </div>
                      <button
                        onClick={() => handleWhitelist("remove", p)}
                        className="border border-black bg-red-50 px-2 py-0.5 font-mono text-[10px] font-bold text-red-700 hover:bg-red-100 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="font-mono text-xs text-zinc-400 p-2 italic">
                    No whitelisted players found or whitelist query pending.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bans Section */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3 dark:border-zinc-700">
              <Skull className="h-5 w-5 text-red-600" />
              <h4 className="font-mono text-sm font-black uppercase text-black dark:text-white">
                Player & IP Ban Management
              </h4>
            </div>

            {/* Ban Player Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newBanUser.trim()) handleBan("ban", newBanUser.trim(), banReason);
              }}
              className="space-y-2 border border-black bg-zinc-50 p-3 dark:bg-zinc-800 dark:border-zinc-700"
            >
              <p className="font-mono text-[11px] font-bold uppercase text-zinc-700 dark:text-zinc-300">
                Ban a Player
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Player Username..."
                  value={newBanUser}
                  onChange={(e) => setNewBanUser(e.target.value)}
                  className="flex-1 border-2 border-black bg-white p-1.5 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Reason (Optional)..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="flex-1 border-2 border-black bg-white p-1.5 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                />
                <button
                  type="submit"
                  className="border-2 border-black bg-red-600 px-3 py-1.5 font-mono text-xs font-black uppercase text-white shadow-[2px_2px_0px_#000000] hover:bg-red-700 cursor-pointer"
                >
                  Ban
                </button>
              </div>
            </form>

            {/* Ban IP Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newBanIp.trim()) handleBan("ban-ip", newBanIp.trim(), ipBanReason);
              }}
              className="space-y-2 border border-black bg-zinc-50 p-3 dark:bg-zinc-800 dark:border-zinc-700"
            >
              <p className="font-mono text-[11px] font-bold uppercase text-zinc-700 dark:text-zinc-300">
                Ban an IP Address
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="IP Address (e.g. 192.168.1.5)..."
                  value={newBanIp}
                  onChange={(e) => setNewBanIp(e.target.value)}
                  className="flex-1 border-2 border-black bg-white p-1.5 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                />
                <button
                  type="submit"
                  className="border-2 border-black bg-red-600 px-3 py-1.5 font-mono text-xs font-black uppercase text-white shadow-[2px_2px_0px_#000000] hover:bg-red-700 cursor-pointer"
                >
                  Ban IP
                </button>
              </div>
            </form>

            {/* Banned Players List */}
            <div className="space-y-2">
              <p className="font-mono text-xs font-bold uppercase text-zinc-500">
                Active Banned Players ({status?.bannedPlayers?.length || 0})
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1.5 border border-black p-2 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-700">
                {status?.bannedPlayers && status.bannedPlayers.length > 0 ? (
                  status.bannedPlayers.map((p) => (
                    <div
                      key={p}
                      className="flex items-center justify-between border border-zinc-200 bg-white p-2 dark:bg-zinc-900 dark:border-zinc-800"
                    >
                      <span className="font-mono text-xs font-bold text-red-600">{p}</span>
                      <button
                        onClick={() => handleBan("pardon", p)}
                        className="border border-black bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase hover:bg-zinc-100 cursor-pointer dark:bg-zinc-800 dark:text-white"
                      >
                        Pardon
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="font-mono text-xs text-zinc-400 p-2 italic">No active player bans.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BROADCAST & ALERTS */}
      {activeTab === "broadcast" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* In-Game Chat Broadcast */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3 dark:border-zinc-700">
              <MessageSquare className="h-5 w-5 text-[#ffe600]" />
              <h4 className="font-mono text-sm font-black uppercase text-black dark:text-white">
                Global Chat Broadcast (/say)
              </h4>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleBroadcast("say");
              }}
              className="space-y-3"
            >
              <textarea
                rows={3}
                placeholder="Type a message to broadcast to all players in server chat..."
                value={chatBroadcast}
                onChange={(e) => setChatBroadcast(e.target.value)}
                className="w-full border-2 border-black bg-white p-2 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
              />
              <button
                type="submit"
                disabled={!chatBroadcast.trim()}
                className="w-full border-2 border-black bg-[#ffe600] py-2 font-mono text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
              >
                Broadcast to Chat
              </button>
            </form>
          </div>

          {/* Big Screen Titles (/title) */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3 dark:border-zinc-700">
              <Radio className="h-5 w-5 text-amber-500" />
              <h4 className="font-mono text-sm font-black uppercase text-black dark:text-white">
                Screen Title Announcement (/title)
              </h4>
            </div>

            <div className="space-y-2">
              <div>
                <label className="font-mono text-[10px] font-bold uppercase text-zinc-500">Main Title</label>
                <input
                  type="text"
                  placeholder="Large Center Title Text..."
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  className="w-full border-2 border-black bg-white p-1.5 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] font-bold uppercase text-zinc-500">Subtitle</label>
                <input
                  type="text"
                  placeholder="Smaller Subtitle Text..."
                  value={subtitleText}
                  onChange={(e) => setSubtitleText(e.target.value)}
                  className="w-full border-2 border-black bg-white p-1.5 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] font-bold uppercase text-zinc-500">Title Color</label>
                <select
                  value={titleColor}
                  onChange={(e) => setTitleColor(e.target.value)}
                  className="w-full border-2 border-black bg-white p-1.5 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                >
                  <option value="gold">Gold</option>
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                  <option value="green">Green</option>
                  <option value="aqua">Aqua</option>
                  <option value="light_purple">Light Purple</option>
                  <option value="white">White</option>
                </select>
              </div>

              <button
                onClick={() => handleBroadcast("title")}
                disabled={!titleText.trim()}
                className="w-full border-2 border-black bg-[#ffe600] py-2 font-mono text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
              >
                Send Title Alert
              </button>
            </div>
          </div>

          {/* Sound Effects Player (Full Width) */}
          <div className="md:col-span-2 border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3 dark:border-zinc-700">
              <Volume2 className="h-5 w-5 text-blue-500" />
              <h4 className="font-mono text-sm font-black uppercase text-black dark:text-white">
                In-Game Audio & Sound Effects (/playsound)
              </h4>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {COMMON_SOUNDS.map((snd) => (
                <div
                  key={snd.id}
                  className="border border-black bg-zinc-50 p-3 shadow-[2px_2px_0px_#000000] dark:bg-zinc-800 dark:border-zinc-700 flex flex-col justify-between"
                >
                  <div>
                    <h5 className="font-mono text-xs font-black text-black dark:text-white">{snd.name}</h5>
                    <p className="text-[10px] text-zinc-500">{snd.desc}</p>
                  </div>
                  <button
                    onClick={() => handlePlaySound(snd.id)}
                    className="mt-3 inline-flex items-center justify-center gap-1 border border-black bg-white py-1 font-mono text-[10px] font-bold uppercase shadow-[1px_1px_0px_#000000] hover:bg-[#ffe600] cursor-pointer dark:bg-zinc-900 dark:text-zinc-200"
                  >
                    <Play className="h-3 w-3" />
                    <span>Play Sound</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: WORLD UTILITIES */}
      {activeTab === "utilities" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* World Border Controls */}
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3 dark:border-zinc-700">
              <Compass className="h-5 w-5 text-[#ffe600]" />
              <h4 className="font-mono text-sm font-black uppercase text-black dark:text-white">
                World Border Manager
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                  Border Diameter (Blocks)
                </label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    value={borderSize}
                    onChange={(e) => setBorderSize(e.target.value)}
                    className="flex-1 border-2 border-black bg-white p-2 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                  <button
                    onClick={handleSetWorldBorder}
                    className="border-2 border-black bg-[#ffe600] px-4 py-2 font-mono text-xs font-bold uppercase text-black shadow-[2px_2px_0px_#000000] cursor-pointer"
                  >
                    Set Size
                  </button>
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] font-bold uppercase text-zinc-500">
                  Center Coordinates (X, Z)
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input
                    type="number"
                    placeholder="X Coord"
                    value={borderCenter.x}
                    onChange={(e) => setBorderCenter({ ...borderCenter, x: e.target.value })}
                    className="border-2 border-black bg-white p-2 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Z Coord"
                    value={borderCenter.z}
                    onChange={(e) => setBorderCenter({ ...borderCenter, z: e.target.value })}
                    className="border-2 border-black bg-white p-2 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleCenterWorldBorder}
                  className="mt-2 w-full border-2 border-black bg-white py-1.5 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#000000] hover:bg-zinc-100 cursor-pointer dark:bg-zinc-800 dark:text-white"
                >
                  Set Center
                </button>
              </div>
            </div>
          </div>

          {/* Seed & Tick Controls */}
          <div className="space-y-6">
            {/* World Seed */}
            <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 space-y-3">
              <h4 className="font-mono text-sm font-black uppercase text-black dark:text-white">
                World Seed
              </h4>
              <div className="flex items-center justify-between border-2 border-black bg-zinc-50 p-3 dark:bg-zinc-800 dark:border-zinc-700">
                <span className="font-mono text-sm font-black text-black dark:text-[#ffe600]">
                  {status?.seed || "Unknown Seed (Run /seed)"}
                </span>
                {status?.seed && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(status.seed || "");
                      setCopiedSeed(true);
                      setTimeout(() => setCopiedSeed(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 border border-black bg-white px-2 py-1 font-mono text-[10px] font-bold uppercase shadow-[1px_1px_0px_#000000] cursor-pointer dark:bg-zinc-900 dark:text-white"
                  >
                    {copiedSeed ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSeed ? "Copied" : "Copy"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Datapack & Server Functions */}
            <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 space-y-3">
              <h4 className="font-mono text-sm font-black uppercase text-black dark:text-white">
                Datapacks & Function Reload
              </h4>
              <p className="text-xs text-zinc-500 font-mono">
                Reloads all datapacks, loot tables, advancements, and server functions without restarting.
              </p>
              <button
                onClick={() => handleExecuteCommand("reload")}
                className="w-full border-2 border-black bg-[#ffe600] py-2 font-mono text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Reload Datapacks (/reload)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: RCON CONFIGURATION & SETUP GUIDE */}
      {activeTab === "config" && (
        <div className="space-y-6">
          <div className="border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900">
            <h3 className="font-mono text-base font-black uppercase tracking-wider text-black dark:text-[#ffe600]">
              Minecraft RCON Configuration & Diagnostics
            </h3>
            <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
              The Minecraft server is designed to run on the same host server as the web application, connected via TCP RCON on port 25575.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="border-2 border-black bg-zinc-50 p-4 shadow-[2px_2px_0px_#000000] dark:bg-zinc-800 dark:border-zinc-700">
                <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">Target Host</p>
                <p className="mt-1 font-mono text-sm font-black text-black dark:text-white">
                  {status?.host || "127.0.0.1"}
                </p>
                <p className="mt-1 font-mono text-[10px] text-zinc-500">Env: MINECRAFT_RCON_HOST</p>
              </div>

              <div className="border-2 border-black bg-zinc-50 p-4 shadow-[2px_2px_0px_#000000] dark:bg-zinc-800 dark:border-zinc-700">
                <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">Target Port</p>
                <p className="mt-1 font-mono text-sm font-black text-black dark:text-white">
                  {status?.port || 25575}
                </p>
                <p className="mt-1 font-mono text-[10px] text-zinc-500">Env: MINECRAFT_RCON_PORT</p>
              </div>

              <div className="border-2 border-black bg-zinc-50 p-4 shadow-[2px_2px_0px_#000000] dark:bg-zinc-800 dark:border-zinc-700">
                <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">Password Status</p>
                <p className="mt-1 font-mono text-sm font-black text-black dark:text-white flex items-center gap-1.5">
                  {status?.hasPassword ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Configured in .env</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">Not configured</span>
                    </>
                  )}
                </p>
                <p className="mt-1 font-mono text-[10px] text-zinc-500">Env: MINECRAFT_RCON_PASSWORD</p>
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="mt-6 border-t-2 border-black pt-4 dark:border-zinc-700">
              <button
                onClick={() => refreshStatus(false)}
                className="inline-flex items-center gap-2 border-2 border-black bg-[#ffe600] px-5 py-2.5 font-mono text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Test RCON Connection & Diagnostic</span>
              </button>
            </div>
          </div>

          {/* Minecraft Server Properties Guide */}
          <div className="border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 space-y-4">
            <h4 className="font-mono text-sm font-black uppercase tracking-wider text-black dark:text-white">
              Minecraft `server.properties` Configuration
            </h4>
            <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              To allow the Admin dashboard to control your Minecraft server, ensure these exact lines are in your Minecraft server&apos;s
              <code className="mx-1 border border-black bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">server.properties</code> file:
            </p>

            <pre className="overflow-x-auto border-2 border-black bg-zinc-950 p-4 font-mono text-xs text-[#55FF55] dark:border-zinc-700">
{`# Enable RCON remote console
enable-rcon=true

# Standard Minecraft RCON port
rcon.port=25575

# Set your secure RCON password (must match MINECRAFT_RCON_PASSWORD in .env)
rcon.password=YOUR_SECRET_RCON_PASSWORD

# Broadcast RCON command execution to ops
broadcast-rcon-to-ops=true`}
            </pre>

            <div className="border border-black bg-zinc-50 p-4 text-xs font-mono dark:bg-zinc-800 dark:border-zinc-700 space-y-2">
              <p className="font-bold text-black dark:text-white uppercase">Host Deployment Note:</p>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                When deployed on the server via Jenkins, the web application runs with Docker <code className="bg-zinc-200 px-1 dark:bg-zinc-700">--network host</code>.
                This means connecting to <code className="bg-zinc-200 px-1 dark:bg-zinc-700">127.0.0.1:25575</code> directly reaches the Minecraft server running natively on the same host machine!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PLAYER ACTION MODAL */}
      {playerActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md border-2 border-black bg-white p-6 shadow-[8px_8px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 dark:border-zinc-700">
              <h3 className="font-mono text-sm font-black uppercase text-black dark:text-white">
                {playerActionModal.type === "kick" && `Kick Player: ${playerActionModal.player}`}
                {playerActionModal.type === "ban" && `Ban Player: ${playerActionModal.player}`}
                {playerActionModal.type === "msg" && `Whisper to: ${playerActionModal.player}`}
                {playerActionModal.type === "give" && `Give Item to: ${playerActionModal.player}`}
                {playerActionModal.type === "tp" && `Teleport Player: ${playerActionModal.player}`}
              </h3>
              <button
                onClick={() => setPlayerActionModal(null)}
                className="font-mono text-xs font-bold underline cursor-pointer text-zinc-500 hover:text-black"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {playerActionModal.type === "kick" && (
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-zinc-600 dark:text-zinc-300">
                    Kick Reason (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Kicked by administrator"
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>
              )}

              {playerActionModal.type === "ban" && (
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-zinc-600 dark:text-zinc-300">
                    Ban Reason (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Banned by administrator"
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>
              )}

              {playerActionModal.type === "msg" && (
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-zinc-600 dark:text-zinc-300">
                    Private Message
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Type private message to player..."
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>
              )}

              {playerActionModal.type === "give" && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-zinc-600 dark:text-zinc-300">
                      Select Item
                    </label>
                    <select
                      value={modalItem}
                      onChange={(e) => setModalItem(e.target.value)}
                      className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                    >
                      {COMMON_ITEMS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-zinc-600 dark:text-zinc-300">
                      Custom Item ID (e.g. minecraft:apple)
                    </label>
                    <input
                      type="text"
                      placeholder="minecraft:diamond"
                      value={modalItem}
                      onChange={(e) => setModalItem(e.target.value)}
                      className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs font-bold uppercase text-zinc-600 dark:text-zinc-300">
                      Amount
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={64}
                      value={modalAmount}
                      onChange={(e) => setModalAmount(parseInt(e.target.value, 10) || 1)}
                      className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {playerActionModal.type === "tp" && (
                <div className="space-y-3">
                  <p className="font-mono text-xs text-zinc-600 dark:text-zinc-300">
                    Teleport <span className="font-bold text-black dark:text-white">{playerActionModal.player}</span> to coordinates:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase text-zinc-500">X Coord</label>
                      <input
                        type="text"
                        placeholder="0"
                        value={tpCoords.x}
                        onChange={(e) => setTpCoords({ ...tpCoords, x: e.target.value })}
                        className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase text-zinc-500">Y Coord</label>
                      <input
                        type="text"
                        placeholder="64"
                        value={tpCoords.y}
                        onChange={(e) => setTpCoords({ ...tpCoords, y: e.target.value })}
                        className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase text-zinc-500">Z Coord</label>
                      <input
                        type="text"
                        placeholder="0"
                        value={tpCoords.z}
                        onChange={(e) => setTpCoords({ ...tpCoords, z: e.target.value })}
                        className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-xs dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPlayerActionModal(null)}
                  className="flex-1 border-2 border-black bg-white py-2 font-mono text-xs font-bold uppercase hover:bg-zinc-100 cursor-pointer dark:bg-zinc-800 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handlePlayerAction(playerActionModal.type, playerActionModal.player)}
                  className="flex-1 border-2 border-black bg-[#ffe600] py-2 font-mono text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  Confirm Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SaveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function SunsetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 10V2" />
      <path d="m4.93 10.93 1.41 1.41" />
      <path d="M2 18h2" />
      <path d="M20 18h2" />
      <path d="m19.07 10.93-1.41 1.41" />
      <path d="M22 22H2" />
      <path d="m16 6-4 4-4-4" />
      <path d="M16 18a4 4 0 0 0-8 0" />
    </svg>
  );
}
