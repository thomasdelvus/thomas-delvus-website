export const prerender = false;

// Shared helper: read token from Pages runtime (preferred) or fallback
function getToken(locals) {
  return (
    locals?.runtime?.env?.GAME_API_TOKEN ||
    import.meta.env.GAME_API_TOKEN
  );
}

// Shared helper: upstream URL
function upstreamUrl(battleId) {
  return `https://game-api.abbacasa-031.workers.dev/battles/${encodeURIComponent(battleId)}`;
}

// GET /api/battles/:battle_id  (read-only proxy)
export async function GET({ params, locals }) {
  const battleId = params.battle_id;

  if (!battleId) {
    return new Response(JSON.stringify({ error: "Missing battle_id" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const token = getToken(locals);
  if (!token) {
    return new Response(JSON.stringify({ error: "Server missing GAME_API_TOKEN" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const res = await fetch(upstreamUrl(battleId), {
    method: "GET",
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

// PUT /api/battles/:battle_id  (write proxy)
// Expected request body (example):
// {
//   "state_json": { ... }   // OR state_json: "{...}" (string)
//   // optionally: "name", "campaign_id", "version"
// }
export async function PUT({ params, locals, request }) {
  const battleId = params.battle_id;

  if (!battleId) {
    return new Response(JSON.stringify({ error: "Missing battle_id" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const token = getToken(locals);
  if (!token) {
    return new Response(JSON.stringify({ error: "Server missing GAME_API_TOKEN" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Body must be JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // Normalize payload so upstream consistently receives a STRING state_json
  // (matches your DB schema where state_json is stored as TEXT)
  if (payload && typeof payload.state_json === "object") {
    payload.state_json = JSON.stringify(payload.state_json);
  }

  const res = await fetch(upstreamUrl(battleId), {
    method: "PUT", // <-- change to PATCH/POST if your Worker expects that instead
    headers: {
      Accept: "application/json",
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
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

// Optional: if you want to accept POST/PATCH too and forward them identically:
export async function POST(ctx) { return PUT(ctx); }
export async function PATCH(ctx) { return PUT(ctx); }
