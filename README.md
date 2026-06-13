# densitygen

**A materials-selection copilot for chip R&D — built on live Materials Project data.**

Pick the right thin-film material for a next-generation chip in an afternoon instead of months.

---

## The pitch (for a non-technical audience)

**Why this matters.** Every modern chip — the ones in your phone, in AI data centers, in defense systems — is a stack of *hundreds* of films, each only a few atoms thick. Each film has a job: insulate, conduct, or block. When chips shrink to the next generation, the old materials physically stop working, and engineers have to find a new one. Today that search is brutal: a specialist runs giant physics simulations one material at a time, babysitting calculations that take days each and break constantly. Choosing well takes **months**, and a wrong choice can cost a fab a multi-year, multi-billion-dollar bet.

**How densitygen helps.** It turns a plain-English engineering requirement ("I need a leak-proof insulator for a 2nm transistor that survives a 1000°C bake") into a ranked shortlist of real candidate materials in seconds — pulling genuine, pre-computed physics data from the public **Materials Project** database, scoring every candidate against the spec, and showing the unavoidable trade-offs on one chart. An AI agent does the tedious orchestration (querying, filtering, ranking, troubleshooting), and the engineer makes the call. The expensive, slow simulations are reserved only for the final two or three finalists.

**Who it's for.** Computational materials scientists and process-integration engineers in **semiconductor fabs** (Intel, TSMC, Samsung, Applied Materials), **defense/aerospace** materials R&D, and the **precursor-chemical suppliers** (Merck, Entegris, Air Liquide) whose multi-million-dollar bets ride on picking the right material.

---

## What's real vs. illustrative

This is a hackathon build. We're honest about the boundary:

| Layer | Source |
| --- | --- |
| Candidate properties — κ, band gap, stability, bulk modulus, crystal structure | **Live Materials Project REST API** (real `mp-…` IDs) |
| Ranking, Pareto front, κ–E_g trade-off | computed in-app from the live data |
| ALD precursor mapping, HER volcano set | curated domain knowledge (not in MP) |
| DFT dispatch (Compute screen) | faithful **simulation** of an atomate2 → SLURM run |
| Surface-chemistry 3D reaction + activation energy | **authored, MLIP-style illustrative** trajectory — labeled schematic, never presented as a live computation |

If the Materials Project API key is missing or the API is down, the app **silently falls back** to a bundled candidate set and flags it as `CACHED` — so a live demo never fails.

## The six screens

1. **Intake** — natural-language fab spec → DFT-queryable property targets + hard constraints.
2. **Candidates** — dense, sortable table of live MP candidates, ranked, with Pareto-front tags.
3. **Trade-offs** — κ×E_g Pareto scatter, HER Sabatier volcano, and a constraint explorer.
4. **Compute** — simulated DFT dispatch with custodian auto-handling convergence failures.
5. **Material** — real relaxed crystal structure, computed properties, band sketch, full provenance.
6. **Surface** — interactive 3D ALD half-reaction with a hero activation-energy readout.

## Architecture

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Three.js. The Materials Project key lives server-side only (`MP_API_KEY`) and never reaches the browser. Maps to the intended 6-endpoint backend contract: `/candidates` (#2) and `/material/[id]` (#3) are live; spec-parse (#1), MLIP react/predict (#4), DFT dispatch (#5) and job stream (#6) are represented in the UI.

## Getting started

```bash
echo "MP_API_KEY=your_key_here" > .env.local   # free key: materialsproject.org/api
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without a key it runs on the cached set.

## Deploy

Deploys to **Vercel** as-is. Set `MP_API_KEY` in the project's environment variables.

---

The original Python/Replicate ALD-screening backend plan lives in [`docs/backend-plan.md`](docs/backend-plan.md).
