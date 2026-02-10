export function createChatController({
  CHAT,
  chatLog,
  chatSpeaker,
  chatInput,
  getCampaignId,
  getAuthHeaders,
  escapeHtml,
  normStr,
  buildTokens,
}) {
  function chatStatusClass(status) {
    const raw = String(status || "").toLowerCase();
    if (raw === "canceled") return "canceled";
    if (raw === "processed") return "processed";
    if (raw === "ack") return "ack";
    return "";
  }

  function populateChatSpeakerSelect() {
    if (!chatSpeaker) return;
    const tokens = buildTokens();
    const names = [];
    for (const t of tokens) {
      const name = normStr(t.name || t.id);
      if (name && !names.includes(name)) names.push(name);
    }
    if (!names.includes("DM")) names.unshift("DM");
    if (!names.includes("Player")) names.push("Player");
    const active = document.activeElement === chatSpeaker;
    if (!active) {
      chatSpeaker.innerHTML = names.map((n) => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("");
    }
  }

  function renderChat() {
    if (!chatLog) return;
    if (!CHAT.rows.length) {
      chatLog.innerHTML = '<div class="mini" style="opacity:0.7;">No chat yet.</div>';
      return;
    }
    chatLog.innerHTML = CHAT.rows.map((entry) => {
      const speaker = normStr(entry.speaker || "Player");
      const speakerKey = speaker.toLowerCase();
      const speakerClass = `chatSpeaker${speakerKey === "dm" ? " dm" : ""}`;
      const statusClass = chatStatusClass(entry.status);
      const text = escapeHtml(entry.text || "");
      return `<div class="chatEntry ${statusClass}">` +
        `<span class="${speakerClass}">${escapeHtml(speaker)}</span>` +
        `<span class="chatText">${text}</span>` +
      "</div>";
    }).join("");
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function mergeChatRows(rows) {
    if (!Array.isArray(rows)) return;
    for (const entry of rows) {
      const id = entry.chat_id || entry.id || entry.chatId || entry.message_id || entry.messageId || null;
      if (!id) continue;
      if (CHAT.byId.has(id)) {
        const existing = CHAT.byId.get(id);
        Object.assign(existing, entry);
      } else {
        const row = { ...entry, chat_id: id };
        CHAT.byId.set(id, row);
        CHAT.rows.push(row);
      }
      const created = Number(entry.created_at || entry.createdAt || 0);
      if (Number.isFinite(created) && created > CHAT.lastTs) CHAT.lastTs = created;
    }
    CHAT.rows.sort((a, b) => (Number(a.created_at || 0) - Number(b.created_at || 0)));
  }

  async function fetchChat(sinceTs = null) {
    const cid = getCampaignId();
    if (!cid) return [];
    const qs = new URLSearchParams();
    qs.set("campaign_id", cid);
    if (sinceTs && Number.isFinite(Number(sinceTs))) qs.set("since_ts", String(Math.floor(sinceTs)));
    qs.set("limit", "200");
    const res = await fetch(`/api/messages?${qs.toString()}`, {
      headers: { accept: "application/json", ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Chat fetch failed");
    const data = await res.json();
    return Array.isArray(data && data.rows) ? data.rows : [];
  }

  async function pollChat() {
    try {
      const rows = await fetchChat(CHAT.lastTs || null);
      if (rows && rows.length) {
        mergeChatRows(rows);
        renderChat();
      }
    } catch (err) {
      console.warn("[Battlemat] chat fetch failed:", err);
    }
  }

  function startChatPolling() {
    if (CHAT.timer) clearInterval(CHAT.timer);
    CHAT.timer = setInterval(pollChat, 3000);
    pollChat();
  }

  async function sendChatMessage() {
    if (!chatInput) return;
    const text = normStr(chatInput.value);
    if (!text) return;
    const speaker = chatSpeaker ? (normStr(chatSpeaker.value) || "Player") : "Player";
    const cid = getCampaignId();
    if (!cid) return;
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          campaign_id: cid,
          speaker,
          text,
          type: "player",
          status: "new",
        }),
      });
      if (!res.ok) throw new Error("Chat send failed");
      chatInput.value = "";
      pollChat();
    } catch (err) {
      console.warn("[Battlemat] chat send failed:", err);
    }
  }

  return {
    chatStatusClass,
    populateChatSpeakerSelect,
    renderChat,
    mergeChatRows,
    fetchChat,
    pollChat,
    startChatPolling,
    sendChatMessage,
  };
}

