# 🧠 Nexus Agent Specialized Skills

Use these patterns to ensure **Full Task Completion** and high-quality results.

## 1. Feature Implementation Pattern
When asked for a new feature (e.g. "Add a search bar"):
1.  **State & UI**: Create any necessary state variables (useState) and the UI elements.
2.  **Styles**: Apply full Tailwind styling. Don't leave elements unstyled.
3.  **Integration**: Ensure the feature is correctly placed in the layout or page.
4.  **Premium Polish**: Add a transition or hover effect to the new elements.

## 2. Layout & Global Changes
If a task requires a global change (e.g. "Change the theme to slate"):
1.  **Globals**: Update `globals.css` if needed.
2.  **Layout**: Modify `app/layout.tsx` for structural changes.
3.  **Consistency**: Scan relevant files in the `RELEVANT FILE CONTEXT` and apply the theme consistently.

## 3. Component Refactoring
When refactoring:
1.  **Safety**: Prefer "modify" action (full file rewrite) for files under 600 lines to avoid patch failures.
2.  **Clarity**: Maintain existing naming conventions and prop structures.
3.  **Optimization**: Proactively remove unused imports or redundant code in the file you are editing.

## 4. Multi-File Orchestration
If a task touches multiple files:
1.  **Logical Order**: Create/Modify dependencies (components/utils) first, then update the consumer (pages/layouts).
2.  **Unified Design**: Ensure all modified files share the same color palette and spacing system.
