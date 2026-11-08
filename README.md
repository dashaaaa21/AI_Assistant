# AI Assistant

A chat assistant UI built with React, TypeScript and Vite. Replies are simulated by `src/utils/fakeAI.ts`; swap `getFakeReply` for a real AI API call to make it live.

Features: multiple chats with history in the sidebar (saved in `localStorage`), chats grouped by date, chat search, rename chats, export a chat as Markdown, clear all chats, light/dark theme, copy button on replies, stop and regenerate replies, example prompts, typing indicator, auto-growing input (Enter to send, Shift+Enter for a new line), responsive mobile layout.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```
