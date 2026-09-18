// AAA Emergency Roadside Service brand mark.
// A clean SVG rendering of the classic AAA oval: three red A's inside
// a red oval, with the signature blue swoosh wrapping around it.
// Sized responsively via className width/height.

export function AAALogo({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 84"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AAA logo"
      className={className}
    >
      {/* Blue swoosh behind the oval */}
      <path
        d="M10 30 C 20 8, 60 2, 95 12 C 118 18, 120 40, 108 58 C 96 76, 55 82, 25 72 C 8 66, 2 50, 10 30 Z"
        fill="none"
        stroke="#003DA5"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Red oval */}
      <ellipse cx="60" cy="42" rx="44" ry="22" fill="#E4002B" />
      {/* Three white A's */}
      <g fill="#FFFFFF" fontFamily="'Arial Black', 'Helvetica', sans-serif" fontWeight="900" fontSize="22" textAnchor="middle">
        <text x="36" y="51">A</text>
        <text x="60" y="51">A</text>
        <text x="84" y="51">A</text>
      </g>
    </svg>
  );
}
