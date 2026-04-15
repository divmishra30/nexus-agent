# 🛸 Nexus Agent Portability Guide

Follow this guide to integrate the Nexus Agent (with "Defined Border" design) into any Next.js project.

## 1. Prerequisites

Ensure your target project is using:
- **Next.js 14+** (App Router)
- **Tailwind CSS 3.4+**
- **TypeScript**

## 2. Installation

Install the required core dependencies in your target project:

```bash
npm install @google/generative-ai simple-git uuid framer-motion
```

## 3. Environment Setup

Add your Gemini API Key to your `.env.local` file:

```env
GEMINI_API_KEY=your_api_key_here
```

## 4. Copy Core Files

Copy the following folders/files from the Nexus project to your target project:

| Source | Destination | Description |
| :--- | :--- | :--- |
| `agent/` | `/agent/` | AI Logic & Validators |
| `app/api/agent/` | `/app/api/agent/` | Chat Backend Route |
| `public/agent-widget.js` | `/public/agent-widget.js` | Frontend Chat Widget |
| `public/uploads/` | `/public/uploads/` | (Optional) For asset storage |

## 5. Global Integration

Open your root layout at `app/layout.tsx` (or similar) and include the agent script before the closing `</body>` tag:

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Nexus Agent Widget */}
        <script src="/agent-widget.js" defer></script>
      </body>
    </html>
  );
}
```

## 6. Verification

1. Start your local dev server: `npm run dev`.
2. You should see the **✦** button in the bottom-right corner.
3. Open the chat and try a command like: "Add a red border to the main heading".

---

### ⚠️ Important Notes

- **Git requirement**: The agent uses `simple-git` to understand project structure. Your project must be a Git repository (`git init`).
- **Pathing**: The agent expects a standard Next.js directory structure (`app/` folder).
- **Security**: The `/api/agent/chat` route is currently open. In a production environment, ensure you add authentication middleware to this route.
