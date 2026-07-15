import { Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Home,
  Swords,
  ScrollText,
  CalendarDays,
  BarChart3,
  User,
  Settings,
  HelpCircle,
  LogOut,
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

  const NAV = [
    { to: "/home", label: tr.nav_home, icon: Home },
    { to: "/challenge/active", label: tr.nav_challenge, icon: Swords },
    { to: "/history", label: tr.nav_history, icon: ScrollText },
    { to: "/calendar", label: tr.nav_calendar, icon: CalendarDays },
    { to: "/stats", label: tr.nav_stats, icon: BarChart3 },
    { to: "/profile", label: tr.nav_profile, icon: User },
    { to: "/how-to-play", label: tr.nav_how_to_play, icon: HelpCircle },
    { to: "/settings", label: tr.nav_settings, icon: Settings },
  ] as const;

  const MOBILE_NAV = NAV.slice(0, 5);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  return (
    <div className="min-h-dvh" dir={dir}>
      <MagicBackground />

      {/* Desktop sidebar — end-aligned so it works for both LTR and RTL */}
      <aside className="glass-strong fixed inset-y-4 end-4 z-40 hidden w-60 flex-col rounded-3xl p-4 md:flex">
        <Link to="/home" className="mb-6 flex items-center gap-2 px-2 pt-2">
          <span className="font-display text-2xl font-bold text-glow">ديشا 😈</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-primary/15 hover:text-foreground [&.active]:gradient-magic [&.active]:text-primary-foreground [&.active]:glow"
              activeProps={{ className: "active" }}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 flex items-center gap-2 border-t border-border/40 pt-4">
          <ThemeToggle />
          <LanguageSelector />
        </div>

        <button
          onClick={signOut}
          className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
        >
          <LogOut size={18} />
          {tr.nav_sign_out}
        </button>
      </aside>

      {/* Content */}
      <main className="px-4 pb-28 pt-6 md:me-72 md:pb-10 md:ps-8 md:pt-8">
        <motion.div
          className="mx-auto w-full max-w-3xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="glass-strong fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-3xl px-2 py-2 md:hidden">
        {MOBILE_NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-[10px] font-semibold text-muted-foreground transition-all [&.active]:text-primary-glow [&.active]:text-glow"
            activeProps={{ className: "active" }}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
