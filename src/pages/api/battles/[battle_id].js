export async function GET({ params, request }) {
  const battleId = params.battle_id;

  const upstream = `https://game-api.abbacasa-031.workers.dev/battles/${encodeURIComponent(battleId)}`;

  const res = await fetch(upstream, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${import.meta.env.GAME_API_TOKEN}`,
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
