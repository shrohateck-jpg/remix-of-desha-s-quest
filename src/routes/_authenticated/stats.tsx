import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Skull, Percent, Clock, Flame, Star } from "lucide-react";
import { profileQuery, historyQuery } from "@/lib/queries";
import { formatDuration } from "@/lib/game";
import { XPBar } from "@/components/game/XPBar";

export const Route = createFileRoute("/_authenticated/stats")({
  head: () => ({
    meta: [{ title: "الإحصائيات — ديشا" }, { name: "description", content: "أرقامك كلها في مكان واحد." }],
  }),
  component: StatsPage,
});

function StatsPage() {
  const { data: profile } = useQuery(profileQuery);
  const { data: history } = useQuery(historyQuery);

  if (!profile) return <p className="py-16 text-center text-muted-foreground">ثانية...</p>;

  const total = profile.total_completed + profile.total_failed;
  const winRate = total > 0 ? Math.round((profile.total_completed / total) * 100) : 0;
  const minutesWon = (history ?? [])
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + c.duration_minutes, 0);

  const cards = [
    { icon: Trophy, label: "انتصارات", value: String(profile.total_completed), color: "text-success" },
    { icon: Skull, label: "هزايم", value: String(profile.total_failed), color: "text-destructive" },
    { icon: Percent, label: "نسبة الفوز", value: `${winRate}%`, color: "text-accent" },
    { icon: Clock, label: "وقت منجز", value: minutesWon ? formatDuration(minutesWon) : "0", color: "text-primary-glow" },
    { icon: Flame, label: "أطول ستريك", value: String(profile.longest_streak), color: "text-gold" },
    { icon: Star, label: "إجمالي XP", value: String(profile.xp), color: "text-primary-glow" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-glow">أرقامك 📊</h1>

      <div className="glass rounded-3xl p-5">
        <XPBar xp={profile.xp} />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass rounded-2xl p-4 text-center"
          >
            <c.icon className={`mx-auto ${c.color}`} size={22} />
            <p className="font-display mt-2 text-2xl font-bold tabular-nums">{c.value}</p>
            <p className="text-xs font-semibold text-muted-foreground">{c.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-3xl p-5 text-center">
        <p className="text-sm text-muted-foreground">رصيد النقاط الحالي</p>
        <p className="font-display mt-1 text-4xl font-bold tabular-nums text-glow">{profile.points} 💎</p>
      </div>
    </div>
  );
}
