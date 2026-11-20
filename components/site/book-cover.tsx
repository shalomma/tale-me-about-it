/**
 * An illustrated cover drawn from the book's title, since the catalog has no images.
 * Palette and motif are stable per book. The spine is on the right, like a Hebrew book.
 */

type Palette = { bg: string; shape: string; ink: string };

const PALETTES: Palette[] = [
  { bg: "#f8dc9f", shape: "#ee9f45", ink: "#3d2a12" },
  { bg: "#cfe7d9", shape: "#5fa47f", ink: "#1d3a2b" },
  { bg: "#d4e8f7", shape: "#5b9fd3", ink: "#17324d" },
  { bg: "#e4dbf7", shape: "#8f76d6", ink: "#2c2255" },
  { bg: "#f9d6dc", shape: "#e07d92", ink: "#4b1d29" },
  { bg: "#f7d0c2", shape: "#e2704f", ink: "#4a2216" },
  { bg: "#2b3062", shape: "#f6c453", ink: "#fff6e0" },
];

type Motif = "house" | "tree" | "moon" | "sun" | "flower" | "heart" | "balloon" | "cloud";

const KEYWORDS: [Motif, string[]][] = [
  ["house", ["בית", "דירה", "ארגז", "עוברים"]],
  ["moon", ["מפלצת", "חדר", "לילה", "ירח"]],
  ["sun", ["אריה", "תירס", "שמש"]],
  ["tree", ["עץ", "גורילה", "קוף"]],
  ["flower", ["גן"]],
  ["heart", ["חברים", "אהבה"]],
];
const FALLBACK: Motif[] = ["balloon", "cloud", "heart", "moon", "sun"];

