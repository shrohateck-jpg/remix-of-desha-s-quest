import { useEffect, useState } from "react";
import { formatClock } from "@/lib/game";

/**
 * Server-truth countdown: computes remaining time from the DB `ends_at`
 * timestamp on every tick. Never trusts a client-side timer state.
 */
export function Countdown({ endsAt }: { endsAt: string }) {
  const [, force] = useState(0);

  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000);
  const overtime = remaining < 0;

  return (
    <div className="text-center" dir="rtl">
      <div
        className={`font-display text-6xl font-bold tabular-nums tracking-wider md:text-7xl ${
          overtime ? "text-destructive" : "text-glow"
        }`}
      >
        {formatClock(Math.abs(remaining))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {overtime ? "الوقت خلص! ارفع الدليل بسرعة 😤" : "الوقت المتبقي"}
      </p>
    </div>
  );
}
