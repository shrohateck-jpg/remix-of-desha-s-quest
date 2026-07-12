import { motion } from "framer-motion";
import { levelProgress } from "@/lib/game";

export function XPBar({ xp }: { xp: number }) {
  const { level, current, needed, pct } = levelProgress(xp);
  return (
    <div dir="rtl">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-display font-bold text-glow">
          المستوى <span className="text-primary-glow">{level}</span>
        </span>
        <span className="text-muted-foreground tabular-nums">
          {current} / {needed} XP
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full border border-border bg-muted/60">
        <motion.div
          className="h-full rounded-full gradient-magic glow"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 16 }}
        />
      </div>
    </div>
  );
}
