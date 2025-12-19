export async function onRequest(context) {
  const { params, env, request } = context;
  const battleId = params.battle_id;

  // URL of your existing authenticated Worker API
  const upstream = `https://game-api.abbacasa-031.workers.dev/battles/${encodeURIComponent(battleId)}`;

  const res = await fetch(upstream, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${env.GAME_API_TOKEN}`,
    },
  });

  // Pass through status + body
  const body = await res.text();

  return new Response(body, {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
      // CORS not needed since this is same-origin
      "Cache-Control": "no-store",
    },
  });
}
