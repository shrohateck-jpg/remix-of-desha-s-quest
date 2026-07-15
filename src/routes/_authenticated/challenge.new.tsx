import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { activeChallengeQuery } from "@/lib/queries";
import { desha, formatDuration } from "@/lib/game";
import { Desha } from "@/components/game/Desha";
import { DeshaSays } from "@/components/game/DeshaSays";
import { useLang } from "@/contexts/LangContext";

export const Route = createFileRoute("/_authenticated/challenge/new")({
  head: () => ({
    meta: [{ title: "تحدي جديد — ديشا" }, { name: "description", content: "ابدأ تحدي جديد وحدد الوقت." }],
  }),
  component: NewChallengePage,
});

const DURATIONS = [15, 25, 45, 60, 90, 120, 180, 240];

function NewChallengePage() {
  const { tr, dir } = useLang();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: active } = useQuery(activeChallengeQuery);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState(25);
  const [error, setError] = useState<string | null>(null);

  const start = useMutation({
    mutationFn: async () => {
      const { data, error: rpcErr } = await supabase.rpc("start_challenge", {
        _title: title.trim(),
        _description: description.trim(),
        _notes: notes.trim(),
        _duration_minutes: duration,
      });
      if (rpcErr) throw rpcErr;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge"] });
      router.navigate({ to: "/challenge/active" });
    },
    onError: (e: Error) => {
      setError(
        e.message.includes("active_challenge_exists")
          ? "عندك تحدي شغال بالفعل! خلصه الأول 😤"
          : "حصلت مشكلة... جرب تاني.",
      );
    },
  });

  if (active) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Desha expression="thinking" size="md" />
        <DeshaSays text="إنت لسه في نص تحدي يا صاحبي! واحدة واحدة علينا 😂" className="max-w-md" />
        <button
          onClick={() => router.navigate({ to: "/challenge/active" })}
          className="gradient-magic glow mt-2 rounded-2xl px-6 py-3 font-bold text-primary-foreground"
        >
          روح للتحدي الشغال
        </button>
      </div>
    );
  }

  const valid = title.trim().length >= 3;

  return (
    <div className="flex flex-col gap-6" dir={dir}>
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-end">
        <Desha expression="idle" size="md" />
        <div className="w-full flex-1">
          <DeshaSays text="قولّي هتعمل إيه... وبلاش تحديات وهمية، أنا شايفك 👀" />
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass space-y-5 rounded-3xl p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid && !start.isPending) start.mutate();
        }}
      >
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-bold">{tr.challenge_what}</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder={tr.challenge_what_placeholder}
            className="w-full rounded-xl border border-input bg-muted/40 px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="desc" className="mb-1.5 block text-sm font-bold">تفاصيل أكتر (اختياري)</label>
          <textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="إيه بالظبط اللي هيثبت إنك عملته؟"
            className="w-full rounded-xl border border-input bg-muted/40 px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-bold">المدة قد إيه؟</span>
          <div className="grid grid-cols-4 gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`rounded-xl px-2 py-2.5 text-sm font-bold transition-all ${
                  duration === d
                    ? "gradient-magic glow text-primary-foreground"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {formatDuration(d)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="mb-1.5 block text-sm font-bold">ملاحظات لديشا (اختياري)</label>
          <input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={300}
            placeholder="حاجة تساعده يحكم صح على الصورة"
            className="w-full rounded-xl border border-input bg-muted/40 px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
          />
        </div>

        {error && <p className="text-sm font-bold text-destructive">{error}</p>}

        <motion.button
          whileHover={{ scale: valid ? 1.02 : 1 }}
          whileTap={{ scale: valid ? 0.98 : 1 }}
          type="submit"
          disabled={!valid || start.isPending}
          className="gradient-magic glow-strong w-full rounded-2xl py-4 text-lg font-bold text-primary-foreground transition-opacity disabled:opacity-40"
        >
          {start.isPending ? "بنجهز الساحة..." : "يلا بينا ⚔️"}
        </motion.button>
        <p className="text-center text-xs text-muted-foreground">{desha.startChallenge()}</p>
      </motion.form>
    </div>
  );
}
