export const prerender = false;

// GET /api/battles/:battle_id
export async function GET({ params }) {
  const battleId = params.battle_id;

  if (!battleId) {
    return new Response(JSON.stringify({ error: "Missing battle_id" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const upstream = `https://game-api.abbacasa-031.workers.dev/battles/${encodeURIComponent(battleId)}`;

  // In Astro on Cloudflare, env vars are available as import.meta.env.*
  const token =
    import.meta.env.PLACEHOLDER_SECRET ||
    import.meta.env.PUBLIC_PLACEHOLDER_SECRET; // (fallback, but ideally NOT public)

  if (!token) {
    return new Response(JSON.stringify({ error: "Server missing PLACEHOLDER_SECRET" }), {
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
