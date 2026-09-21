export function Shimmer({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative overflow-hidden bg-muted rounded-lg ${className}`}
      style={style}
      aria-hidden
    >
      <div className="shimmer absolute inset-0" />
    </div>
  );
}
