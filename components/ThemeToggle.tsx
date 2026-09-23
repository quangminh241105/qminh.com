"use client";

import { useEffect, useRef, useState } from "react";
import { SunIcon, MoonIcon } from "@/components/icons";

type Theme = "light" | "dark";
type Pixel = { id: number; delay: number };

const PIXEL_COLUMNS = 16;
const PIXEL_ROWS = 10;
const PIXEL_FILL_MS = 280;
const PIXEL_MAX_DELAY_MS = 220;
const THEME_TRANSITION_MS = PIXEL_FILL_MS + PIXEL_MAX_DELAY_MS;

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [iconRotation, setIconRotation] = useState(180);
  const [pixelTransition, setPixelTransition] = useState<{ theme: Theme; pixels: Pixel[] } | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current === "dark" ? "dark" : "light");

    return () => {
      if (transitionTimer.current) {
        clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  function toggleTheme() {
    if (pixelTransition) return;

    const next: Theme = theme === "dark" ? "light" : "dark";
    setIconRotation((rotation) => rotation + 360);
    setPixelTransition({
      theme: next,
      pixels: Array.from({ length: PIXEL_COLUMNS * PIXEL_ROWS }, (_, id) => ({
        id,
        delay: Math.floor(Math.random() * PIXEL_MAX_DELAY_MS),
      })),
    });

    transitionTimer.current = setTimeout(() => {
      setTheme(next);
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch {
        // localStorage unavailable
      }
      setPixelTransition(null);
      transitionTimer.current = null;
    }, THEME_TRANSITION_MS);
  }

  return (
    <>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle color theme"
        className="flex h-9 w-9 items-center justify-center border-2 border-black bg-white text-blue-600 shadow-[2px_2px_0px_#000000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 dark:border-blue-400 dark:bg-zinc-900 dark:text-blue-400 dark:shadow-[2px_2px_0px_#000000] dark:hover:shadow-[3px_3px_0px_#000000]"
      >
        <span
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${iconRotation}deg)` }}
        >
          {theme === "dark" ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4 rotate-180" />}
        </span>
      </button>
      {pixelTransition ? (
        <div
          aria-hidden="true"
          className="theme-pixel-transition"
          style={{
            gridTemplateColumns: `repeat(${PIXEL_COLUMNS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${PIXEL_ROWS}, minmax(0, 1fr))`,
          }}
        >
          {pixelTransition.pixels.map((pixel) => (
            <span
              className="theme-pixel"
              key={pixel.id}
              style={{
                animationDelay: `${pixel.delay}ms`,
                animationDuration: `${PIXEL_FILL_MS}ms`,
                backgroundColor: pixelTransition.theme === "dark" ? "#09090b" : "#ffffff",
              }}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
