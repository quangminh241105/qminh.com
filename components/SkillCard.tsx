"use client";

import { useEffect, useId, useRef, useState } from "react";

type SkillCardProps = {
  name: string;
  category: string;
  level: number;
};

export default function SkillCard({ name, category, level }: SkillCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLLIElement>(null);
  const panelId = useId();
  const powerUpMessage = level >= 85 ? "BOSS FIGHT READY" : level >= 75 ? "COMBO MULTIPLIER ACTIVE" : "GRINDING XP...";

  useEffect(() => {
    if (!isOpen) return;

    function closeWhenClickingOutside(event: PointerEvent) {
      if (!cardRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", closeWhenClickingOutside);
    document.addEventListener("keydown", closeWithEscape);

    return () => {
      document.removeEventListener("pointerdown", closeWhenClickingOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [isOpen]);

  return (
    <li
      ref={cardRef}
      className={`retro-skill relative h-full border-2 border-black bg-white shadow-[4px_4px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000]${
        isOpen ? " is-open z-30" : ""
      }`}
    >
      <span className="retro-skill__powerup absolute -top-3 right-2 border-2 border-black bg-[#ffe600] px-1.5 py-0.5 font-mono text-[10px] font-black text-black shadow-[2px_2px_0px_#000000]">
        +{Math.max(1, Math.round(level / 10))} XP
      </span>

      <button
        type="button"
        className="block w-full cursor-pointer p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="mb-2 flex items-center justify-between font-mono text-sm">
          <span className="flex items-center gap-2">
            <span className="retro-skill__icon h-2 w-2 border border-black bg-red-500 dark:border-red-400" />
            <span className="font-bold uppercase tracking-wider text-black dark:text-white">{name}</span>
          </span>
          <span className="retro-skill__badge border border-black bg-[#ffe600] px-1.5 py-0.2 font-mono text-xs font-black text-black">
            {level}%
          </span>
        </span>

        <span
          className="block h-3 border-2 border-black bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800"
          role="progressbar"
          aria-label={`${name} proficiency`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={level}
        >
          <span
            className="block h-full border-r-2 border-black bg-blue-600 dark:border-black dark:bg-blue-500"
            style={{ width: `${level}%` }}
          />
        </span>

        <span className="mt-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          {category}
        </span>

        <span className="mt-3 block font-mono text-[9px] font-black uppercase tracking-[0.16em] text-green-600 dark:text-green-400">
          {isOpen ? "Press start: close panel" : "Press start: inspect skill"}
        </span>
      </button>

      {isOpen ? (
        <div
          id={panelId}
          className="retro-skill__panel border-2 border-black bg-[#fffde6] px-4 py-4 font-mono shadow-[4px_4px_0px_#000000] dark:border-blue-400 dark:bg-zinc-950 dark:shadow-[4px_4px_0px_#000000]"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">
            * Power-up acquired: {name}
          </p>
          <div className="mt-2 grid gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            <p>Type: {category}</p>
            <p>Status: {powerUpMessage}</p>
            <p>Next move: keep shipping!</p>
          </div>
        </div>
      ) : null}
    </li>
  );
}
