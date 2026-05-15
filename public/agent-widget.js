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
      --na-bg: rgba(255, 255, 255, 0.72);
      --na-glass-bg: rgba(255, 255, 255, 0.4);
      --na-surface: rgba(248, 250, 252, 0.5);
      --na-surface-hover: rgba(241, 245, 249, 0.8);
      --na-border: rgba(255, 255, 255, 0.4);
      --na-text: #0f172a;
      --na-text-muted: #64748b;
      --na-accent: #3b82f6;
      --na-accent-glow: rgba(59, 130, 246, 0.2);
      --na-accent-gradient: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      --na-success: #10b981;
      --na-error: #ef4444;
      --na-radius: 32px;
      --na-radius-sm: 16px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
    }

    #nexus-agent-btn {
      width: 68px;
      height: 68px;
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      cursor: grab;
      background: var(--na-accent-gradient);
      color: #fff;
      font-size: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 12px 32px var(--na-accent-glow), inset 0 0 0 1px rgba(255,255,255,0.3);
      backdrop-filter: blur(10px);
      transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
      position: relative;
      z-index: 2;
    }
    #nexus-agent-btn:hover {
      transform: scale(1.1) translateY(-5px);
      box-shadow: 0 20px 40px var(--na-accent-glow);
    }
    #nexus-agent-btn.open {
      transform: rotate(90deg);
      background: rgba(15, 23, 42, 0.9);
    }

    #nexus-agent-panel {
      position: absolute;
      bottom: 88px;
      right: 0;
      width: 400px;
      height: 550px;
      background: var(--na-bg);
      backdrop-filter: blur(25px) saturate(190%) contrast(100%);
      -webkit-backdrop-filter: blur(25px) saturate(190%) contrast(100%);
      border: 1px solid var(--na-border);
      border-radius: var(--na-radius);
      box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.15),
        inset 0 0 0 1px rgba(255, 255, 255, 0.5);
      display: none;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(40px) scale(0.92);
      transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    #nexus-agent-panel.visible {
      display: flex;
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* Animated Liquid Background Overlay */
    #nexus-agent-panel::before {
      content: '';
      position: absolute;
      top: -50%; left: -50%;
      width: 200%; height: 200%;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
      animation: na-liquid-float 20s infinite linear;
      pointer-events: none;
      z-index: 0;
    }

    @keyframes na-liquid-float {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .na-header {
      padding: 24px 28px;
      background: rgba(255, 255, 255, 0.2);
      border-bottom: 1px solid var(--na-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      z-index: 1;
    }
    .na-header-title {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .na-bot-icon {
      width: 42px;
      height: 42px;
      background: var(--na-accent-gradient);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 22px;
      box-shadow: 0 8px 16px var(--na-accent-glow);
    }
    .na-header-info h3 {
      font-size: 17px;
      font-weight: 800;
      color: var(--na-text);
      letter-spacing: -0.03em;
    }
    .na-status {
      font-size: 12px;
      font-weight: 600;
      color: var(--na-text-muted);
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
    }
    .na-status::before {
      content: '';
      width: 8px;
      height: 8px;
      background: var(--na-success);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--na-success);
      animation: na-blink 2.5s infinite;
    }
    @keyframes na-blink { 
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.7); }
    }

    .na-messages {
      flex: 1;
      overflow-y: auto;
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      scroll-behavior: smooth;
      z-index: 1;
    }
    .na-messages::-webkit-scrollbar { width: 6px; }
    .na-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 12px; }

    .na-msg {
      max-width: 88%;
      padding: 16px 20px;
      font-size: 14.5px;
      line-height: 1.6;
      position: relative;
      animation: na-slide-in 0.5s cubic-bezier(0.2, 1, 0.3, 1);
    }
    @keyframes na-slide-in {
      from { opacity: 0; transform: translateY(15px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .na-msg.user {
      align-self: flex-end;
      background: var(--na-accent-gradient);
      color: #fff;
      border-radius: 24px 24px 4px 24px;
      box-shadow: 0 8px 24px var(--na-accent-glow);
    }
    .na-msg.agent {
      align-self: flex-start;
      background: rgba(255, 255, 255, 0.4);
      color: var(--na-text);
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: 24px 24px 24px 4px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.02);
      backdrop-filter: blur(10px);
    }

    .na-typing {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px 22px;
      min-width: 220px;
    }
    .na-dots-container {
      display: flex;
      gap: 5px;
    }
    .na-dot {
      width: 7px;
      height: 7px;
      background: var(--na-accent);
      border-radius: 50%;
      animation: na-dot-jump 1.4s infinite ease-in-out;
      opacity: 0.5;
    }
    .na-dot:nth-child(2) { animation-delay: 0.2s; }
    .na-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes na-dot-jump {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
      40% { transform: translateY(-7px); opacity: 1; }
    }

    .na-log-container {
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      font-size: 11px;
      color: var(--na-accent);
      border-left: 2px solid var(--na-accent);
      padding-left: 10px;
      margin-top: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      opacity: 0.8;
    }
    .na-log-line {
      animation: na-log-in 0.2s ease-out;
    }
    .na-log-line.blink {
      animation: na-blink 1.5s infinite ease-in-out;
    }
    @keyframes na-log-in {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes na-blink {
      0%, 100% { opacity: 1; filter: brightness(1); }
      50% { opacity: 0.6; filter: brightness(1.2); }
    }

    #nexus-selector-highlight {
      position: fixed;
      pointer-events: none;
      z-index: 999998;
      border: 4px solid #1e293b;
      background: rgba(59, 130, 246, 0.15);
      transition: all 0.15s cubic-bezier(0.23, 1, 0.32, 1);
      border-radius: 12px;
      display: none;
      box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.1);
    }
    #nexus-selector-highlight::after {
      content: attr(data-tag);
      position: absolute;
      bottom: calc(100% + 12px);
      left: 0;
      background: var(--na-accent);
      color: #fff;
      font-size: 12px;
      font-weight: 900;
      padding: 6px 14px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      box-shadow: 0 8px 20px var(--na-accent-glow);
    }

    .na-selection-banner {
      position: absolute;
      top: 0; left: 0; right: 0;
      padding: 12px;
      background: rgba(59, 130, 246, 0.9);
      backdrop-filter: blur(10px);
      color: #fff;
      font-size: 13px;
      font-weight: 800;
      text-align: center;
      z-index: 100;
      display: none;
      animation: na-fade-down 0.4s cubic-bezier(0.2, 1, 0.3, 1);
    }
    @keyframes na-fade-down { from { transform: translateY(-100%); } to { transform: translateY(0); } }

    .na-target-chip {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin: 16px 28px 0 28px;
      padding: 10px 18px;
      background: rgba(255, 255, 255, 0.5);
      border: 1px solid var(--na-accent);
      border-radius: 18px;
      color: var(--na-accent);
      font-size: 13px;
      font-weight: 800;
      box-shadow: 0 8px 20px var(--na-accent-glow);
      backdrop-filter: blur(5px);
      z-index: 1;
    }
    .na-target-chip button {
      background: var(--na-accent);
      border: none;
      color: #fff;
      width: 20px; height: 20px;
      border-radius: 50%;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px;
      transition: all 0.2s;
    }
    .na-target-chip button:hover { transform: rotate(90deg) scale(1.1); }

    .na-input-container {
      padding: 24px 10px;
      background: rgba(255, 255, 255, 0.15);
      border-top: 1px solid var(--na-border);
      z-index: 1;
    }
    .na-input-wrapper {
      background: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      padding: 10px 14px;
      border: 1px solid rgba(255, 255, 255, 0.6);
      transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .na-input-wrapper:focus-within {
      background: rgba(255, 255, 255, 0.8);
      border-color: var(--na-accent);
      box-shadow: 0 0 0 5px var(--na-accent-glow), 0 12px 32px rgba(0,0,0,0.06);
      transform: translateY(-2px);
    }
    
    .na-input-row {
      display: flex;
      align-items: flex-end;
      gap: 10px;
    }

    .na-input-wrapper textarea {
      flex: 1;
      border: none;
      background: transparent;
      padding: 12px 6px;
      font-size: 16px;
      font-weight: 500;
      outline: none;
      resize: none;
      max-height: 200px;
      min-height: 44px;
      color: var(--na-text);
      line-height: 1.5;
    }

    .na-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid rgba(0,0,0,0.04);
    }
    .na-control-group {
      display: flex;
      gap: 6px;
    }

    .na-action-btn {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: transparent;
      color: var(--na-text-muted);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s;
    }
    .na-action-btn:hover {
      background: rgba(255, 255, 255, 0.5);
      color: var(--na-accent);
      transform: scale(1.1);
    }
    .na-action-btn svg { width: 22px; height: 22px; }
    
    .na-send-btn {
      background: var(--na-accent-gradient);
      color: #fff;
      border-radius: 16px;
      width: 44px; height: 44px;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 8px 20px var(--na-accent-glow);
    }
    .na-send-btn:hover { transform: scale(1.1) rotate(-5deg); color: #fff; }
    .na-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    
    .na-send-btn.stop {
      background: #1e293b;
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }
    .na-send-btn.stop:hover {
      background: var(--na-error);
      transform: scale(1.15);
    }

    .na-attachment-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 10px 0;
    }
    .na-thumb {
      width: 50px; height: 50px;
      border-radius: 12px;
      object-fit: cover;
      border: 1px solid rgba(255, 255, 255, 0.8);
      background: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(5px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    .na-file-chip {
      position: relative;
      display: inline-block;
    }
    .na-file-chip button {
      position: absolute;
      top: -8px; right: -8px;
      width: 20px; height: 20px;
      background: #ef4444; color: #fff;
      border: none; border-radius: 50%;
      font-size: 11px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .na-change-log {
      font-size: 12px; 
      margin-top: 12px; 
      padding: 12px 16px; 
      border-radius: 14px;
      background: rgba(16, 185, 129, 0.1); 
      color: #065f46; 
      border: 1px solid rgba(16, 185, 129, 0.3);
      backdrop-filter: blur(5px);
    }

    .na-revert-btn {
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #065f46;
      padding: 6px 12px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.3s;
      flex-shrink: 0;
      margin-top: 8px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .na-revert-btn:hover {
      background: #ef4444;
      color: #fff;
      border-color: transparent;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
    }

    .na-header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .na-header-btn {
      background: rgba(255, 255, 255, 0.3);
      border: 1px solid var(--na-border);
      color: var(--na-text);
      padding: 6px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .na-header-btn:hover {
      background: #fff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .na-header-btn.danger:hover {
      background: var(--na-error);
      color: #fff;
      border-color: transparent;
    }

    .na-suggestions-area {
      padding: 0 28px 20px 28px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 1;
      animation: na-slide-in 0.6s cubic-bezier(0.2, 1, 0.3, 1);
    }
    .na-suggestions-title {
      font-size: 11px;
      font-weight: 800;
      color: var(--na-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .na-suggestions-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .na-suggestion-chip {
      padding: 8px 14px;
      background: rgba(255, 255, 255, 0.4);
      border: 1px solid var(--na-border);
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      color: var(--na-text);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.02);
    }
    .na-suggestion-chip:hover {
      background: var(--na-accent-gradient);
      color: #fff;
      border-color: transparent;
      transform: translateY(-2px);
      box-shadow: 0 8px 16px var(--na-accent-glow);
    }

    .na-retry-btn {
      margin-top: 12px;
      padding: 10px 16px;
      background: var(--na-accent-gradient);
      color: #fff;
      border: none;
      border-radius: 14px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s;
      box-shadow: 0 8px 20px var(--na-accent-glow);
      align-self: flex-start;
    }
    .na-retry-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 24px var(--na-accent-glow);
    }
    .na-retry-btn svg { width: 16px; height: 16px; }

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
      <div class="na-header-actions">
        <button class="na-header-btn danger" id="na-global-revert-btn" title="Undo all local changes">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3"><path d="M2.5 2v6h6"/><path d="M2.5 8a10 10 0 1 1 5-9"/></svg>
          Revert All
        </button>
      </div>
    </div>
    <div class="na-messages" id="na-messages">
      <div class="na-msg agent">Hello! I'm your AI coding assistant. Select an element or upload assets to start building. 🛸</div>
    </div>
    <div id="na-suggestions-area"></div>
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
  const suggestionsArea = document.getElementById("na-suggestions-area");
  const globalRevertBtn = document.getElementById("na-global-revert-btn");

  let isOpen = false;
  let isSelecting = false;
  let selectedContext = null;
  let pendingFiles = [];
  let chatHistory = [];
  let isThinking = false;
  let abortController = null;
  let lastSentPayload = null;
  let logInterval = null;

  const DYNAMIC_LOG_VARIANTS = {
    indexing: [
      "📂 Mapping project structure...",
      "📂 Walking through directories...",
      "📂 Building file index..."
    ],
    ragMatch: [
      "🎯 Strongest context match: {file}",
      "🎯 High-signal file detected: {file}",
      "🎯 Prioritizing {file} (score: {score})"
    ],
    dependency: [
      "🔗 Pulling dependency: {path}",
      "🔗 Resolving linked module: {path}",
      "🔗 Expanding context with: {path}"
    ]
  };

  function getLogSequence() {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const files = ["public/agent-widget.js", "agent/rag.ts", "src/app/layout.tsx", "next.config.js"];
    const paths = ["@/components/UI", "next/navigation", "framer-motion", "lucide-react"];
    const score = (Math.random() * (0.99 - 0.88) + 0.88).toFixed(2);

    const hydrate = (text) => text
      .replace("{file}", pick(files))
      .replace("{path}", pick(paths))
      .replace("{score}", score);

    return [
      "⚙️ Initializing terminal session",
      pick(DYNAMIC_LOG_VARIANTS.indexing),
      "📡 Environment sync",
      "🧠 Decoding behavioral protocol",
      hydrate(pick(DYNAMIC_LOG_VARIANTS.ragMatch)),
      hydrate(pick(DYNAMIC_LOG_VARIANTS.dependency)),
      "🛡️ Structural validation",
      "🧩 Synthesizing response",
      "✨ Polishing interface",
      "🚀 Finalizing output"
    ];
  }

  function startLogSimulation(container) {
    if (logInterval) clearInterval(logInterval);
    const sequence = getLogSequence();
    let stepIndex = 0;
    
    const updateLog = () => {
      const isLastStep = stepIndex >= sequence.length - 1;
      const logLine = isLastStep ? sequence[sequence.length - 1] : sequence[stepIndex];
      
      container.innerHTML = `<div class="na-log-line ${isLastStep ? 'blink' : ''}">${logLine}</div>`;
      
      if (!isLastStep) {
        stepIndex++;
      } else {
        clearInterval(logInterval);
      }
    };

    updateLog();
    logInterval = setInterval(updateLog, 1200);
  }

  function stopLogSimulation() {
    if (logInterval) {
      clearInterval(logInterval);
      logInterval = null;
    }
  }

  const SUGGESTIONS = [
    { label: "✨ Glassmorphism", action: "select", prompt: "Apply a premium glassmorphism effect to this element with a subtle border and 12px blur." },
    { label: "🖱️ Hover Effects", prompt: "Add smooth micro-animations and 1.05x scale effects to all buttons and interactive elements on hover." },
    { label: "🎨 Dark Mode", prompt: "Transform the page into a sleek dark mode using a deep slate background and vibrant blue accents." },
    { label: "✍️ Modern Type", prompt: "Upgrade the typography to 'Inter', improve font weights, and optimize line heights for better readability." }
  ];

  // --- UI Helpers ---

  function renderSuggestions() {
    if (chatHistory.length > 0) {
      suggestionsArea.innerHTML = "";
      return;
    }

    suggestionsArea.innerHTML = `
      <div class="na-suggestions-area">
        <div class="na-suggestions-title">Suggestions</div>
        <div class="na-suggestions-list" id="na-suggestions-list"></div>
      </div>
    `;

    const list = document.getElementById("na-suggestions-list");
    SUGGESTIONS.forEach(item => {
      const chip = document.createElement("div");
      chip.className = "na-suggestion-chip";
      chip.textContent = item.label;
      chip.onclick = () => {
        suggestionsArea.innerHTML = "";
        if (item.prompt) input.value = item.prompt;
        
        if (item.action === "select") {
          startSelection();
        } else if (item.action === "upload") {
          fileInput.click();
        } else {
          sendMessage();
        }
      };
      list.appendChild(chip);
    });
  }

  function appendMessage(role, text, isThinking = false) {
    if (suggestionsArea) suggestionsArea.innerHTML = "";
    if (isThinking) {
      const thinking = document.createElement("div");
      thinking.className = "na-msg agent na-typing";
      thinking.id = "na-thinking-indicator";
      thinking.innerHTML = `<div class="na-log-container" id="na-log-container"></div>`;
      messages.appendChild(thinking);
      
      const logContainer = thinking.querySelector("#na-log-container");
      startLogSimulation(logContainer);
      
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
    stopLogSimulation();
    isThinking = false;
    toggleSendButton(false);
  }

  function toggleSendButton(thinking) {
    if (thinking) {
      sendBtn.classList.add("stop");
      sendBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`;
      sendBtn.title = "Stop Execution";
    } else {
      sendBtn.classList.remove("stop");
      sendBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;
      sendBtn.title = "Send Message";
    }
  }

  // --- Auto-expanding Textarea ---
  input.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
  });

  input.addEventListener("paste", function(e) {
    // 1. Handle Image Pasting
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    let hasImage = false;
    for (let index in items) {
      const item = items[index];
      if (item.kind === 'file' && item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();
        pendingFiles.push(blob);
        hasImage = true;
      }
    }
    if (hasImage) renderAttachments();

    // 2. Ensure auto-expansion after paste
    setTimeout(() => {
      this.style.height = "auto";
      this.style.height = (this.scrollHeight) + "px";
    }, 10);
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
  
  function renderRetryButton(container) {
    const btn = document.createElement("button");
    btn.className = "na-retry-btn";
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Retry Now`;
    btn.onclick = () => {
      btn.remove();
      if (lastSentPayload) {
        input.value = lastSentPayload.message;
        // Restore selected context if it was used
        if (lastSentPayload.currentSelector) {
           selectedContext = { 
             selector: lastSentPayload.currentSelector,
             tag: lastSentPayload.currentSelector.split('.')[0] || 'element'
           };
           renderChip();
        }
        sendMessage(true); // pass true to indicate it's a retry
      }
    };
    container.appendChild(btn);
  }

  async function revertChanges(btn) {
    if (btn.disabled) return;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `⌛ Reverting...`;
    
    try {
      const response = await fetch("/api/agent/revert", { method: "POST" });
      const result = await response.json();
      
      if (result.success) {
        btn.innerHTML = `🔙 Reverted`;
        btn.style.background = "var(--na-success)";
        btn.style.color = "#fff";
        appendMessage("agent", "🔙 Changes have been reverted successfully.");
      } else {
        btn.innerHTML = `❌ Failed`;
        alert("Revert failed: " + result.error);
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }, 2000);
      }
    } catch (err) {
      btn.innerHTML = `❌ Error`;
      console.error("Revert error:", err);
    }
  }

  async function syncChanges(btn) {
    if (btn.disabled) return;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `⌛ Syncing...`;
    
    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "sync",
          message: "Manual sync from Nexus Agent UI",
          user: "NexusUser"
        })
      });
      const result = await response.json();
      
      if (result.reply) {
        btn.innerHTML = `🚀 Synced`;
        btn.style.background = "var(--na-success)";
        btn.style.color = "#fff";
        appendMessage("agent", result.reply);
      } else {
        btn.innerHTML = `❌ Failed`;
        alert("Sync failed: " + (result.error || "Unknown error"));
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }, 2000);
      }
    } catch (err) {
      btn.innerHTML = `❌ Error`;
      console.error("Sync error:", err);
    }
  }

  async function sendMessage(isRetry = false) {
    // STOP check MUST come first — clicking Stop has empty input, and the empty guard
    // would otherwise cause an early return before the abort could fire.
    if (isThinking) {
      if (abortController) abortController.abort();
      stopLogSimulation();
      return;
    }

    const text = input.value.trim();
    if (!text && !selectedContext && pendingFiles.length === 0 && !isRetry) return;

    const currentSelector = selectedContext ? selectedContext.selector : null;
    const displayMessage = text || (currentSelector ? `Analyzing ${selectedContext.tag}...` : "");
    
    if (displayMessage && !isRetry) appendMessage("user", displayMessage);
    const thinking = appendMessage("agent", "", true);

    // Update state
    isThinking = true;
    abortController = new AbortController();
    toggleSendButton(true);

    // Disable input while thinking
    input.disabled = true;
    sendBtn.disabled = false; // Keep enabled for "Stop"

    // Prepare attachments
    const attachmentSpecs = await Promise.all(pendingFiles.map(async (file) => ({
      name: file.name,
      type: file.type,
      data: await fileToBase64(file)
    })));

    // Reset UI state
    input.value = "";
    input.style.height = "auto";
    const lastSelector = currentSelector; // Keep local copy for history tracking if needed
    selectedContext = null;
    pendingFiles = [];
    renderChip();
    renderAttachments();

    lastSentPayload = {
      message: text || `Analyze the element: ${lastSelector}`,
      currentSelector: lastSelector,
      history: [...chatHistory],
      attachments: attachmentSpecs,
      currentUrl: window.location.pathname
    };

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        body: JSON.stringify({ ...lastSentPayload, user: "NexusUser" }),
      });

      const result = await response.json();
      removeThinking();

      if (result.error) {
        const errorMsg = appendMessage("agent", `⚠️ Agent Error: ${result.error}`);
        errorMsg.style.color = "var(--na-error)";
        if (result.error.toLowerCase().includes("high demand") || result.error.includes("503")) {
          renderRetryButton(messages);
        }
      } else {
        appendMessage("agent", result.reply);
        
        if (result.filesChanged && result.filesChanged.length > 0) {
          const log = document.createElement("div");
          log.className = "na-change-log";
          log.innerHTML = `
            <div><strong>✨ Architecture Updated:</strong><br>${result.filesChanged.join("<br>")}</div>
            <div style="display:flex; gap:8px; margin-top:8px;">
              <button class="na-revert-btn" title="Undo these changes">🔙 Revert</button>
            </div>
          `;
          log.querySelector(".na-revert-btn").onclick = (e) => revertChanges(e.target);
          messages.appendChild(log);
          messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' });
        }
        
        // Persist History
        chatHistory.push({ role: "user", text: text || (lastSelector ? `Analyze ${lastSelector}` : "Review request") });
        chatHistory.push({ role: "model", text: result.reply });
        if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
      }
    } catch (err) {
      removeThinking();
      if (err.name === 'AbortError') {
        appendMessage("agent", "🛑 Execution terminated by user.").style.color = "var(--na-text-muted)";
      } else {
        appendMessage("agent", "❌ Connection failed. Ensure the dev server is running.").style.color = "var(--na-error)";
        renderRetryButton(messages);
      }
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // --- Draggable Logic ---
  let isDragging = false;
  let dragStartX, dragStartY;
  let initialRootX, initialRootY;
  let hasMoved = false;

  btn.addEventListener("mousedown", (e) => {
    isDragging = true;
    hasMoved = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    const rect = root.getBoundingClientRect();
    initialRootX = rect.left;
    initialRootY = rect.top;
    
    root.style.transition = "none"; // Disable transitions during drag
    btn.style.cursor = "grabbing";
    
    // Set fixed positioning using left/top instead of bottom/right for dragging
    root.style.bottom = "auto";
    root.style.right = "auto";
    root.style.left = `${initialRootX}px`;
    root.style.top = `${initialRootY}px`;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMoved = true;
    }
    
    root.style.left = `${initialRootX + dx}px`;
    root.style.top = `${initialRootY + dy}px`;
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    btn.style.cursor = "grab";
    root.style.transition = "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"; // Re-enable transitions
  });

  // --- Event Listeners ---

  btn.onclick = async (e) => {
    console.log("🖱️ [Nexus Agent] Chat icon clicked.");
    if (hasMoved) {
      console.log("🚷 [Nexus Agent] Drag detected, skipping click event.");
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    isOpen = !isOpen;
    console.log(`📂 [Nexus Agent] Panel visibility: ${isOpen ? "OPENING" : "CLOSING"}`);
    
    panel.style.display = isOpen ? "flex" : "none";
    setTimeout(() => {
      panel.classList.toggle("visible", isOpen);
      if (isOpen) {
        console.log("⌨️ [Nexus Agent] Focusing input and rendering suggestions.");
        input.focus();
        renderSuggestions();
      }
    }, 10);
    btn.innerHTML = isOpen ? `✕` : `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`;
  };

  attachBtn.onclick = () => fileInput.click();
  fileInput.onchange = () => {
    pendingFiles = [...pendingFiles, ...Array.from(fileInput.files)];
    renderAttachments();
  };

  async function revertChanges(btnElement) {
    if (btnElement) {
      btnElement.disabled = true;
      btnElement.innerHTML = `<span class="na-loader"></span> Reverting...`;
    }

    try {
      const response = await fetch("/api/agent/revert", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const result = await response.json();
      if (result.success) {
        appendMessage("agent", `✅ **Reverted**: All local changes have been discarded. Workspace is back to the last commit.`);
        if (btnElement) btnElement.style.display = "none";
        // Optionally refresh to show restored state
        setTimeout(() => window.location.reload(), 2000);
      } else {
        appendMessage("agent", `❌ **Revert Failed**: ${result.error || "Unknown error"}`);
        if (btnElement) {
          btnElement.disabled = false;
          btnElement.innerHTML = `🔙 Revert`;
        }
      }
    } catch (err) {
      console.error("Revert failed:", err);
      appendMessage("agent", `❌ **Revert Failed**: Could not connect to revert service.`);
      if (btnElement) {
        btnElement.disabled = false;
        btnElement.innerHTML = `🔙 Revert`;
      }
    }
  }

  // --- Element Selection Logic ---

  selectBtn.onclick = startSelection;
  sendBtn.onclick = sendMessage;
  input.onkeydown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  globalRevertBtn.onclick = (e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to REVERT ALL local changes? This will discard every uncommitted edit made by the agent.")) {
      revertChanges(globalRevertBtn);
    }
  };

})();