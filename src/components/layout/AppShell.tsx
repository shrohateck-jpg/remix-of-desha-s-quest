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
import { supabase } from "@/integrations/supabase/client";
import { MagicBackground } from "@/components/game/MagicBackground";

const NAV = [
  { to: "/home", label: "الرئيسية", icon: Home },
  { to: "/challenge/active", label: "التحدي", icon: Swords },
  { to: "/history", label: "التاريخ", icon: ScrollText },
  { to: "/calendar", label: "التقويم", icon: CalendarDays },
  { to: "/stats", label: "الإحصائيات", icon: BarChart3 },
  { to: "/profile", label: "البروفايل", icon: User },
  { to: "/how-to-play", label: "إزاي ألعب؟", icon: HelpCircle },
  { to: "/settings", label: "الإعدادات", icon: Settings },
] as const;

const MOBILE_NAV = NAV.slice(0, 5);

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  return (
    <div className="min-h-dvh" dir="rtl">
      <MagicBackground />

      {/* Desktop sidebar */}
      <aside className="glass-strong fixed inset-y-4 right-4 z-40 hidden w-60 flex-col rounded-3xl p-4 md:flex">
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
              <Icon className="h-4.5 w-4.5" size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <button
          onClick={signOut}
          className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
        >
          <LogOut size={18} />
          خروج
        </button>
      </aside>

      {/* Content */}
      <main className="px-4 pb-28 pt-6 md:mr-72 md:pb-10 md:pl-8 md:pt-8">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
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
