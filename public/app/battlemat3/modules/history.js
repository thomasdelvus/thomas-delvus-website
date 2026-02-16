export function createHistoryController({
  STATE,
  HISTORY,
  undoButton,
  saveStatus,
  setFloorOptions,
  renderStatus,
  render,
}) {
  function openingKindCategory(kindRaw) {
    const kind = String(kindRaw || "").trim().toLowerCase();
    if (!kind) return "door";
    if (kind.startsWith("window")) return "window";
    if (kind.startsWith("portal")) return "portal";
    if (kind.startsWith("threshold")) return "threshold";
    if (kind.startsWith("gate")) return "gate";
    if (kind === "door" || kind.startsWith("door.")) return "door";
    return "door";
  }

  function normalizeOpeningKind(kindRaw) {
    const raw = String(kindRaw || "").trim().toLowerCase();
    if (!raw) return "door.wood";
    if (raw === "door") return "door.wood";
    return raw;
  }

  function normalizeOpeningState(kind, stateRaw) {
    const state = String(stateRaw || "").trim().toLowerCase();
    if (kind === "portal" || kind === "threshold") return "open";
    if (kind === "window") {
      if (state === "open" || state === "opened") return "open";
      return "closed";
    }
    if (kind === "gate") {
      if (state === "open" || state === "opened" || state === "raised" || state === "up") return "open";
      if (state === "locked" || state === "barred" || state === "sealed") return "locked";
      return "closed";
    }
    if (state === "open" || state === "opened" || state === "unlocked") return "unlocked";
    if (state === "barred" || state === "sealed") return state;
    if (state === "locked") return "locked";
    return "locked";
  }

  function clamp01(value, fallback = 0) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    if (n <= 0) return 0;
    if (n >= 1) return 1;
    return n;
  }

  function normalizeOpeningsForSave(battle) {
    if (!battle || typeof battle !== "object" || !Array.isArray(battle.floors)) return;
    for (const floor of battle.floors) {
      if (!floor || typeof floor !== "object" || !Array.isArray(floor.openings)) continue;
      const floorId = String(floor.id || "");
      for (const opening of floor.openings) {
        if (!opening || typeof opening !== "object") continue;
        const normalizedKind = normalizeOpeningKind(opening.kind);
        const kind = openingKindCategory(normalizedKind);
        const normalizedState = normalizeOpeningState(kind, opening.state ?? opening.lock_state ?? opening.lockState);
        const openFallback = normalizedState === "open" ? 1 : 0;
        opening.kind = normalizedKind;
        opening.state = normalizedState;
        opening.lock_state = normalizedState;
        if (opening.lockState != null) delete opening.lockState;
        opening.openPct = clamp01(opening.openPct ?? opening.open, openFallback);
        opening.orientation = String(opening.orientation || "").trim().toLowerCase() === "v" ? "v" : "h";
        if (!opening.floorId && floorId) opening.floorId = floorId;
        if (opening.floorId != null) opening.floorId = String(opening.floorId);
        if (opening.len != null) {
          const len = Number(opening.len);
          if (Number.isFinite(len) && len > 0) opening.len = len;
          else delete opening.len;
        }
        if (opening.thickness != null) {
          const thickness = Number(opening.thickness);
          if (Number.isFinite(thickness) && thickness > 0) opening.thickness = thickness;
          else delete opening.thickness;
        }
      }
    }
  }

  function cloneValue(value) {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function snapshotState() {
    return {
      battle: cloneValue(STATE.battle),
      entities: cloneValue(STATE.entities),
    };
  }

  function restoreState(snapshot) {
    if (!snapshot) return;
    STATE.battle = snapshot.battle ? cloneValue(snapshot.battle) : STATE.battle;
    STATE.entities = snapshot.entities ? cloneValue(snapshot.entities) : STATE.entities;
    setFloorOptions();
    renderStatus();
    render();
  }

  function prepareBattleForSave(battle) {
    const clean = cloneValue(battle || {});
    delete clean._battle_id;
    delete clean._campaign_id;
    normalizeOpeningsForSave(clean);
    return clean;
  }

  function pushHistory() {
    const snap = snapshotState();
    if (HISTORY.index < HISTORY.stack.length - 1) {
      HISTORY.stack = HISTORY.stack.slice(0, HISTORY.index + 1);
    }
    HISTORY.stack.push(snap);
    if (HISTORY.stack.length > HISTORY.limit) {
      HISTORY.stack.shift();
    }
    HISTORY.index = HISTORY.stack.length - 1;
    updateUndoButton();
  }

  function canUndo() {
    return HISTORY.index > 0;
  }

  function undo() {
    if (!canUndo()) return;
    HISTORY.index -= 1;
    restoreState(HISTORY.stack[HISTORY.index]);
    if (saveStatus) saveStatus.textContent = "DB: idle";
    updateUndoButton();
  }

  function updateUndoButton() {
    if (undoButton) undoButton.disabled = !canUndo();
  }

  function bindUndoControls(globalWindow) {
    if (undoButton) undoButton.addEventListener("click", () => undo());
    if (!globalWindow || typeof globalWindow.addEventListener !== "function") return;
    globalWindow.addEventListener("keydown", (ev) => {
      if (!((ev.ctrlKey || ev.metaKey) && String(ev.key || "").toLowerCase() === "z")) return;
      ev.preventDefault();
      // Ignore OS key repeat so one long press does not consume multiple snapshots.
      if (ev.repeat) return;
      undo();
    });
  }

  return {
    cloneValue,
    snapshotState,
    restoreState,
    prepareBattleForSave,
    pushHistory,
    canUndo,
    undo,
    updateUndoButton,
    bindUndoControls,
  };
}
