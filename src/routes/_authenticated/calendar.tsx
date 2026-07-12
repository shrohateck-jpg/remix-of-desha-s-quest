import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { historyQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [{ title: "التقويم — ديشا" }, { name: "description", content: "أيام انتصاراتك وهزايمك." }],
  }),
  component: CalendarPage,
});

const WEEKDAYS = ["أحد", "اتنين", "تلات", "أربع", "خميس", "جمعة", "سبت"];

function CalendarPage() {
  const { data: history } = useQuery(historyQuery);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const byDay = new Map<string, { wins: number; losses: number }>();
  for (const c of history ?? []) {
    const key = (c.completed_at ?? c.created_at).slice(0, 10);
    const entry = byDay.get(key) ?? { wins: 0, losses: 0 };
    if (c.status === "completed") entry.wins++;
    else if (c.status === "failed") entry.losses++;
    byDay.set(key, entry);
  }

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = new Date().toISOString().slice(0, 10);

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-glow">تقويم المعارك 🗓️</h1>

      <div className="glass rounded-3xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="rounded-xl bg-muted/50 p-2 transition-colors hover:bg-muted"
            aria-label="الشهر اللي فات"
          >
            <ChevronRight size={18} />
          </button>
          <h2 className="font-display text-lg font-bold">
            {cursor.toLocaleDateString("ar-EG", { month: "long", year: "numeric" })}
          </h2>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="rounded-xl bg-muted/50 p-2 transition-colors hover:bg-muted"
            aria-label="الشهر الجاي"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {WEEKDAYS.map((d) => (
            <div key={d} className="pb-1 text-[11px] font-bold text-muted-foreground">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`e${i}`} />;
            const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const entry = byDay.get(key);
            const isToday = key === todayKey;
            return (
              <div
                key={key}
                className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                  entry?.wins
                    ? "bg-success/20 text-success glow"
                    : entry?.losses
                      ? "bg-destructive/15 text-destructive"
                      : "bg-muted/30 text-muted-foreground"
                } ${isToday ? "ring-2 ring-primary-glow" : ""}`}
              >
                <span className="tabular-nums">{day}</span>
                {entry && (
                  <span className="text-[9px]">
                    {entry.wins > 0 && `⚔️${entry.wins}`}
                    {entry.losses > 0 && `💀${entry.losses}`}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-center gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-success/40" /> يوم انتصار
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-destructive/30" /> يوم خسارة
          </span>
        </div>
      </div>
    </div>
  );
}
