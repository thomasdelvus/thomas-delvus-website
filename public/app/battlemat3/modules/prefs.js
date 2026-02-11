export function createPrefsController({ UI, BACKDROP, elements }) {
  const {
    hexGridToggle,
    labelBoldToggle,
    handlesToggle,
    hideRoofsToggle,
    streetViewToggle,
    roofLineColorInput,
    roofLineWidthInput,
    fogToggle,
    videoSelect,
    polyAlphaInput,
    backdropToggle,
    mapOffsetXInput,
    mapOffsetYInput,
    mapScaleInput,
    mapRotInput,
  } = elements;

  function parseStoredBool(value) {
    if (value == null) return null;
    const normalized = String(value).trim().toLowerCase();
    if (normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on") return true;
    if (normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off") return false;
    return null;
  }

  function loadPrefs() {
    try {
      const grid = localStorage.getItem("bm_hexgrid");
      const bright = localStorage.getItem("bm_bright_labels");
      const handles = localStorage.getItem("bm_handles");
      const fog = localStorage.getItem("bm_fog");
      const hideRoofs = localStorage.getItem("bm_hide_roofs");
      const streetView = localStorage.getItem("bm_street_view");
      const roofLineColor = localStorage.getItem("bm_roof_line_color");
      const roofLineWidth = localStorage.getItem("bm_roof_line_width");
      const video = localStorage.getItem("bm_video");
      const polyAlpha = localStorage.getItem("bm_poly_alpha");
      const backdrop = localStorage.getItem("bm_backdrop");
      const parsedGrid = parseStoredBool(grid);
      const parsedBright = parseStoredBool(bright);
      const parsedHandles = parseStoredBool(handles);
      const parsedFog = parseStoredBool(fog);
      const parsedHideRoofs = parseStoredBool(hideRoofs);
      const parsedStreetView = parseStoredBool(streetView);
      const parsedBackdrop = parseStoredBool(backdrop);
      if (parsedGrid != null) UI.hexGrid = parsedGrid;
      if (parsedBright != null) UI.brightLabels = parsedBright;
      if (parsedHandles != null) UI.showHandles = parsedHandles;
      if (parsedFog != null) UI.fogEnabled = parsedFog;
      if (parsedHideRoofs != null) UI.hideRoofs = parsedHideRoofs;
      if (parsedStreetView != null) UI.streetView = parsedStreetView;
      if (roofLineColor != null && /^#[0-9a-f]{6}$/i.test(roofLineColor)) UI.roofLineColor = roofLineColor;
      if (roofLineWidth != null) {
        const n = Number(roofLineWidth);
        if (Number.isFinite(n) && n > 0) UI.roofLineWidth = n;
      }
      if (video === "low" || video === "medium" || video === "high" || video === "ultra") UI.video = video;
      if (polyAlpha != null) {
        const n = Number(polyAlpha);
        if (Number.isFinite(n)) UI.polyAlpha = Math.max(0, Math.min(1, n));
      }
      if (parsedBackdrop != null) UI.showBackdrop = parsedBackdrop;
    } catch {}
    if (hexGridToggle) hexGridToggle.checked = UI.hexGrid;
    if (labelBoldToggle) labelBoldToggle.checked = UI.brightLabels;
    if (handlesToggle) handlesToggle.checked = UI.showHandles;
    if (hideRoofsToggle) hideRoofsToggle.checked = UI.hideRoofs;
    if (streetViewToggle) streetViewToggle.checked = UI.streetView;
    if (roofLineColorInput) roofLineColorInput.value = UI.roofLineColor;
    if (roofLineWidthInput) roofLineWidthInput.value = String(UI.roofLineWidth);
    if (fogToggle) fogToggle.checked = UI.fogEnabled;
    if (videoSelect) videoSelect.value = UI.video;
    if (polyAlphaInput) polyAlphaInput.value = String(Math.round(UI.polyAlpha * 100));
    if (backdropToggle) backdropToggle.checked = UI.showBackdrop;
    if (mapOffsetXInput) mapOffsetXInput.value = String(BACKDROP.offsetHex.x);
    if (mapOffsetYInput) mapOffsetYInput.value = String(BACKDROP.offsetHex.y);
    if (mapScaleInput) mapScaleInput.value = String(Math.round(BACKDROP.scale * 100));
    if (mapRotInput) mapRotInput.value = String(BACKDROP.rotDeg || 0);
  }

  function savePrefs() {
    try {
      localStorage.setItem("bm_hexgrid", UI.hexGrid ? "1" : "0");
      localStorage.setItem("bm_bright_labels", UI.brightLabels ? "1" : "0");
      localStorage.setItem("bm_handles", UI.showHandles ? "1" : "0");
      localStorage.setItem("bm_fog", UI.fogEnabled ? "1" : "0");
      localStorage.setItem("bm_hide_roofs", UI.hideRoofs ? "1" : "0");
      localStorage.setItem("bm_street_view", UI.streetView ? "1" : "0");
      localStorage.setItem("bm_roof_line_color", UI.roofLineColor);
      localStorage.setItem("bm_roof_line_width", String(UI.roofLineWidth));
      localStorage.setItem("bm_video", UI.video);
      localStorage.setItem("bm_poly_alpha", String(UI.polyAlpha));
      localStorage.setItem("bm_backdrop", UI.showBackdrop ? "1" : "0");
    } catch {}
  }

  function initSectionCollapse() {
    const sections = document.querySelectorAll("section[data-section]");
    sections.forEach((section) => {
      const name = section.dataset.section || "";
      const btn = section.querySelector(".collapseBtn");
      if (!btn) return;
      const key = `bm_section_${name}`;
      try {
        const saved = localStorage.getItem(key);
        if (saved === "1") section.classList.add("collapsed");
      } catch {}
      btn.addEventListener("click", () => {
        section.classList.toggle("collapsed");
        try {
          localStorage.setItem(key, section.classList.contains("collapsed") ? "1" : "0");
        } catch {}
      });
    });
  }

  return { loadPrefs, savePrefs, initSectionCollapse };
}
