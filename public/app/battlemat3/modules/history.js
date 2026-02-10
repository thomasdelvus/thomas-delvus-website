export function createHistoryController({
  STATE,
  HISTORY,
  undoButton,
  saveStatus,
  setFloorOptions,
  renderStatus,
  render,
}) {
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
