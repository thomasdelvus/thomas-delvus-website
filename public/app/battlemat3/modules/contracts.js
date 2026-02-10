export function createContracts() {
  function getQueryParams() {
    return new URLSearchParams(window.location.search || "");
  }

  function escapeHtml(text) {
    return String(text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normStr(value) {
    return String(value ?? "").trim();
  }

  function getAuthHeaders() {
    const qp = getQueryParams();
    const token = (qp.get("token") || qp.get("auth") || qp.get("bearer") || "").trim();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }

  return { getQueryParams, escapeHtml, normStr, getAuthHeaders };
}

