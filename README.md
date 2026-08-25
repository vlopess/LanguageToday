![img](https://github.com/vlopess/LanguageToday/blob/main/src/assets/banner.png?raw=true)
# LanguageToday

**LanguageToday** is a free educational web application designed to help learners study **any language** through structured lessons, practical exercises, and AI-assisted guidance.

It combines academic organization with real-world usage, focusing on long-term retention and practical communication skills.

![status](https://img.shields.io/badge/status-DONE-brightgreen.svg?style=flat)
![contributions](https://img.shields.io/badge/contributions-WELCOME-brightgreen.svg?style=flat)

<a href = "https://languagetoday.netlify.app/" target="_blank"><img src="https://img.shields.io/badge/-ACESSE O SITE-%23333?style=for-the-badge&logoColor=white"   target="_blank"></a>

---

## About the Project

LanguageToday is built around a simple principle:

> Learning a language should be structured, practical, and accessible — without requiring accounts, subscriptions, or data tracking.

The platform provides:

* Free educational content
* Structured 10-step curriculum (A1 → C2 CEFR levels)
* Practical exercises focused on real retention
* AI-assisted tutor and session generation
* Support in Portuguese, English, or Spanish

---

## Tecnologias utilizadas
Esse projeto foi desenvolvido utilizando as seguintes tecnologias:

![](https://skillicons.dev/icons?i=react,vite,idea,ai)

---

## The Three Learning Pillars

LanguageToday is based on three core pillars:

### 1. Structured Curriculum

Content is organized in a fixed 10-step academic path (Alphabet → Greetings → Numbers → … → Advanced), ensuring logical development from foundational concepts to more advanced topics.

### 2. Active Recall

Exercises are designed to reinforce memory through retrieval practice — promoting stronger and longer-lasting retention. Task types include active-recall, multiple-choice, fill-in-the-blank, and translation.

### 3. Real Context

Lessons include everyday phrases, short stories, and dialogues to connect grammar with real-life communication. Daily stories are AI-generated per language.

---

## Essential Curriculum

Core modules include:

* Alphabet and pronunciation
* Greetings and basic phrases
* Numbers and basic logic
* Personal introduction
* Daily routines and time
* Formal vs informal language
* Future plans and intentions
* Past experiences
* Complex grammar patterns
* Advanced vocabulary and nuance

---

## AI Tutor (24/7 Support)

LanguageToday includes an AI-powered tutor capable of:

* Grammar correction with explanations
* Writing practice assistance
* Answering learner questions in your support language
* Session-based learning history

All AI content is generated via Groq API (browser-side) and personalized to your target language and level.

---

## How It Works

1. **Sign in** with Supabase (email/password or magic link)
2. **Choose a language** to study (Czech, English, Spanish, or any new language available in the catalog)
3. **Set your profile** — name, CEFR level, daily time, and support language for explanations
4. **Generate your first session** — AI creates 10 activities tailored to your level
5. **Study** — complete tasks, read stories, review flashcards, and chat with the AI tutor
6. **Resume anytime** — sessions are saved locally; pick up where you left off

---

## Privacy-First Architecture

Learning activities run locally in the browser.

* Minimal data collection (email only for auth)
* All session data stored in localStorage
* No third-party tracking
* Supabase used only for auth and shared AI content caching
* PWA installable on desktop and mobile

---

## Progressive Web App (PWA)

LanguageToday can be installed as a Progressive Web App, allowing users to:

* Install it on desktop or mobile
* Use it like a native application
* Access it quickly from the home screen

---

## Environment Setup

Create a `.env` file in the project root with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
```

Then run:

```bash
npm install
npm run dev
```

---

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Serve `dist/` |

---

## Feedback

If you have any feedback, please let me know via victorldev8@gmail.com

---
<h4 align="center">
    Made by <a href="github.com/vlopess" target="_blank">Victor L</a>
</h4>
