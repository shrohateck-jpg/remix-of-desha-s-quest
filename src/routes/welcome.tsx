import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Desha } from "@/components/game/Desha";
import { MagicBackground } from "@/components/game/MagicBackground";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLang } from "@/contexts/LangContext";

export const Route = createFileRoute("/welcome")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ديشا — ابدأ رحلتك" },
      { name: "description", content: "اختار طريقتك للدخول لديشا." },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const router = useRouter();
  const { tr, dir } = useLang();
  const isRtl = dir === "rtl";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.navigate({ to: "/home", replace: true });
    });
  }, [router]);

  return (
    <div className="relative flex min-h-dvh flex-col" dir={dir}>
      <MagicBackground enhanced />

      <header className="relative z-10 flex items-center justify-between px-6 pt-5">
        <Link
          to="/"
          className="glass flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <BackIcon size={14} />
          {tr.auth_back}
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex w-full max-w-sm flex-col items-center text-center"
        >
          <div className="relative mb-5">
            <div className="animate-pulse-glow absolute inset-0 rounded-full bg-primary/25 blur-2xl scale-110" />
            <Desha expression="idle" size="lg" className="relative animate-desha-float" />
          </div>

          <h1 className="font-display text-4xl font-black text-glow">{tr.welcome_title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{tr.welcome_sub}</p>

          <div className="mt-8 flex w-full flex-col gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/login"
                className="gradient-magic glow-strong flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-lg font-black text-primary-foreground shadow-lg"
              >
                <LogIn size={20} />
                {tr.landing_sign_in}
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/signup"
                className="glass-strong flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-lg font-bold text-primary-glow transition-all hover:border-primary/50"
              >
                <UserPlus size={20} />
                {tr.landing_sign_up}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
