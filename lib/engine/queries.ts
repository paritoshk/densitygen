import { cache } from "react";
import { screenPrecursors } from "./client";
import { resolveFilm } from "../data/precursors";
import type { ScreenResponse } from "./types";

export interface ScorecardResult {
  film: string; // the backend-supported film we screened
  response: ScreenResponse;
}

/**
 * Run a live precursor screen for the film that best matches `formula`.
 * Returns null when no backend-supported film matches, or the engine is down.
 */
export const getScorecard = cache(
  async (formula: string, useMl = false): Promise<ScorecardResult | null> => {
    const fs = resolveFilm(formula);
    if (!fs) return null;
    try {
      const response = await screenPrecursors({
        film: fs.film,
        co_reactant: fs.coReactant,
        temperature_max_c: 350,
        candidates: fs.candidates,
        use_ml_potential: useMl,
      });
      return { film: fs.film, response };
    } catch {
      // ML path can be slow on the free Space — retry once without it.
      if (useMl) return getScorecard(formula, false);
      return null;
    }
  },
);
