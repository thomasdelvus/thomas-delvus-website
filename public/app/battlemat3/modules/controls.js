export function createControlsController({
  VIEW,
  rowStep,
  colStep,
  nudgeCamera,
  setZoom,
}) {
  function setupHold(button, stepFn) {
    if (!button) return;
    let timer = null;
    let active = false;
    const step = () => stepFn();
    const stop = () => {
      active = false;
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    const start = (ev) => {
      ev.preventDefault();
      if (active) return;
      active = true;
      step();
      timer = setInterval(step, 60);
    };
    button.addEventListener("mousedown", start);
    button.addEventListener("touchstart", start, { passive: false });
    button.addEventListener("mouseup", stop);
    button.addEventListener("mouseleave", stop);
    button.addEventListener("touchend", stop);
    button.addEventListener("touchcancel", stop);
  }

  function bindPanZoomHoldControls({
    panUp,
    panDown,
    panLeft,
    panRight,
    zoomOutButton,
    zoomInButton,
  }) {
    const nudgeStep = 1;
    const panScale = () => {
      const z = Number(VIEW.zoom) || 1;
      return Math.min(6, Math.max(0.25, 1 / z));
    };

    setupHold(panUp, () => nudgeCamera(0, -rowStep() * nudgeStep * panScale()));
    setupHold(panDown, () => nudgeCamera(0, rowStep() * nudgeStep * panScale()));
    setupHold(panLeft, () => nudgeCamera(-colStep() * nudgeStep * panScale(), 0));
    setupHold(panRight, () => nudgeCamera(colStep() * nudgeStep * panScale(), 0));

    const zoomStep = () => {
      const pct = (Number(VIEW.zoom) || 1) * 100;
      if (pct < 25) return 0.01;
      if (pct < 100) return 0.05;
      if (pct < 200) return 0.1;
      return 0.2;
    };

    setupHold(zoomOutButton, () => setZoom(VIEW.zoom - zoomStep()));
    setupHold(zoomInButton, () => setZoom(VIEW.zoom + zoomStep()));
  }

  return {
    bindPanZoomHoldControls,
  };
}

