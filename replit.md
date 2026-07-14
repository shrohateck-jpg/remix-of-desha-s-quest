# ديشا — لعبة الإنتاجية الشريرة

An Arabic-language productivity game where tasks become challenges judged by an AI character (Desha). Complete tasks to earn XP, points, and streaks — or face Desha's wrath.

## Stack

- **Frontend**: React 19 + TanStack Router/Start (SSR)
- **Styling**: Tailwind CSS v4 + Radix UI + shadcn/ui components
- **Auth & Database**: Supabase (auth via Google OAuth)
- **Build tool**: Vite 8 via `@lovable.dev/vite-tanstack-config`
- **Animations**: Framer Motion

## Running the app

```bash
npm run dev
```

The dev server starts on **port 5000**. The workflow `Start application` handles this automatically.

## Environment

Supabase credentials are in `.env` (public anon key — safe to commit):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_PROJECT_ID`

Google OAuth is configured through Supabase — no extra secrets needed for local dev.

## Notes

- `vite.config.ts` overrides the Lovable-default port (8080) to 5000 for Replit compatibility.
- Route files live in `src/routes/`; TanStack Router auto-generates `src/routeTree.gen.ts`.
- Supabase migrations are in `supabase/migrations/`.

## User preferences

- Keep existing project structure and stack.
