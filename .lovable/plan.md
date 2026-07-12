# DESHA — Dark Fantasy Productivity Game

I've read and permanently saved all 10 parts as the master spec. Updated per your request: **all AI runs on OpenAI GPT-5.5 exclusively** — no Gemini, no other providers.

## AI setup (per your instruction)
- **Model**: `openai/gpt-5.5` — GPT-5.5 with vision (it accepts images natively, which is what "GPT-5.5 Vision" means in the current API) for proof-image verification and all AI logic.
- **Where it runs**: strictly on the backend in server functions. The API key lives in server-side environment variables only — never in the browser, never in frontend code.
- **How it's keyed**: I'll route the calls through Lovable's secure AI gateway, which gives you GPT-5.5 access with the key already provisioned server-side. All prompts and request formats are written OpenAI-compatible, exactly as GPT-5.5 expects. (If you later want to plug in your own OpenAI API key directly, the AI module is isolated so it's a one-file swap.)

## Phase 1 — Foundation & Design System
- Dark fantasy design system: purple/blue magic glow, glassmorphism, fog + particles, premium shadows, Arabic-friendly font, full RTL
- Original DESHA character artwork (multiple expressions: idle, thinking, scanning, celebrating, disappointed, suspicious…)
- App shell: desktop sidebar layout + mobile bottom-nav layout (genuinely different)
- All UI text in Egyptian Arabic colloquial

## Phase 2 — Backend & Auth
- Enable Lovable Cloud
- Google login only, auto profile creation (name + avatar from Google), persistent sessions
- Database: profiles, challenges, challenge_logs, daily_rewards — UUID keys, RLS on everything
- XP, points, levels, streaks computed **server-side only**
- One active challenge enforced at the database level

## Phase 3 — Core Game Loop
- Create challenge: name, description, notes, any duration
- Running challenge: countdown from **server timestamps** — survives browser close, phone lock, restarts, offline
- Overtime penalty: −1 point per 10 minutes past planned end
- Upload proof: camera / gallery / drag-drop, jpg/png/webp only, compression, size limits, duplicate-hash detection
- **GPT-5.5 verification**: image + challenge context sent server-side to GPT-5.5 → accept / reject / "وريني صورة أوضح" with confidence score and reasoning, all logged. Cinematic scanning screen with delayed reveal.
- Victory & defeat screens with XP/points animations and sarcastic DESHA reactions (GPT-5.5-compatible Egyptian Arabic prompts)

## Phase 4 — Progression & Pages
- Unlimited levels, rising XP curve, level-up celebration
- Daily reward (10 points / 24h), streak system with milestones
- History (search + filters), Calendar (green/red/gray + day details), Statistics (animated counters), Profile, Settings, How To Play, 404 — all with DESHA commentary in Egyptian Arabic

## Phase 5 — Polish
- DESHA typing-effect dialogue, expression switching, floating/breathing animations
- Sounds (optional, mutable), PWA installability, browser notifications
- Performance: lazy loading, code splitting, smooth 60fps animations

## Order of delivery
Built in rounds — each leaves you a working app. First round: design system + DESHA character + app shell + auth + database + the complete challenge loop with GPT-5.5 verification.

Ready on your approval — يلا بينا؟ 😈
