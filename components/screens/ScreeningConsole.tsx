"use client";

import { useState } from "react";
import Link from "next/link";
import { SCENARIOS, FILMS, CO_REACTANTS, parseCandidates, type Scenario } from "@/lib/data/scenarios";
import type { ScreenResponse, ScorecardCandidate } from "@/lib/engine/types";
import { Radar } from "./Radar";
import { sub } from "@/lib/format";

const pct = (s: number) => Math.round(s * 100);
const compScore = (c: ScorecardCandidate, n: string) =>
  c.components.find((x) => x.name === n)?.score ?? 0;

export function ScreeningConsole({
  initialKey,
  initialResponse,
  initialSource = "live",
}: {
  initialKey: string;
  initialFilm?: string;
  initialResponse: ScreenResponse | null;
  initialSource?: "live" | "cached";
}) {
  const init = SCENARIOS.find((s) => s.key === initialKey) ?? SCENARIOS[0];
  const [film, setFilm] = useState(init.film);
  const [co, setCo] = useState(init.coReactant);
  const [temp, setTemp] = useState(String(init.temp));
  const [forbidden, setForbidden] = useState(init.forbidden ?? "");
  const [candsText, setCandsText] = useState(init.candsText);

  const [resp, setResp] = useState<ScreenResponse | null>(initialResponse);
  const [source, setSource] = useState<"live" | "cached">(initialSource);
  const [sel, setSel] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run(f = film, c = co, t = temp, fb = forbidden, cands = candsText) {
    const candidates = parseCandidates(cands);
    if (!candidates.length) {
      setError("Enter at least one candidate.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const r = await fetch("/api/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          film: f,
          coReactant: c || undefined,
          temp: Number(t) || undefined,
          forbidden: fb ? fb.split(/[,\s]+/).filter(Boolean) : undefined,
          candidates,
          useMl: false,
        }),
      }).then((x) => x.json());
      if (r.supported) {
        setResp(r.response);
        setSource(r.source ?? "live");
        setSel(0);
      } else {
        setError("Engine couldn’t screen that film.");
      }
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(s: Scenario) {
    setFilm(s.film);
    setCo(s.coReactant);
    setTemp(String(s.temp));
    setForbidden(s.forbidden ?? "");
    setCandsText(s.candsText);
    run(s.film, s.coReactant, String(s.temp), s.forbidden ?? "", s.candsText);
  }

  const ranked = resp?.ranked_candidates ?? [];
  const active = ranked[sel];
  const backend = resp?.model_provenance?.compute_backend ?? "engine";

  return (
    <div className="px-[22px] pb-10 pt-5">
      <div className="eyebrow">01 · Screening console</div>
      <div className="my-1 flex flex-wrap items-end justify-between gap-x-5 gap-y-3.5">
        <div className="min-w-[290px] flex-1 basis-[360px]">
          <h1 className="display text-[32px]">
            Screen the <span className="accent">precursor</span>
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Pick a target film and candidate precursors — the engine ranks them on a 7-axis viability
            scorecard in one call. Defaults to the Mo interconnect (Cu→Mo) decision.
          </p>
        </div>
        <div
          className="mono flex items-center gap-1.5 text-[11px]"
          style={{ color: source === "live" ? "var(--color-ok)" : "var(--color-warn)" }}
        >
          <span className="dot-blink" /> {source === "live" ? "LIVE ENGINE" : "CACHED ENGINE"} · {backend}
        </div>
      </div>

      {/* ---------- INPUT FORM ---------- */}
      <div className="card mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_140px_160px]">
          <Field label="Target film">
            <select value={film} onChange={(e) => setFilm(e.target.value)} className="dg-input">
              {FILMS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Co-reactant">
            <select value={co} onChange={(e) => setCo(e.target.value)} className="dg-input">
              {CO_REACTANTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Max temp (°C)">
            <input value={temp} onChange={(e) => setTemp(e.target.value)} type="number" className="dg-input" />
          </Field>
          <Field label="Forbidden elements">
            <input value={forbidden} onChange={(e) => setForbidden(e.target.value)} placeholder="e.g. Cl" className="dg-input" />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Candidate precursors (name or formula, comma-separated)">
            <input value={candsText} onChange={(e) => setCandsText(e.target.value)} placeholder="MoO2Cl2, Mo(CO)6, …" className="dg-input" />
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.key}
              onClick={() => applyPreset(s)}
              className="rounded-full border border-line bg-panel px-3 py-1 text-[11.5px] text-ink2 hover:border-amber-border hover:text-amber-deep"
              title={s.sub}
            >
              {sub(s.label)}
            </button>
          ))}
        </div>
        <div className="mt-3.5 flex items-center gap-3">
          <button onClick={() => run()} disabled={loading} className="btn-primary">
            {loading ? "Screening…" : "Screen candidates →"}
          </button>
          {error && <span className="mono text-[11.5px]" style={{ color: "var(--color-warn)" }}>{error}</span>}
        </div>
      </div>

      {/* ---------- RESULTS ---------- */}
      {resp && (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-4">
            <div className="card overflow-hidden" style={{ opacity: loading ? 0.5 : 1 }}>
              <div className="card-head">
                <span>
                  Ranked precursors · <span className="mono text-amber-deep">{sub(film)}</span>{" "}
                  <span className="mono text-[11px] font-normal text-faint">+ {resp.co_reactant ?? co}</span>
                </span>
                <span className="mono text-[10px] text-faint">{ranked.length} candidates</span>
              </div>
              <table className="dg-table">
                <thead>
                  <tr>
                    <th className="!text-right">#</th>
                    <th className="!text-left">Precursor</th>
                    <th className="!text-left">Formula</th>
                    <th className="!text-right">MW</th>
                    <th className="!text-left">Viability</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((r, i) => (
                    <tr
                      key={r.name + i}
                      onClick={() => setSel(i)}
                      className="cursor-pointer"
                      style={i === sel ? { background: "var(--color-amber-tint)", boxShadow: "inset 2px 0 0 var(--color-amber)" } : undefined}
                    >
                      <td className="mono !text-right text-faint">{i + 1}</td>
                      <td>
                        <span className="font-semibold text-ink">{r.name}</span>
                        {r.is_known_recipe && <span className="mono ml-1.5 text-[10px] text-amber-deep">★</span>}
                      </td>
                      <td className="mono text-[11.5px] text-muted">{r.formula ? sub(r.formula) : "—"}</td>
                      <td className="mono !text-right text-muted">{r.molecular_weight ? r.molecular_weight.toFixed(0) : "—"}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-[5px] min-w-[60px] flex-1 overflow-hidden rounded-[2px] bg-hair2">
                            <div className="h-full bg-amber" style={{ width: `${pct(r.overall_score)}%` }} />
                          </div>
                          <span className="mono text-[11.5px] font-medium text-ink">{pct(r.overall_score)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card p-2 pb-1">
              <div className="flex justify-between px-2 pb-1 pt-1.5">
                <span className="mono text-[11px] text-muted">TRADE-OFF · clean ligand vs surface reactivity</span>
                <span className="mono text-[11px] text-amber-deep">contamination ↔ fill</span>
              </div>
              <TradeOff ranked={ranked} sel={sel} onSel={setSel} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {active && (
              <div className="card">
                <div className="card-head">
                  <span>
                    {active.name} {active.is_known_recipe && <span className="mono text-[10px] text-amber-deep">★ known</span>}
                  </span>
                  <span className="mono text-[11px] font-medium text-ink">{pct(active.overall_score)}/100</span>
                </div>
                <div className="px-2 pt-2">
                  <Radar components={active.components} />
                </div>
                {active.ml_energy_ev != null && (
                  <div className="mono px-[13px] pb-1 text-center text-[11px] text-amber-deep">
                    MLIP E = {active.ml_energy_ev.toFixed(2)} eV
                  </div>
                )}
                <div className="border-t border-hair bg-amber-tint px-[13px] py-2.5">
                  <div className="mono text-[10px] uppercase tracking-[0.08em] text-amber-deep">Recommended next step</div>
                  <div className="mt-1 text-[12px] leading-snug text-ink2">{active.recommended_next_step}</div>
                </div>
              </div>
            )}
            <Link href="/surface" className="btn-primary text-center">
              See surface chemistry ⌬
            </Link>
          </div>
        </div>
      )}

      <p className="mono mt-4 text-center text-[11px] text-faint">
        DensityGen · descriptor scoring shown live · real UMA/CHGNet energies via the CLI{" "}
        <span className="text-muted">(ald-screen demo --uma)</span>
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="mono text-[10px] uppercase tracking-[0.06em] text-faint">{label}</span>
      {children}
    </label>
  );
}

function TradeOff({
  ranked,
  sel,
  onSel,
}: {
  ranked: ScorecardCandidate[];
  sel: number;
  onSel: (i: number) => void;
}) {
  const W = 560,
    H = 230,
    pad = 44;
  const px = (v: number) => pad + v * (W - pad - 16);
  const py = (v: number) => H - 28 - v * (H - 28 - 14);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
      <rect x={pad} y={14} width={W - pad - 16} height={H - 28 - 14} fill="var(--color-canvas)" />
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <text x={pad - 6} y={py(t)} dy={3} textAnchor="end" className="mono" fontSize={9} fill="var(--color-faint)">
            {t.toFixed(1)}
          </text>
          <text x={px(t)} y={H - 12} textAnchor="middle" className="mono" fontSize={9} fill="var(--color-faint)">
            {t.toFixed(1)}
          </text>
        </g>
      ))}
      <text x={(W + pad) / 2} y={H - 1} textAnchor="middle" fontSize={10} fill="var(--color-muted)">
        clean ligand →
      </text>
      <text x={12} y={H / 2} textAnchor="middle" fontSize={10} fill="var(--color-muted)" transform={`rotate(-90 12 ${H / 2})`}>
        surface reactivity →
      </text>
      {ranked.map((c, i) => {
        const x = px(compScore(c, "clean_ligand"));
        const y = py(compScore(c, "surface_reactivity"));
        const on = i === sel;
        return (
          <g key={c.name + i} style={{ cursor: "pointer" }} onClick={() => onSel(i)}>
            <circle cx={x} cy={y} r={on ? 8 : 6} fill={on ? "var(--color-amber)" : "#fff"} stroke={on ? "var(--color-amber-deep)" : "var(--color-line)"} strokeWidth={on ? 2.5 : 1.4} />
            <text x={x} y={y - 11} textAnchor="middle" className="mono" fontSize={10} fill={on ? "var(--color-amber-deep)" : "var(--color-muted)"}>
              {c.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
