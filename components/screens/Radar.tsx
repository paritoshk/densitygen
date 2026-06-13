import type { ScoreComponent } from "@/lib/engine/types";

// 7-axis viability radar for a precursor scorecard (presentational, SSR-safe).
const SIZE = 300;
const CX = SIZE / 2;
const CY = SIZE / 2 + 6;
const R = 104;

const SHORT: Record<string, string> = {
  delivery: "delivery",
  thermal_window: "thermal",
  surface_reactivity: "reactivity",
  self_limiting: "self-limit",
  clean_ligand: "clean lig.",
  byproduct: "byproduct",
  integration: "integration",
};

export function Radar({ components }: { components: ScoreComponent[] }) {
  const n = components.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, r: number) => [CX + Math.cos(angle(i)) * r, CY + Math.sin(angle(i)) * r];

  const valuePoly = components
    .map((c, i) => {
      const [x, y] = pt(i, R * Math.max(0.04, c.score));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="block h-auto w-full">
      {/* grid rings */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={components.map((_, i) => pt(i, R * f).map((v) => v.toFixed(1)).join(",")).join(" ")}
          fill="none"
          stroke="var(--color-hair)"
          strokeWidth={1}
        />
      ))}
      {/* spokes */}
      {components.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--color-hair2)" strokeWidth={1} />;
      })}
      {/* value polygon */}
      <polygon points={valuePoly} fill="rgba(180,83,9,0.16)" stroke="var(--color-amber)" strokeWidth={1.8} />
      {components.map((c, i) => {
        const [x, y] = pt(i, R * Math.max(0.04, c.score));
        return <circle key={i} cx={x} cy={y} r={3} fill="var(--color-amber)" />;
      })}
      {/* axis labels */}
      {components.map((c, i) => {
        const [x, y] = pt(i, R + 20);
        const a = angle(i);
        const anchor = Math.abs(Math.cos(a)) < 0.3 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
        return (
          <text
            key={i}
            x={x}
            y={y}
            fill="var(--color-muted)"
            className="mono"
            fontSize={9}
            textAnchor={anchor}
            dominantBaseline="middle"
          >
            {SHORT[c.name] ?? c.name}
          </text>
        );
      })}
    </svg>
  );
}
