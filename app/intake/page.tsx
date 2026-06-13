import { screenPrecursors } from "@/lib/engine/client";
import { SCENARIOS } from "@/lib/data/scenarios";
import { ScreeningConsole } from "@/components/screens/ScreeningConsole";
import type { ScreenResponse } from "@/lib/engine/types";

export const dynamic = "force-dynamic";

export default async function IntakePage() {
  const s = SCENARIOS[0]; // Mo interconnect — the pitch hero
  let initial: ScreenResponse | null = null;
  try {
    initial = await screenPrecursors({
      film: s.film,
      co_reactant: s.coReactant,
      temperature_max_c: 350,
      candidates: s.candidates,
      use_ml_potential: false,
    });
  } catch {
    initial = null;
  }
  return <ScreeningConsole initialKey={s.key} initialFilm={s.film} initialResponse={initial} />;
}
