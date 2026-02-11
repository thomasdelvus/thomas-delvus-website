export function createApiController({
  STATE,
  VIEW,
  mapSelect,
  updateRoofSpine,
  normalizeRoofWeathering,
  parseHexLabel,
  setCameraFromHex,
  getQueryParams,
  getAuthHeaders,
}) {
  function normalizeState(state) {
    if (!state || typeof state !== "object") return { floors: [] };
    if (!Array.isArray(state.floors)) {
      const floorId = state.view && state.view.floorId ? String(state.view.floorId) : "ground";
      state.floors = [{
        id: floorId,
        name: floorId,
        rooms: Array.isArray(state.rooms) ? state.rooms : [],
        openings: Array.isArray(state.openings) ? state.openings : [],
        objects: Array.isArray(state.objects) ? state.objects : [],
      }];
    }
    for (const floor of state.floors) {
      if (!floor || typeof floor !== "object") continue;
      floor.id = String(floor.id || "floor");
      if (!Array.isArray(floor.rooms)) floor.rooms = [];
      if (!Array.isArray(floor.openings)) floor.openings = [];
      if (!Array.isArray(floor.objects)) floor.objects = [];
      if (!Array.isArray(floor.roofs)) floor.roofs = [];
      for (const roof of floor.roofs) {
        if (roof && typeof roof === "object") {
          if (typeof normalizeRoofWeathering === "function") normalizeRoofWeathering(roof);
          updateRoofSpine(roof);
        }
      }
      for (const obj of floor.objects) {
        if (obj && obj.floorId == null) obj.floorId = floor.id;
      }
    }
    return state;
  }

  function extractScene(raw) {
    if (!raw || typeof raw !== "object") return { scene: { floors: [] }, wrapper: null, recordId: "" };
    if (raw.records && typeof raw.records === "object") {
      const activeId = raw.active && raw.active.recordId ? String(raw.active.recordId) : "";
      let recordId = activeId;
      let scene = recordId && raw.records[recordId] ? raw.records[recordId] : null;
      if (!scene) {
        const keys = Object.keys(raw.records);
        if (keys.length) {
          recordId = keys[0];
          scene = raw.records[recordId];
        }
      }
      if (!scene || typeof scene !== "object") return { scene: { floors: [] }, wrapper: raw, recordId: recordId || "" };
      return { scene, wrapper: raw, recordId: recordId || "" };
    }
    return { scene: raw, wrapper: null, recordId: "" };
  }

  function applyViewFromState(scene) {
    const view = scene && scene.view ? scene.view : {};
    const floorId = view.floorId || view.floor_id || view.floor || null;
    if (floorId) VIEW.floorId = String(floorId);
    const camHex = view.camera_hex || view.cameraHex || null;
    if (camHex) {
      const p = parseHexLabel(camHex);
      if (p) setCameraFromHex(p);
    }
  }

  function resolveBattleId() {
    const qp = getQueryParams();
    return qp.get("battle_id") || qp.get("battleId") || qp.get("id");
  }

  async function loadBattle() {
    const battleId = resolveBattleId();
    if (!battleId) throw new Error("Missing battle_id");

    const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const qp = getQueryParams();
    const devStateUrl = isLocal ? (qp.get("dev_state") || qp.get("state_url") || "") : "";
    if (devStateUrl) {
      const res = await fetch(devStateUrl, { cache: "no-store" });
      if (!res.ok) throw new Error("Dev state load failed");
      const raw = await res.json();
      const extracted = extractScene(raw);
      STATE.wrapper = extracted.wrapper;
      STATE.recordId = extracted.recordId;
      STATE.battle = normalizeState(extracted.scene);
      applyViewFromState(STATE.battle);
      STATE.battle._battle_id = battleId;
      return;
    }

    const res = await fetch(`/api/battles/${encodeURIComponent(battleId)}`, {
      headers: { accept: "application/json", ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Battle load failed");
    const data = await res.json();
    const raw = data && data.state_json ? JSON.parse(data.state_json) : data;
    const extracted = extractScene(raw);
    STATE.wrapper = extracted.wrapper;
    STATE.recordId = extracted.recordId;
    STATE.battle = normalizeState(extracted.scene);
    applyViewFromState(STATE.battle);
    STATE.battle._battle_id = data.battle_id || battleId;
    STATE.battle._campaign_id = data.campaign_id || data.campaignId || null;
  }

  function getCampaignId() {
    return STATE.battle && (STATE.battle._campaign_id || STATE.battle.campaign_id || STATE.battle.campaignId) || null;
  }

  async function loadCampaign() {
    const cid = getCampaignId();
    if (!cid) return;
    const res = await fetch(`/api/campaigns/${encodeURIComponent(cid)}`, {
      headers: { accept: "application/json", ...getAuthHeaders() },
    });
    if (!res.ok) return;
    const data = await res.json();
    let meta = data.meta_json || data.metaJson || null;
    if (typeof meta === "string") {
      try { meta = JSON.parse(meta); } catch { meta = null; }
    }
    STATE.campaign = meta || {};
    STATE.entities = (STATE.campaign.world && Array.isArray(STATE.campaign.world.entities))
      ? STATE.campaign.world.entities
      : [];
  }

  function buildMapOptionsFromMeta(meta) {
    if (!meta) return [];
    const world = meta.world || meta;
    const map =
      (world && (world.poi_index || world.poiIndex || world.poi_to_battle || world.poiToBattle || world.pois)) ||
      (meta.poi_index || meta.poiIndex);
    if (!map || typeof map !== "object") return [];
    const out = [];
    for (const [poiId, entry] of Object.entries(map)) {
      if (!entry) continue;
      if (typeof entry === "string") {
        out.push({ id: entry, label: poiId });
        continue;
      }
      if (typeof entry === "object") {
        const id = entry.battle_id || entry.battleId || entry.id || entry.value;
        if (!id) continue;
        const label = entry.title || entry.name || entry.label || entry.poi_name || entry.poiName || poiId;
        out.push({ id, label });
      }
    }
    return out;
  }

  async function loadMapOptions() {
    if (!mapSelect) return;
    const battleId = STATE.battle && STATE.battle._battle_id;
    let options = [];
    const cid = getCampaignId();
    if (cid) {
      try {
        const res = await fetch(`/api/battles?campaign_id=${encodeURIComponent(cid)}`, {
          headers: { accept: "application/json", ...getAuthHeaders() },
        });
        if (res.ok) {
          const data = await res.json();
          const rows = Array.isArray(data.rows) ? data.rows : [];
          options = rows.map((row) => ({
            id: row.battle_id || row.battleId || row.id,
            label: row.name || row.title || row.battle_id || row.battleId || row.id,
          })).filter((opt) => opt.id);
        }
      } catch {}
    }
    if (!options.length) {
      options = buildMapOptionsFromMeta(STATE.campaign || {});
    }
    mapSelect.innerHTML = "";
    if (!options.length) {
      const opt = document.createElement("option");
      opt.value = battleId || "";
      opt.textContent = battleId || "No maps";
      mapSelect.appendChild(opt);
      return;
    }
    for (const optData of options) {
      const opt = document.createElement("option");
      opt.value = optData.id;
      opt.textContent = optData.label || optData.id;
      if (battleId && String(optData.id) === String(battleId)) opt.selected = true;
      mapSelect.appendChild(opt);
    }
  }

  function resolvePoiId() {
    const campaign = STATE.campaign || {};
    const index = campaign.poi_index || (campaign.world && campaign.world.poi_index) || null;
    const bid = STATE.battle && STATE.battle._battle_id;
    if (!index || !bid) return "";
    for (const [poi, battleId] of Object.entries(index)) {
      if (String(battleId) === String(bid)) return String(poi);
    }
    return "";
  }

  return {
    normalizeState,
    extractScene,
    applyViewFromState,
    resolveBattleId,
    loadBattle,
    getCampaignId,
    loadCampaign,
    buildMapOptionsFromMeta,
    loadMapOptions,
    resolvePoiId,
  };
}
