"use client";

import { useEffect, useState } from "react";

type TypewriterTextProps = {
  phrases: string[];
  className?: string;
  initialDelay?: number;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
};

export default function TypewriterText({
  phrases,
  className,
  initialDelay = 1600,
  typingSpeed = 82,
  deletingSpeed = 42,
  pauseDuration = 1800,
}: TypewriterTextProps) {
  const phraseKey = phrases.filter(Boolean).join("\u0000");
  const firstPhrase = phraseKey.split("\u0000")[0] ?? "";
  const [displayedText, setDisplayedText] = useState(firstPhrase);

  useEffect(() => {
    const validPhrases = Array.from(new Set(phraseKey.split("\u0000").filter(Boolean)));
    if (validPhrases.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayedText(validPhrases[0]);
      return;
    }

    let phraseIndex = 0;
    let characterIndex = validPhrases[0].length;
    let isDeleting = true;
    let timer: ReturnType<typeof setTimeout>;

    const getNextPhraseIndex = () => {
      if (validPhrases.length === 1) return 0;
      return (phraseIndex + 1 + Math.floor(Math.random() * (validPhrases.length - 1))) % validPhrases.length;
    };

    const tick = () => {
      const currentPhrase = validPhrases[phraseIndex];

      if (isDeleting) {
        if (characterIndex > 0) {
          characterIndex -= 1;
          setDisplayedText(currentPhrase.slice(0, characterIndex));
          timer = setTimeout(tick, deletingSpeed);
          return;
        }

        phraseIndex = getNextPhraseIndex();
        characterIndex = 0;
        isDeleting = false;
        timer = setTimeout(tick, 260);
        return;
      }

      const nextPhrase = validPhrases[phraseIndex];
      if (characterIndex < nextPhrase.length) {
        characterIndex += 1;
        setDisplayedText(nextPhrase.slice(0, characterIndex));
        timer = setTimeout(tick, typingSpeed);
        return;
      }

      isDeleting = true;
      timer = setTimeout(tick, pauseDuration);
    };

    timer = setTimeout(tick, initialDelay);
    return () => clearTimeout(timer);
  }, [deletingSpeed, initialDelay, pauseDuration, phraseKey, typingSpeed]);

  return (
    <span className={className}>
      <span aria-hidden="true">
        {displayedText}
        <span
          className="ml-1 inline-block h-[1em] w-px translate-y-[0.12em] animate-pulse bg-blue-600 align-baseline motion-reduce:animate-none dark:bg-blue-400"
        />
      </span>
      <span className="sr-only">{firstPhrase}</span>
    </span>
  );
}
