/* ============================================================
   Nexus Agent Widget — Self-contained floating chat popup
   Injected via <Script> in layout.tsx
   ============================================================ */
(function () {
  "use strict";

  // ── Styles ───────────────────────────────────────────────
  const STYLES = `
    #nexus-agent-root * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    #nexus-agent-root {
      --na-bg: #ffffff;
      --na-surface: #f4f4f7;
      --na-surface-hover: #eaeaef;
      --na-border: #f0f0f5;
      --na-text: #181c20;
      --na-text-muted: #707982;
      --na-accent: #667eea;
      --na-accent-glow: rgba(102, 126, 234, 0.15);
      --na-accent-gradient: linear-gradient(135deg, #667eea 0%, #768bfb 100%);
      --na-success: #10b981;
      --na-error: #ef4444;
      --na-radius: 24px;
      --na-radius-sm: 12px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
    }

    /* ── Floating Trigger Button ─────────────────────────── */
    #nexus-agent-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      background: var(--na-accent-gradient);
      color: #fff;
      font-size: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px var(--na-accent-glow);
      transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
      position: relative;
      z-index: 2;
    }
    #nexus-agent-btn:hover {
      transform: scale(1.05) translateY(-2px);
      box-shadow: 0 12px 32px var(--na-accent-glow);
    }
    #nexus-agent-btn.open {
      transform: rotate(90deg) scale(1);
    }

    /* ── Chat Panel ──────────────────────────────────────── */
    #nexus-agent-panel {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 400px; /* Increased width slightly for better spacing */
      height: 520px; /* Increased height slightly from 480px */
      background: var(--na-bg);
      border: 1px solid var(--na-border);
      border-radius: var(--na-radius);
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    #nexus-agent-panel.visible {
      display: flex;
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* ── Header ──────────────────────────────────────────── */
    .na-header {
      padding: 18px 24px; /* Slightly more padding */
      border-bottom: 1px solid var(--na-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fff;
      flex-shrink: 0;
    }
    .na-header-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .na-bot-icon {
      width: 34px;
      height: 34px;
      background: var(--na-accent);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 18px;
    }
    .na-header-info h3 {
      font-size: 15px;
      font-weight: 700;
      color: var(--na-text);
      margin-bottom: 2px;
    }
    .na-status {
      font-size: 12px;
      color: var(--na-text-muted);
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .na-status::before {
      content: '';
      width: 6px;
      height: 6px;
      background: var(--na-success);
      border-radius: 50%;
    }
    .na-header-actions button {
      background: transparent;
      border: none;
      color: var(--na-text-muted);
      cursor: pointer;
      font-size: 20px;
      padding: 6px;
      border-radius: 10px;
      transition: all 0.2s;
    }
    .na-header-actions button:hover {
      background: var(--na-surface);
      color: var(--na-text);
    }

    /* ── Messages ─────────────────────────────────────────── */
    .na-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px 28px; /* Increased lateral padding */
      display: flex;
      flex-direction: column;
      gap: 18px;
      background: #fff;
    }
    .na-messages::-webkit-scrollbar { width: 4px; }
    .na-messages::-webkit-scrollbar-thumb { background: #eaeaef; border-radius: 10px; }

    .na-date-separator {
      align-self: center;
      font-size: 11px;
      font-weight: 700;
      color: var(--na-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
    }

    .na-msg {
      max-width: 90%; /* Increased width slightly */
      padding: 12px 18px; /* Better internal padding */
      font-size: 14px;
      line-height: 1.55;
      position: relative;
    }
    .na-msg.user {
      align-self: flex-end;
      background: var(--na-accent);
      color: #fff;
      border-radius: 20px 20px 4px 20px;
      box-shadow: 0 4px 12px var(--na-accent-glow);
    }
    .na-msg.agent {
      align-self: flex-start;
      background: var(--na-surface);
      color: var(--na-text);
      border-radius: 20px 20px 20px 4px;
    }
    .na-msg.error {
      align-self: center;
      background: #fff1f2;
      color: var(--na-error);
      border-radius: 14px;
      font-size: 13px;
      border: 1px solid #ffe4e6;
      width: 100%;
      text-align: center;
    }
    .na-msg.system {
      align-self: center;
      color: var(--na-text-muted);
      font-size: 12px;
      font-weight: 500;
      opacity: 0.8;
    }

    /* ── File Badge ───────────────────────────────────────── */
    .na-files-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 8px 14px;
      background: #ecfdf5;
      border: 1px solid #d1fae5;
      border-radius: 12px;
      color: var(--na-success);
      font-size: 12px;
      font-weight: 700;
    }

    /* ── Input Area ───────────────────────────────────────── */
    .na-input-container {
      padding: 18px 24px 10px 24px; /* Adjusted padding */
      background: #fff;
      border-top: 1px solid var(--na-border);
      flex-shrink: 0;
    }
    .na-input-wrapper {
      background: var(--na-surface);
      border-radius: 28px;
      display: flex;
      align-items: center;
      padding: 4px 6px 4px 20px;
      border: 1px solid transparent;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .na-input-wrapper:focus-within {
      background: #fff;
      border-color: var(--na-accent);
      box-shadow: 0 0 0 4px var(--na-accent-glow);
    }
    .na-input-wrapper textarea {
      flex: 1;
      border: none;
      background: transparent;
      padding: 12px 0;
      font-family: inherit;
      font-size: 14px;
      color: var(--na-text);
      outline: none;
      resize: none;
      max-height: 80px;
    }
    .na-send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--na-accent);
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .na-send-btn:hover {
      transform: scale(1.08) rotate(-10deg);
      box-shadow: 0 4px 12px var(--na-accent-glow);
    }
    .na-send-btn svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }


    /* ── Typing ──────────────────────────────────────────── */
    .na-typing {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: var(--na-surface);
      border-radius: 12px;
      width: fit-content;
      margin-left: 24px;
    }
    .na-typing span {
      width: 6px;
      height: 6px;
      background: var(--na-text-muted);
      border-radius: 50%;
      animation: na-bounce 1s infinite alternate;
    }
    .na-typing span:nth-child(2) { animation-delay: 0.2s; }
    .na-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes na-bounce { to { transform: translateY(-4px); opacity: 0.6; } }

    /* ── Responsive ───────────────────────────────────────── */
    @media (max-width: 480px) {
      #nexus-agent-panel {
        width: calc(100vw - 32px);
        right: -8px;
        bottom: 68px;
        max-height: 70vh;
      }
    }
  `;

  // ── Create DOM ──────────────────────────────────────────
  const root = document.createElement("div");
  root.id = "nexus-agent-root";

  const style = document.createElement("style");
  style.textContent = STYLES;
  root.appendChild(style);

  // Trigger button
  const btn = document.createElement("button");
  btn.id = "nexus-agent-btn";
  btn.innerHTML = "✦";
  btn.title = "Open Nexus Agent";
  root.appendChild(btn);

  // Chat panel
  const panel = document.createElement("div");
  panel.id = "nexus-agent-panel";
  panel.innerHTML = `
    <div class="na-header">
      <div class="na-header-title">
        <div class="na-bot-icon">✦</div>
        <div class="na-header-info">
          <h3>Nexus Agent</h3>
          <div class="na-status">We're online</div>
        </div>
      </div>
      <div class="na-header-actions">
        <button id="na-clear-btn" title="Clear chat">↻</button>
      </div>
    </div>
    <div class="na-messages" id="na-messages">
      <div class="na-date-separator">Today</div>
      <div class="na-msg agent">Hello! How can I help you today? ✨</div>
    </div>
    <div class="na-input-container">
      <div class="na-input-wrapper">
        <textarea id="na-input" rows="1" placeholder="Enter message..." maxlength="4000"></textarea>
        <button class="na-send-btn" id="na-send-btn" title="Send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
        </button>
      </div>
    </div>
  `;
  root.appendChild(panel);
  document.body.appendChild(root);

  // ── References ──────────────────────────────────────────
  const messages = document.getElementById("na-messages");
  const input = document.getElementById("na-input");
  const sendBtn = document.getElementById("na-send-btn");
  const clearBtn = document.getElementById("na-clear-btn");

  let isOpen = false;
  let isLoading = false;

  // ── Toggle panel ────────────────────────────────────────
  btn.addEventListener("click", function () {
    isOpen = !isOpen;
    btn.classList.toggle("open", isOpen);
    if (isOpen) {
      panel.style.display = "flex";
      // Trigger reflow for animation
      panel.offsetHeight;
      panel.classList.add("visible");
      input.focus();
    } else {
      panel.classList.remove("visible");
      setTimeout(function () {
        if (!isOpen) panel.style.display = "none";
      }, 250);
    }
    btn.innerHTML = isOpen ? "✕" : "✦";
  });

  // ── Add message to chat ─────────────────────────────────
  function addMessage(text, type) {
    var div = document.createElement("div");
    div.className = "na-msg " + type;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
    return div;
  }

  function addFileBadge(parentEl, files) {
    if (!files || files.length === 0) return;
    var badge = document.createElement("div");
    badge.className = "na-files-badge";
    badge.textContent = "📁 " + files.length + " file" + (files.length > 1 ? "s" : "") + " changed";
    badge.title = files.join("\n");
    parentEl.appendChild(badge);
  }

  function showTyping() {
    var div = document.createElement("div");
    div.className = "na-typing";
    div.id = "na-typing-indicator";
    div.innerHTML = "<span></span><span></span><span></span>";
    messages.appendChild(div);
    messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
  }

  function hideTyping() {
    var el = document.getElementById("na-typing-indicator");
    if (el) el.remove();
  }

  // ── Send message ────────────────────────────────────────
  async function sendMessage() {
    var text = input.value.trim();
    if (!text || isLoading) return;

    addMessage(text, "user");
    input.value = "";
    input.style.height = "auto";
    isLoading = true;
    sendBtn.disabled = true;
    showTyping();

    try {
      var res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      var data = await res.json();

      hideTyping();

      if (data.error) {
        addMessage("⚠ " + data.error, "error");
      } else {
        addMessage(data.reply || "Done.", "agent");
      }
    } catch (err) {
      hideTyping();
      addMessage("⚠ Network error: " + err.message, "error");
    }

    isLoading = false;
    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  input.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 100) + "px";
  });

  // ── Clear chat ──────────────────────────────────────────
  clearBtn.addEventListener("click", function () {
    messages.innerHTML = `
      <div class="na-date-separator">Today</div>
      <div class="na-msg agent">Chat cleared. How can I help? ✨</div>
    `;
  });

})();
