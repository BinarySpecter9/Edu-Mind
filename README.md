<div align="center">

# 🧠 EduMind

### Your AI-Powered Study Companion

*Ask anything. Take smart notes. Ace your exams.*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## 📖 About

**EduMind** is an AI study assistant built for students. Instead of a generic chatbot, it gives you **seven purpose-built study modes** — each powered by its own carefully crafted system prompt — so you get the right kind of help whether you're revising at midnight, writing an assignment, or practicing past papers.

Type a question, attach a file or image, pick a mode, and learn.

## ✨ Features

| Mode | What it does |
|------|--------------|
| ✦ **Ask Anything** | General learning — clear explanations with examples & analogies |
| ◈ **Smart Notes** | Structured, exam-friendly summaries & outlines |
| ◎ **Quiz Mode** | Interactive MCQs with instant feedback & explanations |
| ◆ **Exam Prep** | Strategic prep — key topics, formulas, mnemonics, question prediction |
| ◉ **Assignments** | Guided, step-by-step assignment support (not just answers) |
| ▣ **Past Papers** | Realistic exam-style questions with model answers & marking schemes |
| ⬡ **Deep Research** | In-depth, multi-perspective research briefs |

**Also included:**
- 📎 **File attachments** — drop in images or text files for context-aware answers
- 💡 **Starter prompts** — one-click examples to get going instantly
- 🎨 **Markdown rendering** — beautifully formatted notes, lists & code
- 🌙 **Sleek dark UI** — distraction-free, ChatGPT-style interface with collapsible sidebar

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite 8, vanilla CSS-in-JS styling
- **Backend:** Serverless API route (`/api/chat`)
- **AI:** Groq API — `llama-3.3-70b-versatile`
- **Tooling:** ESLint, npm

## 📁 Project Structure

```
EduMind/
├── api/
│   └── chat.js          # Serverless function → Groq chat completions
├── src/
│   ├── App.jsx          # Main app: 7 study modes, chat UI, file uploads
│   ├── main.jsx         # Entry point
│   ├── App.css          # Component styles
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html
└── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/BinarySpecter9/Edu-Mind.git
cd Edu-Mind

# 2. Install dependencies
npm install

# 3. Add your Groq API key
# Create a .env file (or set it in your hosting dashboard):
# GROQ_API_KEY=your_key_here
```

### Run locally

The app needs both the Vite frontend **and** the `/api/chat` serverless function. The easiest way is the Vercel CLI:

```bash
npx vercel dev
```

This serves the frontend and the API route together. Open the printed URL and start studying. 🎓

> **Deploying?** Push to GitHub and import into [Vercel](https://vercel.com) — add `GROQ_API_KEY` as an environment variable and you're live. The `api/` folder is picked up automatically.

## 🧠 How It Works

1. You pick a **study mode** (or just start typing)
2. The frontend sends your message + the mode's **system prompt** to `/api/chat`
3. The serverless function forwards it to **Groq's LLaMA 3.3 70B** model
4. The AI's markdown response is rendered beautifully in the chat

Each mode's system prompt is tuned for its job — Quiz Mode asks questions and evaluates answers, Notes Mode outputs scannable summaries, Research Mode goes deep. Same model, seven different tutors.

## 🗺️ Roadmap

- [ ] Conversation history & saved sessions
- [ ] Web search integration for Deep Research mode
- [ ] Export notes as PDF/Markdown
- [ ] Light mode ☀️
- [ ] Mobile-responsive layout

## 👨‍💻 Author

**Ubaid Ali** ([@BinarySpecter9](https://github.com/BinarySpecter9)) — IT student, learning by building. EduMind is a learning project and a work in progress; feedback and ideas are always welcome!

---

<div align="center">

*Built with ☕ and curiosity.*

⭐ If you find this useful, consider starring the repo!

</div>
