const retroIcons = [
  ["✦", "retro-floating-icon--1"],
  ["✚", "retro-floating-icon--2"],
  ["♥", "retro-floating-icon--3"],
  ["◆", "retro-floating-icon--4"],
  ["▣", "retro-floating-icon--6"],
  ["▲", "retro-floating-icon--8"],
  ["+", "retro-floating-icon--10"],
] as const;

export default function RetroIconLayer() {
  return (
    <div className="retro-icon-layer" aria-hidden="true">
      {retroIcons.map(([symbol, className]) => (
        <span key={className} className={`retro-floating-icon ${className}`}>
          {symbol}
        </span>
      ))}
    </div>
  );
}
