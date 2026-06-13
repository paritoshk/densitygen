import { getScorecard } from "@/lib/engine/queries";

// POST /api/screen { formula, useMl? } → live precursor scorecard for the
// film matching `formula` (proxied to the screening backend). Used by the
// client-side Surface viewer.
export async function POST(req: Request) {
  let body: { formula?: string; useMl?: boolean };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  if (!body.formula) return Response.json({ error: "formula required" }, { status: 400 });
  const result = await getScorecard(body.formula, body.useMl ?? false);
  if (!result) return Response.json({ supported: false }, { status: 200 });
  return Response.json({ supported: true, ...result });
}
