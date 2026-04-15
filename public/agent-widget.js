/* ============================================================
   Nexus Agent Widget — Premium UX Edition
   ============================================================ */
(function () {
  "use strict";

  const STYLES = `
    #nexus-agent-root * {
      box-sizing: border-box;
      margin: 0;
    }

    #nexus-agent-root {
      --na-bg: #ffffff;
      --na-glass-bg: #ffffff;
      --na-surface: #f8fafc;
      --na-surface-hover: #f1f5f9;
      --na-border: #e2e8f0;
      --na-text: #0f172a;
      --na-text-muted: #64748b;
      --na-accent: #3b82f6;
      --na-accent-glow: rgba(59, 130, 246, 0.2);
      --na-accent-gradient: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      --na-success: #10b981;
      --na-error: #ef4444;
      --na-radius: 28px;
      --na-radius-sm: 14px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
    }

    #nexus-agent-btn {
      width: 64px;
      height: 64px;
      border-radius: 22px;
      border: 1px solid var(--na-border);
      cursor: pointer;
      background: var(--na-accent-gradient);
      color: #fff;
      font-size: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 12px 32px var(--na-accent-glow), inset 0 0 0 1px rgba(255,255,255,0.2);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      z-index: 2;
    }
    #nexus-agent-btn:hover {
      transform: scale(1.08) translateY(-4px) rotate(5deg);
      box-shadow: 0 16px 40px var(--na-accent-glow);
    }
    #nexus-agent-btn.open {
      transform: rotate(90deg);
      background: #1e293b;
    }

    #nexus-agent-panel {
      position: absolute;
      bottom: 84px;
      right: 0;
      width: 420px;
      height: 520px;
      background: var(--na-bg);
      border: 2px solid #334155;
      border-radius: var(--na-radius);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.05);
      display: none;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(30px) scale(0.9);
      transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
    }
    #nexus-agent-panel.visible {
      display: flex;
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .na-header {
      padding: 20px 24px;
      background: rgba(255, 255, 255, 0.2);
      border-bottom: 1px solid var(--na-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .na-header-title {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .na-bot-icon {
      width: 38px;
      height: 38px;
      background: var(--na-accent-gradient);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 20px;
      box-shadow: 0 4px 12px var(--na-accent-glow);
    }
    .na-header-info h3 {
      font-size: 16px;
      font-weight: 800;
      color: var(--na-text);
      letter-spacing: -0.02em;
    }
    .na-status {
      font-size: 11px;
      font-weight: 600;
      color: var(--na-text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 1px;
    }
    .na-status::before {
      content: '';
      width: 7px;
      height: 7px;
      background: var(--na-success);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--na-success);
      animation: na-blink 2s infinite;
    }
    @keyframes na-blink { 
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }

    .na-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      scroll-behavior: smooth;
    }
    .na-messages::-webkit-scrollbar { width: 5px; }
    .na-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }

    .na-msg {
      max-width: 85%;
      padding: 14px 18px;
      font-size: 14px;
      line-height: 1.6;
      position: relative;
      animation: na-slide-in 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    }
    @keyframes na-slide-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .na-msg.user {
      align-self: flex-end;
      background: var(--na-accent-gradient);
      color: #fff;
      border-radius: 20px 20px 4px 20px;
      box-shadow: 0 4px 15px var(--na-accent-glow);
    }
    .na-msg.agent {
      align-self: flex-start;
      background: #fff;
      color: var(--na-text);
      border: 1px solid var(--na-border);
      border-radius: 20px 20px 20px 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }

    .na-typing {
      display: flex;
      gap: 4px;
      padding: 14px 18px;
    }
    .na-dot {
      width: 6px;
      height: 6px;
      background: var(--na-accent);
      border-radius: 50%;
      animation: na-dot-jump 1.4s infinite ease-in-out;
      opacity: 0.4;
    }
    .na-dot:nth-child(2) { animation-delay: 0.2s; }
    .na-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes na-dot-jump {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
      40% { transform: translateY(-6px); opacity: 1; }
    }

    #nexus-selector-highlight {
      position: fixed;
      pointer-events: none;
      z-index: 999998;
      border: 3.5px solid #1e293b;
      background: rgba(59, 130, 246, 0.1);
      transition: all 0.1s ease-out;
      border-radius: 8px;
      display: none;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
    }
    #nexus-selector-highlight::after {
      content: attr(data-tag);
      position: absolute;
      bottom: calc(100% + 8px);
      left: 0;
      background: var(--na-accent);
      color: #fff;
      font-size: 11px;
      font-weight: 900;
      padding: 4px 10px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      box-shadow: 0 4px 12px var(--na-accent-glow);
    }

    .na-selection-banner {
      position: absolute;
      top: 0; left: 0; right: 0;
      padding: 10px;
      background: var(--na-accent);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      text-align: center;
      z-index: 100;
      display: none;
      animation: na-fade-down 0.3s ease-out;
    }
    @keyframes na-fade-down { from { transform: translateY(-100%); } to { transform: translateY(0); } }

    .na-target-chip {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin: 12px 24px 0 24px;
      padding: 8px 14px;
      background: #fff;
      border: 1px solid var(--na-accent);
      border-radius: 14px;
      color: var(--na-accent);
      font-size: 12px;
      font-weight: 800;
      box-shadow: 0 4px 12px var(--na-accent-glow);
    }
    .na-target-chip button {
      background: var(--na-accent);
      border: none;
      color: #fff;
      width: 18px; height: 18px;
      border-radius: 50%;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px;
    }

    .na-input-container {
      padding: 20px 24px;
      background: rgba(255, 255, 255, 0.3);
      border-top: 1px solid var(--na-border);
    }
    .na-input-wrapper {
      background: #fff;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      padding: 8px 12px;
      border: 1px solid var(--na-border);
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    .na-input-wrapper:focus-within {
      border-color: var(--na-accent);
      box-shadow: 0 0 0 4px var(--na-accent-glow), 0 8px 24px rgba(0,0,0,0.05);
    }
    
    .na-input-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }

    .na-input-wrapper textarea {
      flex: 1;
      border: none;
      background: transparent;
      padding: 10px 4px;
      font-size: 15px;
      font-weight: 500;
      outline: none;
      resize: none;
      max-height: 180px;
      min-height: 40px;
      color: var(--na-text);
      line-height: 1.5;
    }

    .na-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 4px;
      padding-top: 4px;
      border-top: 1px solid rgba(0,0,0,0.03);
    }
    .na-control-group {
      display: flex;
      gap: 4px;
    }

    .na-action-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: transparent;
      color: var(--na-text-muted);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .na-action-btn:hover {
      background: var(--na-surface);
      color: var(--na-accent);
      transform: translateY(-1px);
    }
    .na-action-btn svg { width: 20px; height: 20px; }
    
    .na-send-btn {
      background: var(--na-accent-gradient);
      color: #fff;
      border-radius: 12px;
      width: 40px; height: 40px;
      box-shadow: 0 4px 10px var(--na-accent-glow);
    }
    .na-send-btn:hover { transform: scale(1.05); color: #fff; }
    .na-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .na-attachment-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px 0;
    }
    .na-thumb {
      width: 44px; height: 44px;
      border-radius: 8px;
      object-fit: cover;
      border: 1px solid var(--na-border);
      background: #eee;
    }
    .na-file-chip {
      position: relative;
      display: inline-block;
    }
    .na-file-chip button {
      position: absolute;
      top: -6px; right: -6px;
      width: 18px; height: 18px;
      background: #ef4444; color: #fff;
      border: none; border-radius: 50%;
      font-size: 10px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #fff;
    }

    .na-change-log {
      font-size: 11px; 
      margin-top: 10px; 
      padding: 8px 12px; 
      border-radius: 8px;
      background: rgba(16, 185, 129, 0.08); 
      color: #065f46; 
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
  `;

  const root = document.createElement("div");
  root.id = "nexus-agent-root";
  const style = document.createElement("style");
  style.textContent = STYLES;
  root.appendChild(style);

  const highlight = document.createElement("div");
  highlight.id = "nexus-selector-highlight";
  document.body.appendChild(highlight);

  const btn = document.createElement("button");
  btn.id = "nexus-agent-btn";
  btn.title = "Open Nexus Agent Chat";
  btn.innerHTML = `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`;
  root.appendChild(btn);

  const panel = document.createElement("div");
  panel.id = "nexus-agent-panel";
  panel.innerHTML = `
    <div class="na-selection-banner" id="na-selection-banner">Click an element to add context</div>
    <div class="na-header">
      <div class="na-header-title">
        <div class="na-bot-icon">✦</div>
        <div class="na-header-info">
          <h3>AI Assistant</h3>
          <div class="na-status">Gemini 3 Flash</div>
        </div>
      </div>
    </div>
    <div class="na-messages" id="na-messages">
      <div class="na-msg agent">Hello! I'm your AI coding assistant. Select an element or upload assets to start building. 🛸</div>
    </div>
    <div id="na-context-area"></div>
    <div class="na-input-container">
      <div class="na-input-wrapper ">
        <div class="na-attachment-preview" id="na-attachment-preview"></div>
        <div class="na-input-row">
          <textarea id="na-input" placeholder="Describe your design or logic..." rows="1"></textarea>
          <button class="na-action-btn na-send-btn" id="na-send-btn">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
        <div class="na-controls">
          <div class="na-control-group">
            <button class="na-action-btn" id="na-select-btn" title="Select UI Element">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>
            </button>
            <button class="na-action-btn" id="na-attach-btn" title="Attach Image or Asset">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <input type="file" id="na-file-input" style="display: none;" multiple accept="image/*,text/*,application/json">
          </div>
          <div style="font-size: 10px; color: var(--na-text-muted); font-weight: 600;">Nexus Ecosystem</div>
        </div>
      </div>
    </div>
  `;
  root.appendChild(panel);
  document.body.appendChild(root);

  const messages = document.getElementById("na-messages");
  const input = document.getElementById("na-input");
  const sendBtn = document.getElementById("na-send-btn");
  const selectBtn = document.getElementById("na-select-btn");
  const contextArea = document.getElementById("na-context-area");
  const fileInput = document.getElementById("na-file-input");
  const attachBtn = document.getElementById("na-attach-btn");
  const attachmentPreview = document.getElementById("na-attachment-preview");
  const selectionBanner = document.getElementById("na-selection-banner");

  let isOpen = false;
  let isSelecting = false;
  let selectedContext = null;
  let pendingFiles = [];
  let chatHistory = [];

  // --- UI Helpers ---

  function appendMessage(role, text, isThinking = false) {
    if (isThinking) {
      const thinking = document.createElement("div");
      thinking.className = "na-msg agent na-typing";
      thinking.id = "na-thinking-indicator";
      thinking.innerHTML = `<div class="na-dot"></div><div class="na-dot"></div><div class="na-dot"></div>`;
      messages.appendChild(thinking);
      messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
      return thinking;
    }

    const msgDiv = document.createElement("div");
    msgDiv.className = `na-msg ${role}`;
    msgDiv.textContent = text;
    messages.appendChild(msgDiv);
    messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
    return msgDiv;
  }

  function removeThinking() {
    const indicator = document.getElementById("na-thinking-indicator");
    if (indicator) indicator.remove();
  }

  // --- Auto-expanding Textarea ---
  input.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
  });

  // --- Selection Mode Logic ---

  function startSelection() {
    if (isSelecting) return;
    isSelecting = true;
    document.body.classList.add("na-selecting");
    highlight.style.display = "block";
    selectionBanner.style.display = "block";
    
    // Minimize panel during selection
    panel.style.transform = "translateY(100px) scale(0.8)";
    panel.style.opacity = "0.5";

    const onMove = (e) => {
      const target = e.target;
      if (root.contains(target) || target === highlight) {
        highlight.style.display = "none";
        return;
      }
      const rect = target.getBoundingClientRect();
      highlight.style.display = "block";
      highlight.style.width = rect.width + "px";
      highlight.style.height = rect.height + "px";
      highlight.style.top = rect.top + "px";
      highlight.style.left = rect.left + "px";
      highlight.setAttribute("data-tag", target.tagName.toLowerCase());
    };

    const onClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target;
      if (root.contains(target)) return;

      const tag = target.tagName.toLowerCase();
      const id = target.id ? `#${target.id}` : "";
      const classes = (typeof target.className === 'string') 
        ? "." + target.className.trim().split(/\s+/).join(".")
        : "";
      
      selectedContext = {
        selector: `${tag}${id}${classes}`.substring(0, 150).replace(/\.\./g, '.'),
        tag: tag
      };

      stopSelection();
      renderChip();
    };

    const stopSelection = () => {
      isSelecting = false;
      document.body.classList.remove("na-selecting");
      highlight.style.display = "none";
      selectionBanner.style.display = "none";
      panel.style.transform = "translateY(0) scale(1)";
      panel.style.opacity = "1";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick, true);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick, true);
  }

  function renderChip() {
    contextArea.innerHTML = "";
    if (!selectedContext) return;
    const chip = document.createElement("div");
    chip.className = "na-target-chip";
    chip.innerHTML = `<span>Selector: ${selectedContext.tag}</span><button>×</button>`;
    chip.querySelector("button").onclick = () => {
      selectedContext = null;
      renderChip();
    };
    contextArea.appendChild(chip);
  }

  // --- Attachment Logic ---

  async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderAttachments() {
    attachmentPreview.innerHTML = "";
    pendingFiles.forEach((file, index) => {
      const chip = document.createElement("div");
      chip.className = "na-file-chip";
      
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        chip.innerHTML = `<img src="${url}" class="na-thumb"><button>×</button>`;
      } else {
        chip.innerHTML = `<div class="na-thumb" style="display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold">${file.name.split('.').pop()}</div><button>×</button>`;
      }

      chip.querySelector("button").onclick = (e) => {
        e.stopPropagation();
        pendingFiles.splice(index, 1);
        renderAttachments();
      };
      attachmentPreview.appendChild(chip);
    });
  }

  // --- Main Messaging ---

  async function sendMessage() {
    const text = input.value.trim();
    if (!text && !selectedContext && pendingFiles.length === 0) return;

    const fullMessage = selectedContext 
      ? `[Target Element Context: ${selectedContext.selector}] ${text}`
      : text;

    appendMessage("user", text || "Analyzing the specified element...");
    const thinking = appendMessage("agent", "", true);

    // Disable input while thinking
    input.disabled = true;
    sendBtn.disabled = true;

    // Prepare attachments
    const attachmentSpecs = await Promise.all(pendingFiles.map(async (file) => ({
      name: file.name,
      type: file.type,
      data: await fileToBase64(file)
    })));

    // Reset UI state
    input.value = "";
    input.style.height = "auto";
    selectedContext = null;
    pendingFiles = [];
    renderChip();
    renderAttachments();

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: fullMessage,
          history: chatHistory,
          attachments: attachmentSpecs
        }),
      });

      const result = await response.json();
      removeThinking();

      if (result.error) {
        const errorMsg = appendMessage("agent", `⚠️ Agent Error: ${result.error}`);
        errorMsg.style.color = "var(--na-error)";
      } else {
        appendMessage("agent", result.reply);
        
        if (result.filesChanged && result.filesChanged.length > 0) {
          const log = document.createElement("div");
          log.className = "na-change-log";
          log.innerHTML = `<strong>✨ Architecture Updated:</strong><br>${result.filesChanged.join("<br>")}`;
          messages.appendChild(log);
          messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
        }
        
        // Persist History
        chatHistory.push({ role: "user", text: fullMessage });
        chatHistory.push({ role: "model", text: result.reply });
        if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
      }
    } catch (err) {
      removeThinking();
      appendMessage("agent", "❌ Connection failed. Ensure the dev server is running.").style.color = "var(--na-error)";
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // --- Event Listeners ---

  btn.onclick = () => {
    isOpen = !isOpen;
    panel.style.display = isOpen ? "flex" : "none";
    setTimeout(() => panel.classList.toggle("visible", isOpen), 10);
    btn.innerHTML = isOpen ? `✕` : `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`;
  };

  attachBtn.onclick = () => fileInput.click();
  fileInput.onchange = () => {
    pendingFiles = [...pendingFiles, ...Array.from(fileInput.files)];
    renderAttachments();
  };

  selectBtn.onclick = startSelection;
  sendBtn.onclick = sendMessage;
  input.onkeydown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

})();