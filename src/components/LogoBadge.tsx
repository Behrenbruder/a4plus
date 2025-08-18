export function LogoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-2xl px-3 py-1.5 font-bold text-white leading-none shadow-sm ${className}`}
      style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
      aria-label="a4 Plus"
    >
      a4+
    </span>
  );
}
