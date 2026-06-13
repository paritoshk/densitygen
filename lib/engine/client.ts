// Server-side client for the DensityGen ALD-screening backend.
import type { ScreenRequest, ScreenResponse } from "./types";

export const ENGINE_URL =
  process.env.ENGINE_API_URL ?? "https://yushg-densitygen-ald.hf.space";

export class EngineError extends Error {}

/**
 * POST /api/screen — rank candidate precursors for a target film.
 * Descriptor scoring is fast (~1s); use_ml_potential runs a real MLIP and is
 * slower, so it gets a longer timeout. Throws EngineError on failure; callers
 * decide whether to fall back.
 */
export async function screenPrecursors(req: ScreenRequest): Promise<ScreenResponse> {
  const timeout = req.use_ml_potential ? 60000 : 15000;
  let res: Response;
  try {
    res = await fetch(`${ENGINE_URL}/api/screen`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(req),
      signal: AbortSignal.timeout(timeout),
      next: { revalidate: req.use_ml_potential ? 86400 : 3600 },
    });
  } catch (e) {
    throw new EngineError(`engine request failed: ${(e as Error).message}`);
  }
  if (!res.ok) throw new EngineError(`engine responded ${res.status}`);
  return res.json();
}
