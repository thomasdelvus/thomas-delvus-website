export async function onRequestGet(context) {
  const { params, env } = context;
  const battleId = params.battle_id;

  // sanity check
  if (!battleId) {
    return new Response(JSON.stringify({ error: "Missing battle_id" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // your upstream Worker API
  const upstream = `https://game-api.abbacasa-031.workers.dev/battles/${encodeURIComponent(battleId)}`;

  const res = await fetch(upstream, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${env.GAME_API_TOKEN}`,
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
