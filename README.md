# ✦ Nexus Agent: The Autonomous Development Layer

**Nexus Agent** is a sophisticated, two-part AI orchestration system designed to turn any Next.js project into an autonomous, self-evolving workspace. It bridges the gap between raw LLM reasoning and precise codebase execution.

---

## 🚀 Vision
Built for the **IndiaMART Hackathon**, Nexus Agent represents a shift from "chat-about-code" to "codebase-ownership." It empowers developers to build, refactor, and safely experiment with complex UI/UX and logic through a seamless AI-native interface.

---

## ✨ Key Features

### 🧠 High-Fidelity Intelligence
- **Claude 3.5 Sonnet Integration**: Powered by an internal LLM Gateway, the agent handles complex multi-file refactoring with deep architectural understanding.
- **Agentic RAG**: An intelligent retrieval system that automatically identifies and gathers relevant file context based on user intent.

### 🛡️ Safety & Resilience (Safety Armor)
- **Git-Backed Reverts**: Every change is transactional. Use the "Revert All" or per-message "Undo" to instantly restore your workspace via `git reset --hard`.
- **Write-Block Guards**: Last-mile validation that prevents the LLM from writing empty files or malformed code, protecting your application from crashes.

### 🎨 Premium Developer Experience
- **Interactive AI Widget**: A sleek, non-blocking side-panel built with Framer Motion and Tailwind CSS.
- **Real-time Change Logs**: Instant visibility into every file modified, patched, or created by the agent.
- **Google Translate Integration**: Built-in global accessibility tools in the core header.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **LLM**: Claude 3.5 Sonnet (via Internal Gateway)
- **Version Control**: Simple-Git

---

## 📖 Technical Journey & Skills
For a deep dive into our technical journey, implementation mapping, and team roles, please see our [Skills Narrative](./skills.md).

---

## ⚡ Quick Start

1. **Configure Environment**:
   ```bash
   # .env
   GATEWAY_API_KEY=your_internal_gateway_key
   ```

2. **Launch Development Server**:
   ```bash
   npm run dev
   ```

3. **Interact**:
   Click the Nexus icon in the bottom right to start your autonomous development session.
