import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Flame, ShieldCheck, Swords, Trophy } from "lucide-react";
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
      { title: "ديشا — حوّل أهدافك إلى انتصارات" },
      { name: "description", content: "تحديات بوقت حقيقي، إثبات ذكي بالصور، ومستويات تكافئ التزامك." },
    ],
  }),
  component: LandingPage,
});

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

  const features = [
    { icon: Swords, title: tr.landing_feat_challenges, text: tr.challenge_duration },
    { icon: Camera, title: tr.landing_feat_proof, text: tr.challenge_submit_title },
    { icon: Flame, title: tr.landing_feat_xp, text: `${tr.home_streak} · ${tr.home_wins}` },
  ];

  return (
    <div className="relative min-h-dvh overflow-hidden" dir={dir}>
      <MagicBackground enhanced />
      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg"><ShieldCheck size={22} /></span>
          <div><p className="font-display text-lg font-black">DESHA</p><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Challenge arena</p></div>
        </div>
        <div className="flex items-center gap-2"><ThemeToggle /><LanguageSelector /></div>
      </header>

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 pb-16 pt-8 md:px-8 lg:flex-row lg:items-center lg:gap-16 lg:pt-14">
        <section className="flex flex-1 flex-col items-start">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold text-primary-glow">
            <Trophy size={15} /> {tr.landing_subtitle}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="font-display mt-6 max-w-3xl text-balance text-5xl font-black leading-[1.12] tracking-tight md:text-7xl">
            {tr.landing_title}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mt-5 max-w-xl text-pretty text-base font-semibold leading-7 text-muted-foreground md:text-lg">
            {tr.landing_tagline}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/welcome" className="flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-primary px-8 text-base font-black text-primary-foreground shadow-xl transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {tr.landing_start_now}<ArrowLeft size={19} className="rtl:rotate-180" />
            </Link>
            <span className="flex min-h-14 items-center justify-center rounded-2xl border border-border bg-card/70 px-6 text-sm font-bold text-muted-foreground backdrop-blur-xl">{tr.landing_feat_proof}</span>
          </motion.div>
        </section>

        <motion.section initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="relative flex flex-1 items-center justify-center" aria-label="DESHA challenge preview">
          <div className="glass-strong relative w-full max-w-md overflow-hidden rounded-[2rem] p-6 md:p-8">
            <div className="flex items-center justify-between"><span className="rounded-full bg-accent/15 px-3 py-1.5 text-xs font-black text-gold">LEVEL 07</span><span className="text-xs font-bold text-muted-foreground">1,240 XP</span></div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-3/4 rounded-full bg-primary" /></div>
            <div className="mt-6 flex justify-center"><Desha expression="idle" size="lg" className="animate-desha-float" /></div>
            <div className="mt-5 rounded-2xl border border-border/70 bg-muted/55 p-4 text-center"><p className="font-display text-lg font-black">{tr.home_new_challenge}</p><p className="mt-1 text-sm text-muted-foreground">{tr.home_new_challenge_sub}</p></div>
          </div>
        </motion.section>
      </main>

      <section className="relative mx-auto grid w-full max-w-7xl gap-3 px-5 pb-10 md:grid-cols-3 md:px-8">
        {features.map(({ icon: Icon, title, text }) => (
          <article key={title} className="glass flex items-center gap-4 rounded-3xl p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary-glow"><Icon size={21} /></span>
            <div><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>
          </article>
        ))}
      </section>
    </div>
  );
}
