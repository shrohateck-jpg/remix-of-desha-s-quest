import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Desha } from "@/components/game/Desha";
import { MagicBackground } from "@/components/game/MagicBackground";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLang } from "@/contexts/LangContext";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ديشا — لعبة الإنتاجية الشريرة 😈" },
      { name: "description", content: "حوّل مهامك لتحديات، وخلي ديشا يحكم عليك بالصور." },
      { property: "og:title", content: "ديشا — لعبة الإنتاجية الشريرة 😈" },
      { property: "og:description", content: "حوّل مهامك لتحديات، وخلي ديشا يحكم عليك بالصور." },
    ],
  }),
  component: LandingPage,
});

const FEATURES = [
  { emoji: "⚔️", key: "landing_feat_challenges" as const },
  { emoji: "📸", key: "landing_feat_proof" as const },
  { emoji: "🔥", key: "landing_feat_xp" as const },
];

const itemAnim = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const itemTransition = (delay = 0) => ({ duration: 0.5, ease: "easeOut", delay } as const);

function LandingPage() {
  const router = useRouter();
  const { tr, dir } = useLang();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.navigate({ to: "/home" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") router.navigate({ to: "/home" });
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  return (
    <div className="relative flex min-h-dvh flex-col" dir={dir}>
      <MagicBackground enhanced />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-5">
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
        <LanguageSelector />
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-10 pt-4">
        <div className="flex w-full max-w-md flex-col items-center text-center">
          {/* Logo / Avatar */}
          <motion.div {...itemAnim} transition={itemTransition(0)} className="relative">
            <div className="animate-pulse-glow absolute inset-0 rounded-full bg-primary/30 blur-2xl scale-110" />
            <Desha expression="idle" size="xl" className="relative animate-desha-float" />
          </motion.div>

          {/* Title */}
          <motion.div {...itemAnim} transition={itemTransition(0.1)} className="mt-5">
            <h1 className="font-display text-6xl font-bold text-glow md:text-7xl">
              {tr.landing_title}
            </h1>
            <p className="mt-2 text-lg font-bold text-primary-glow">
              {tr.landing_subtitle}
            </p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground leading-relaxed">
              {tr.landing_tagline}
            </p>
          </motion.div>

          {/* Single primary CTA → welcome chooser */}
          <motion.div {...itemAnim} transition={itemTransition(0.2)} className="mt-8 w-full">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/welcome"
                className="gradient-magic glow-strong flex w-full items-center justify-center rounded-2xl px-6 py-4 text-xl font-black text-primary-foreground shadow-lg"
              >
                {tr.landing_start_now} 🚀
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature pills */}
          <motion.div {...itemAnim} transition={itemTransition(0.3)} className="mt-10 grid w-full grid-cols-3 gap-3">
            {FEATURES.map((f) => (
              <div key={f.key} className="glass rounded-2xl px-2 py-4 text-center">
                <div className="text-2xl">{f.emoji}</div>
                <div className="mt-1.5 text-[11px] font-semibold leading-tight text-muted-foreground">
                  {tr[f.key]}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Subtle bottom glow line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
}
