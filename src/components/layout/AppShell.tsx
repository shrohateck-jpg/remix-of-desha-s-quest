import { Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  BarChart3,
  CalendarDays,
  HelpCircle,
  Home,
  LogOut,
  ScrollText,
  Settings,
  ShieldCheck,
  Swords,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { MagicBackground } from "@/components/game/MagicBackground";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLang } from "@/contexts/LangContext";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { tr, dir } = useLang();

  const nav = [
    { to: "/home", label: tr.nav_home, icon: Home },
    { to: "/challenge/active", label: tr.nav_challenge, icon: Swords },
    { to: "/history", label: tr.nav_history, icon: ScrollText },
    { to: "/calendar", label: tr.nav_calendar, icon: CalendarDays },
    { to: "/stats", label: tr.nav_stats, icon: BarChart3 },
    { to: "/profile", label: tr.nav_profile, icon: User },
    { to: "/how-to-play", label: tr.nav_how_to_play, icon: HelpCircle },
    { to: "/settings", label: tr.nav_settings, icon: Settings },
  ] as const;

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  return (
    <div className="min-h-dvh" dir={dir}>
      <MagicBackground />
      <aside className="glass-strong fixed inset-y-4 end-4 hidden w-64 flex-col rounded-3xl p-4 md:flex">
        <Link to="/home" className="flex items-center gap-3 rounded-2xl px-2 py-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <ShieldCheck size={22} />
          </span>
          <span>
            <span className="font-display block text-xl font-black tracking-tight">DESHA</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Challenge arena</span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="mt-5 flex flex-1 flex-col gap-1.5">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-bold text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&.active]:bg-primary [&.active]:text-primary-foreground [&.active]:shadow-lg"
              activeProps={{ className: "active" }}
            >
              <Icon size={18} />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-between rounded-2xl bg-muted/60 p-2">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector />
          </div>
          <button
            onClick={signOut}
            className="flex size-10 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={tr.nav_sign_out}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <header className="sticky top-0 flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl md:hidden">
        <Link to="/home" className="font-display text-lg font-black">DESHA</Link>
        <div className="flex items-center gap-2"><ThemeToggle /><LanguageSelector /></div>
      </header>

      <main className="px-4 pb-28 pt-7 md:me-72 md:px-8 md:pb-12 md:pt-10">
        <motion.div
          className="mx-auto w-full max-w-4xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      <nav aria-label="Mobile navigation" className="glass-strong fixed inset-x-3 bottom-3 flex items-center justify-around rounded-3xl p-2 md:hidden">
        {nav.slice(0, 5).map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex min-w-14 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-bold text-muted-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&.active]:bg-primary [&.active]:text-primary-foreground"
            activeProps={{ className: "active" }}
          >
            <Icon size={19} />
            <span className="max-w-14 truncate">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
