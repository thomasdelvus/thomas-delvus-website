export const prerender = false;

// GET /api/battles/:battle_id
export async function GET({ params, locals }) {
  const battleId = params.battle_id;

  if (!battleId) {
    return new Response(JSON.stringify({ error: "Missing battle_id" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const upstream = `https://game-api.abbacasa-031.workers.dev/battles/${encodeURIComponent(battleId)}`;

  // Cloudflare Pages (Astro) runtime env:
  const token =
    locals?.runtime?.env?.GAME_API_TOKEN ||
    import.meta.env.GAME_API_TOKEN; // fallback depending on adapter/version

  if (!token) {
    return new Response(JSON.stringify({ error: "Server missing GAME_API_TOKEN" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const res = await fetch(upstream, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await res.text();

  return new Response(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
      "cache-control": "no-store",
    },
  });
}
