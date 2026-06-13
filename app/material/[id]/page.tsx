import Link from "next/link";
import { getCandidateById } from "@/lib/mp/queries";
import { getScorecard } from "@/lib/engine/queries";
import { CrystalViewer } from "@/components/screens/CrystalViewer";
import { PrecursorScorecard } from "@/components/screens/PrecursorScorecard";
import { sub, fmtHull, fmtKappa } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MaterialDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { candidate: c, structure, source } = await getCandidateById(id);
  const scorecard = await getScorecard(c.formula, false);
  const [spgSym, spgNum] = c.spg.split(" ");

  const top = scorecard?.response.ranked_candidates[0];

  const propRows = [
    { p: "Formation energy E_form", v: c.eform.toFixed(2), u: "eV/atom", m: "r²SCAN" },
    { p: "Band gap E_g", v: c.eg.toFixed(2), u: "eV", m: "HSE06" },
    { p: "Energy above hull", v: fmtHull(c.ehull), u: "meV/atom", m: "r²SCAN hull" },
    { p: "Dielectric const κ", v: fmtKappa(c.kappa), u: "—", m: "DFPT (e_total)" },
    { p: "Bulk modulus K", v: c.K?.toString() ?? "—", u: "GPa", m: "elastic K_VRH" },
    { p: "Density ρ", v: c.density.toFixed(2), u: "g/cm³", m: "relaxed" },
    { p: "Space group", v: spgSym, u: spgNum ?? "", m: c.sys },
  ];

  const provRows = [
    { k: "Materials Project ID", v: c.id },
    { k: "Properties", v: source === "live" ? "Materials Project (live API)" : "cached candidate set" },
    { k: "Structure", v: structure ? `relaxed cell · ${structure.sites.length} sites` : "—" },
    { k: "Precursor screen", v: scorecard ? `densitygen engine · ${scorecard.response.model_provenance?.compute_backend ?? "live"}` : "n/a for this film" },
    { k: "Workflow", v: "MP query → composite rank → ALD screen" },
  ];

  return (
    <div className="px-[22px] pb-10 pt-5">
      <div className="eyebrow">05 · Material detail</div>
      <div className="my-1 flex flex-wrap items-end gap-3.5">
        <h1 className="display text-[36px] leading-none">{sub(c.formula)}</h1>
        <span className="mono pb-1.5 text-[13px] text-muted">
          {c.id} · {c.sys} · {c.spg}
        </span>
        {c.inSpec && (
          <span className="mono mb-[7px] rounded-[2px] border border-amber-border bg-amber-tint px-2 py-[3px] text-[10px] text-amber-deep">
            PASSES SPEC
          </span>
        )}
        <Link href="/surface" className="btn-ghost mb-1 ml-auto">
          Surface chemistry ⌬
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[380px_1fr]">
        {/* left: real structure + real ALD recipe summary */}
        <div className="flex flex-col gap-4">
          <CrystalViewer structure={structure} />
          <div className="card">
            <div className="card-head">
              <span>ALD recipe</span>
              {top?.is_known_recipe && <span className="mono text-[10px] text-amber-deep">★ KNOWN</span>}
            </div>
            <div className="mono p-[13px] text-[12px] leading-[1.8] text-ink2">
              <KV k="best precursor" v={top ? top.name : c.ald} />
              <KV k="co-reactant" v={scorecard?.response.co_reactant ?? "—"} />
              <KV k="film element" v={top?.film_element ?? "—"} />
              <KV k="viability" v={top ? `${Math.round(top.overall_score * 100)}%` : "—"} />
            </div>
          </div>
        </div>

        {/* right: real MP properties + provenance */}
        <div className="flex flex-col gap-4">
          <div className="card overflow-hidden">
            <div className="card-head">
              <span>Computed properties</span>
              <span className="mono text-[10px]" style={{ color: source === "live" ? "var(--color-ok)" : "var(--color-warn)" }}>
                {source === "live" ? "MATERIALS PROJECT · LIVE" : "CACHED"}
              </span>
            </div>
            <table className="dg-table">
              <tbody>
                {propRows.map((p) => (
                  <tr key={p.p}>
                    <td className="text-muted">{p.p}</td>
                    <td className="mono !text-right font-medium text-ink whitespace-nowrap">
                      {p.v} <span className="font-normal text-faint">{p.u}</span>
                    </td>
                    <td className="mono !text-right text-[10.5px] text-faint whitespace-nowrap">{p.m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="card-head">
              <span>Data provenance</span>
              <span className="mono text-[10px]" style={{ color: "var(--color-ok)" }}>
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-ok)" }} />
                VERIFIED CHAIN
              </span>
            </div>
            <div className="px-[13px] pb-[11px] pt-1.5">
              {provRows.map((p) => (
                <div key={p.k} className="flex justify-between gap-3.5 border-b border-hair2 py-1.5">
                  <span className="whitespace-nowrap text-[12px] text-faint">{p.k}</span>
                  <span className="mono text-right text-[11.5px] text-ink2">{p.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* full-width: live precursor screening from the backend */}
      <div className="mt-4">
        <PrecursorScorecard result={scorecard} formula={c.formula} />
      </div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-faint">{k}</span>
      <span>{v}</span>
    </div>
  );
}
