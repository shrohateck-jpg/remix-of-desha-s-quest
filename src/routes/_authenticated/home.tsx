import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Gem, Swords, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery, activeChallengeQuery } from "@/lib/queries";
import { desha, STATUS_LABELS, formatDuration } from "@/lib/game";
import { Desha } from "@/components/game/Desha";
import { DeshaSays } from "@/components/game/DeshaSays";
import { XPBar } from "@/components/game/XPBar";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [{ title: "الرئيسية — ديشا" }, { name: "description", content: "متابعة مستواك وتحدياتك مع ديشا." }],
  }),
  component: HomePage,
});

function HomePage() {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(profileQuery);
  const { data: active } = useQuery(activeChallengeQuery);
  const [dailyMsg, setDailyMsg] = useState<string | null>(null);

  const greeting = useMemo(() => {
    if (!profile) return "ثانية واحدة...";
    if (active) return desha.challengeRunning();
    return desha.greet(profile.display_name.split(" ")[0] || "بطل");
  }, [profile?.user_id, active?.id]);

  const today = new Date().toISOString().slice(0, 10);
  const dailyAvailable = profile && profile.last_daily_claim !== today;

  const claimDaily = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("claim_daily_reward");
      if (error) throw error;
      return data as { claimed: boolean; points?: number; xp?: number };
    },
    onSuccess: (res) => {
      if (res.claimed) {
        setDailyMsg(`خد ${res.points ?? 0} نقطة و ${res.xp ?? 0} XP... ${desha.dailyClaimed()}`);
      } else {
        setDailyMsg(desha.dailyClaimed());
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => setDailyMsg("حصلت مشكلة... جرب تاني."),
  });

  if (!profile) {
    return (
      <div className="flex flex-col items-center py-20">
        <Desha expression="thinking" size="md" />
        <p className="mt-4 text-muted-foreground">بنجهزلك الدنيا...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header: DESHA + greeting */}
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-end">
        <Desha expression={active ? "thinking" : "idle"} size="md" />
        <div className="w-full flex-1">
          <DeshaSays text={greeting} />
        </div>
      </div>

      {/* Level / XP */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-5">
        <XPBar xp={profile.xp} />
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Stat icon={<Gem className="text-accent" size={18} />} label="النقاط" value={profile.points} />
          <Stat icon={<Flame className="text-gold" size={18} />} label="الستريك" value={profile.current_streak} />
          <Stat icon={<Swords className="text-primary-glow" size={18} />} label="انتصارات" value={profile.total_completed} />
        </div>
      </motion.div>

      {/* Active challenge or CTA */}
      {active ? (
        <Link to="/challenge/active" className="block">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="glass glow rounded-3xl border-primary/40 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-primary-glow">{STATUS_LABELS[active.status]}</p>
                <h2 className="font-display mt-1 text-xl font-bold">{active.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{formatDuration(active.duration_minutes)}</p>
              </div>
              <span className="text-3xl">⚔️</span>
            </div>
          </motion.div>
        </Link>
      ) : (
        <Link to="/challenge/new" className="block">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="gradient-magic glow-strong rounded-3xl p-6 text-center"
          >
            <p className="font-display text-2xl font-bold text-primary-foreground">ابدأ تحدي جديد ⚔️</p>
            <p className="mt-1 text-sm text-primary-foreground/80">وريني إنت جدع ولا لأ</p>
          </motion.div>
        </Link>
      )}

      {/* Daily reward */}
      <div className="glass rounded-3xl p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Gift className="text-gold" size={22} />
            <div>
              <p className="font-bold">الهدية اليومية</p>
              <p className="text-xs text-muted-foreground">
                {dailyAvailable ? desha.dailyReady() : desha.dailyClaimed()}
              </p>
            </div>
          </div>
          <button
            onClick={() => claimDaily.mutate()}
            disabled={!dailyAvailable || claimDaily.isPending}
            className="rounded-xl bg-gold/20 px-4 py-2 text-sm font-bold text-gold transition-opacity disabled:opacity-40"
          >
            {claimDaily.isPending ? "..." : dailyAvailable ? "استلم 🎁" : "اتاخد ✓"}
          </button>
        </div>
        {dailyMsg && <p className="mt-3 text-sm font-semibold text-primary-glow">{dailyMsg}</p>}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-muted/40 px-2 py-3">
      <div className="flex items-center justify-center gap-1.5">{icon}<span className="font-display text-xl font-bold tabular-nums">{value}</span></div>
      <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}
