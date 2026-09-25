"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLinkIcon, MaximizeIcon, RefreshIcon } from "@/components/icons";

type F1PlayerProps = {
  src: string;
};

export default function F1Player({ src }: F1PlayerProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === frameRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    if (!frameRef.current) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await frameRef.current.requestFullscreen();
  }

  return (
    <div className="mt-6 overflow-hidden border-2 border-black bg-black shadow-[4px_4px_0px_#000000] dark:border-zinc-600">
      <div className="flex flex-col gap-3 border-b-2 border-zinc-700 bg-zinc-900 px-3 py-2 text-white sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          External player controls
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="inline-flex items-center gap-1.5 border border-zinc-500 bg-zinc-800 px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-100 transition-colors hover:bg-zinc-700"
          >
            <RefreshIcon className="h-3.5 w-3.5" />
            Reload stream
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 border border-zinc-500 bg-zinc-800 px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-100 transition-colors hover:bg-zinc-700"
          >
            <MaximizeIcon className="h-3.5 w-3.5" />
            {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          </button>
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 border border-zinc-500 bg-zinc-800 px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-100 transition-colors hover:bg-zinc-700"
          >
            <ExternalLinkIcon className="h-3.5 w-3.5" />
            Open source
          </a>
        </div>
      </div>

      <div className="aspect-video w-full bg-black">
        <iframe
          key={reloadKey}
          ref={frameRef}
          src={src}
          title="Formula 1 live stream"
          loading="lazy"
          name="frame"
          scrolling="no"
          frameBorder="0"
          allow="fullscreen"
          className="block h-full w-full border-0"
        />
      </div>

      <p className="border-t border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-[10px] uppercase tracking-wide text-zinc-500 sm:px-4">
        Playback controls are provided inside the external stream. These controls manage the frame itself.
      </p>
    </div>
  );
}
