import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { historyQuery } from "@/lib/queries";
import { desha, STATUS_LABELS, formatDuration, type ChallengeStatus } from "@/lib/game";
import { Desha } from "@/components/game/Desha";
import { DeshaSays } from "@/components/game/DeshaSays";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [{ title: "التاريخ — ديشا" }, { name: "description", content: "كل تحدياتك السابقة." }],
  }),
  component: HistoryPage,
});

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

function HistoryPage() {
  const { data: history, isLoading } = useQuery(historyQuery);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-glow">سجل المعارك 📜</h1>

      {isLoading ? (
        <p className="text-muted-foreground">بنجيب السجل...</p>
      ) : !history?.length ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Desha expression="disappointed" size="md" />
          <DeshaSays text={desha.emptyHistory()} className="max-w-md" />
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              className="glass rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-bold">{c.title}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString("ar-EG", { day: "numeric", month: "long" })} ·{" "}
                    {formatDuration(c.duration_minutes)}
                  </p>
                  {c.desha_comment && (
                    <p className="mt-2 text-xs text-primary-glow/90">「{c.desha_comment}」</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[c.status] ?? ""}`}>
                    {STATUS_LABELS[c.status as ChallengeStatus]}
                  </span>
                  {c.status === "completed" && (
                    <span className="text-xs font-bold tabular-nums text-primary-glow">+{c.xp_reward} XP</span>
                  )}
                  {c.points_delta !== 0 && (
                    <span
                      className={`text-xs font-bold tabular-nums ${c.points_delta > 0 ? "text-success" : "text-destructive"}`}
                    >
                      {c.points_delta > 0 ? `+${c.points_delta}` : c.points_delta} نقطة
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