function hash(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function pickMotif(title: string, h: number): Motif {
  for (const [motif, words] of KEYWORDS) if (words.some((w) => title.includes(w))) return motif;
  return FALLBACK[h % FALLBACK.length];
}

function MotifArt({ motif, p }: { motif: Motif; p: Palette }) {
  const hill = <path d="M-5 80V62c22-10 45-12 62-6s32 4 48-2v26Z" fill={p.shape} opacity={0.35} />;
  const light = p.bg === "#2b3062" ? "#fff6e0" : "#ffffff";
  switch (motif) {
    case "house":
      return (
        <>
          {hill}
          <path d="M30 70V46l20-16 20 16v24Z" fill={p.shape} />
          <path d="M26 48 50 28l24 20" fill="none" stroke={p.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
          <rect x={44} y={56} width={12} height={14} rx={6} fill={p.ink} opacity={0.75} />
          <circle cx={39} cy={49} r={4} fill={light} opacity={0.9} />
          <circle cx={61} cy={49} r={4} fill={light} opacity={0.9} />
        </>
      );
    case "tree":
      return (
        <>
          {hill}
          <rect x={46} y={46} width={8} height={24} rx={3} fill={p.ink} opacity={0.7} />
          <circle cx={50} cy={36} r={18} fill={p.shape} />
          <circle cx={38} cy={44} r={11} fill={p.shape} />
          <circle cx={62} cy={44} r={11} fill={p.shape} />
          <circle cx={44} cy={32} r={3} fill={light} opacity={0.7} />
          <circle cx={57} cy={40} r={2.5} fill={light} opacity={0.7} />
        </>
      );
    case "moon":
      return (
        <>
          {hill}
          <path d="M58 18a20 20 0 1 0 12 30 16 16 0 0 1-12-30Z" fill={p.shape} />
          <path d="M28 22l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5Z" fill={p.shape} />
          <path d="M76 58l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1Z" fill={p.shape} />
          <circle cx={22} cy={46} r={1.6} fill={p.shape} />
        </>
      );
    case "sun":
      return (
        <>
          {hill}
          <g stroke={p.shape} strokeWidth={3} strokeLinecap="round">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line key={a} x1={50} y1={14} x2={50} y2={8} transform={`rotate(${a} 50 38)`} />
            ))}
          </g>
          <circle cx={50} cy={38} r={17} fill={p.shape} />
          <circle cx={44} cy={36} r={2} fill={p.ink} opacity={0.7} />
          <circle cx={56} cy={36} r={2} fill={p.ink} opacity={0.7} />
          <path d="M44 43q6 5 12 0" fill="none" stroke={p.ink} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
        </>
      );
    case "flower":
      return (
        <>
          {hill}
          {[
            [34, 48, 0.85],
            [52, 40, 1],
            [68, 50, 0.8],
          ].map(([x, y, s]) => (
            <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
              <path d="M0 4v26" stroke={p.ink} strokeWidth={2.5} opacity={0.6} />
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx={0} cy={-7} rx={5} ry={8} fill={p.shape} transform={`rotate(${a})`} />
              ))}
              <circle r={4.5} fill={light} />
            </g>
          ))}
        </>
      );
    case "heart":
      return (
        <>
          {hill}
          <path d="M50 66S28 53 28 37a11 11 0 0 1 22-4 11 11 0 0 1 22 4c0 16-22 29-22 29Z" fill={p.shape} />
          <path d="M24 22s-6-3.5-6-8a3.5 3.5 0 0 1 6-2 3.5 3.5 0 0 1 6 2c0 4.5-6 8-6 8Z" fill={p.shape} opacity={0.6} />
          <path d="M77 26s-4-2.4-4-5.4a2.4 2.4 0 0 1 4-1.4 2.4 2.4 0 0 1 4 1.4c0 3-4 5.4-4 5.4Z" fill={p.shape} opacity={0.6} />
        </>
      );
    case "balloon":
      return (
        <>
          {hill}
          <path d="M50 52q-4 8 2 14t0 12" fill="none" stroke={p.ink} strokeWidth={1.8} opacity={0.6} />
          <ellipse cx={50} cy={34} rx={14} ry={17} fill={p.shape} />
          <path d="M47 50h6l-3 4Z" fill={p.shape} />
          <ellipse cx={44} cy={27} rx={3} ry={5} fill={light} opacity={0.6} />
          <path d="M18 30h16a5 5 0 0 0-3-9 7 7 0 0 0-12 2 3.6 3.6 0 0 0-1 7Z" fill={light} opacity={0.75} />
        </>
      );
    case "cloud":
      return (
        <>
          {hill}
          <circle cx={64} cy={26} r={10} fill={p.shape} opacity={0.75} />
          <path d="M26 54h44a10 10 0 0 0 1-20 14 14 0 0 0-26-4 10 10 0 0 0-17 6 9 9 0 0 0-2 18Z" fill={p.shape} />
          <circle cx={42} cy={44} r={2} fill={p.ink} opacity={0.7} />
          <circle cx={54} cy={44} r={2} fill={p.ink} opacity={0.7} />
          <path d="M45 49q3 3 6 0" fill="none" stroke={p.ink} strokeWidth={1.8} strokeLinecap="round" opacity={0.7} />
        </>
      );
  }
}

export function BookCover({
  id,
  title,
  author,
  className = "",
}: {
  id: string;
  title: string;
  author: string | null;
  className?: string;
}) {
  const h = hash(id);
  const p = PALETTES[h % PALETTES.length];
  const motif = pickMotif(title, h);

  return (
    <div
      className={`@container relative aspect-[3/4] overflow-hidden rounded-s-[3px] rounded-e-[10px] shadow-book ${className}`}
      style={{ backgroundColor: p.bg }}
      aria-hidden
    >
      <svg viewBox="0 0 100 80" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[62%] w-full">
        <MotifArt motif={motif} p={p} />
      </svg>
      <div className="absolute inset-x-0 top-0 ps-[16%] pe-[10%] pt-[12%]" style={{ color: p.ink }}>
        <p className="font-display text-[11.5cqw] leading-[1.1] font-semibold">{title}</p>
        {author && <p className="mt-[4cqw] text-[6.5cqw] font-medium opacity-75">{author}</p>}
      </div>
      {/* Spine and page-edge shading */}
      <div className="absolute inset-y-0 start-0 w-[8%] bg-black/12 shadow-[inset_-1px_0_0_rgb(255_255_255/0.35)]" />
      <div className="absolute inset-y-0 end-0 w-[3%] bg-linear-to-l from-black/10 to-transparent" />
    </div>
  );
}
