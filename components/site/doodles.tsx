/** Small hand-drawn style SVG decorations. All are decorative (aria-hidden). */

type P = { className?: string };

export function Star({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2.5c.6 3.9 1.6 6.6 3.1 7.9 1.5 1.3 3.9 1.9 6.4 2-2.6.4-4.9 1.1-6.3 2.5-1.4 1.4-2.4 4-3.2 6.6-.6-2.7-1.5-5.2-2.9-6.6C7.7 13.5 5.3 12.9 2.5 12.4c2.8-.3 5.1-1 6.5-2.3 1.5-1.4 2.4-4 3-7.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Moon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M15.5 3.2A9 9 0 1 0 20.8 15 7.3 7.3 0 0 1 15.5 3.2Z" fill="currentColor" />
    </svg>
  );
}

export function Cloud({ className }: P) {
  return (
    <svg viewBox="0 0 48 28" className={className} aria-hidden>
      <path
        d="M12 26h26a8 8 0 0 0 .9-15.9A11 11 0 0 0 18 7.6 7.5 7.5 0 0 0 4.6 13 6.6 6.6 0 0 0 12 26Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Squiggle({ className }: P) {
  return (
    <svg viewBox="0 0 120 20" className={className} aria-hidden>
      <path
        d="M3 12c10-9 20-9 28 0s18 9 28 0 18-9 28 0 18 9 30-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Heart({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 20.5s-8-4.6-8-10.4A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 8 2.5c0 5.8-8 10.4-8 10.4Z"
        fill="currentColor"
      />
    </svg>
  );
}
