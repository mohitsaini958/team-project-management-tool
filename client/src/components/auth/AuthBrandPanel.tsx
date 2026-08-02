import { useEffect, useState } from 'react';

const COLUMNS = [
  { label: 'Backlog', color: '#7a8290' },
  { label: 'Active', color: '#5b8fd9' },
  { label: 'Review', color: '#e0a840' },
  { label: 'Done', color: '#4ddac2' },
];

const GAP = 8; // px — must match the flex `gap-2` on the row below

export default function AuthBrandPanel() {
  const [mounted, setMounted] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  // Entrance animation — headline and columns fade/slide in once on mount
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // The card advances one column every 2.4s and loops back to Backlog.
  // Same mechanic as the landing page hero — real product motion,
  // not a decorative loop unrelated to what the app actually does.
  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((i) => (i + 1) % COLUMNS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const activeColor = COLUMNS[stageIndex].color;

  return (
    <div className="hidden md:flex md:flex-col md:justify-between relative overflow-hidden bg-[#12161d] border-r border-[#242b37] p-12">
      <div
        className="pointer-events-none absolute inset-0 transition-[background] duration-700"
        style={{
          background: `radial-gradient(500px 300px at 15% 15%, ${hexToRgba(
            activeColor,
            0.08
          )}, transparent 60%)`,
        }}
      />

      <div className="relative z-10 flex items-center gap-2.5 font-display font-semibold text-[17px]">
        <LogoMark activeIndex={stageIndex} />
        ProjectFlow
      </div>

      <div className="relative z-10">
        <div
          className={`flex items-center gap-2 mb-5 transition-all duration-500 ${
            mounted ? 'opacity-100' : 'opacity-0 -translate-y-1'
          }`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full transition-colors duration-700"
            style={{ background: activeColor, boxShadow: `0 0 8px ${activeColor}` }}
          />
          <span className="font-mono text-[11px] text-[#565f6f] uppercase tracking-wider">
            Live board
          </span>
        </div>

        <h1
          className={`font-display font-semibold text-[32px] leading-tight tracking-tight mb-4 max-w-[380px] text-[#e8eaef] transition-all duration-500 delay-75 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          Every issue, exactly where your team left it.
        </h1>
        <p
          className={`text-[#8b93a3] text-[14.5px] max-w-[340px] leading-relaxed transition-all duration-500 delay-150 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          Backlog to Done, with a history you can trust and permissions that
          actually hold.
        </p>

        <div
          className={`relative flex gap-2 mt-10 transition-all duration-500 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          {COLUMNS.map((col, i) => (
            <MiniColumn key={col.label} label={col.label} color={col.color} isActive={i === stageIndex} />
          ))}

          {/* The traveling card — one element, sliding across all four columns */}
          <div
            className="absolute top-6 pointer-events-none transition-[left] duration-700 ease-[cubic-bezier(.65,0,.35,1)]"
            style={{
              left: `calc(${stageIndex} * ((100% - ${3 * GAP}px)/4 + ${GAP}px))`,
              width: `calc((100% - ${3 * GAP}px)/4)`,
            }}
          >
            <div className="bg-[#0c0f14] border border-[#242b37] rounded-md px-2 py-2 shadow-lg">
              <div className="font-mono text-[9px] text-[#565f6f] mb-1">ISSUE-8f3a2c</div>
              <div className="text-[9.5px] text-[#e8eaef] font-medium leading-snug">
                Fix login redirect
              </div>
              <div
                className="h-[2.5px] rounded-full mt-1.5 transition-colors duration-500"
                style={{ background: activeColor }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-[12.5px] text-[#565f6f]">
        © 2026 ProjectFlow
      </div>
    </div>
  );
}

function LogoMark({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="w-5 h-5 relative">
      {COLUMNS.map((col, i) => {
        const pos = [
          { top: 0, left: 0 },
          { top: 0, right: 0 },
          { bottom: 0, left: 0 },
          { bottom: 0, right: 0 },
        ][i];
        return (
          <span
            key={col.label}
            className="absolute w-2 h-2 rounded-sm transition-transform duration-300"
            style={{
              background: col.color,
              ...pos,
              transform: i === activeIndex ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        );
      })}
    </div>
  );
}

function MiniColumn({
  label,
  color,
  isActive,
}: {
  label: string;
  color: string;
  isActive: boolean;
}) {
  return (
    <div
      className={`flex-1 bg-[#181d26] border rounded-lg p-2.5 min-h-[70px] transition-colors duration-500 ${
        isActive ? 'border-[#2f3947]' : 'border-[#242b37]'
      }`}
    >
      <span className="font-mono text-[9.5px] text-[#565f6f] uppercase tracking-wide flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full inline-block transition-shadow duration-300"
          style={{
            background: color,
            boxShadow: isActive ? `0 0 6px ${color}` : 'none',
          }}
        />
        {label}
      </span>
    </div>
  );
}

// Small helper so the ambient glow behind the headline can shift color
// smoothly to match whichever column the demo card is currently in.
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}