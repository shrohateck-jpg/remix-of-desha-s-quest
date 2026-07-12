import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ImagePlus, RefreshCw, XCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { activeChallengeQuery } from "@/lib/queries";
import { verifyProof } from "@/lib/game.functions";
import { desha } from "@/lib/game";
import { Desha } from "@/components/game/Desha";
import { DeshaSays } from "@/components/game/DeshaSays";
import { Countdown } from "@/components/game/Countdown";

export const Route = createFileRoute("/_authenticated/challenge/active")({
  head: () => ({
    meta: [{ title: "التحدي الشغال — ديشا" }, { name: "description", content: "تابع تحديك وارفع الدليل." }],
  }),
  component: ActiveChallengePage,
});

type Phase = "idle" | "uploading" | "scanning" | "done";

interface VerifyResult {
  decision: "accepted" | "rejected" | "needs_more_evidence";
  confidence: number;
  reason: string;
  deshaComment: string;
  challenge: { xp_reward: number; points_delta: number };
}

async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const max = 1280;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.82),
  );
}

async function sha256Hex(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function ActiveChallengePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: challenge, isLoading } = useQuery(activeChallengeQuery);
  const verify = useServerFn(verifyProof);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cancel = useMutation({
    mutationFn: async () => {
      const { error: e } = await supabase.rpc("cancel_active_challenge");
      if (e) throw e;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.navigate({ to: "/home" });
    },
  });

  const pickFile = (f: File | null) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setError(null);
    const url = URL.createObjectURL(f);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return url;
    });
  };

  const submitProof = async () => {
    if (!file || !challenge) return;
    setError(null);
    setPhase("uploading");
    try {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id;
      if (!uid) throw new Error("no_session");

      const blob = await compressImage(file);
      const hash = await sha256Hex(blob);
      const path = `${uid}/${challenge.id}-${Date.now()}.jpg`;

      const { error: upErr } = await supabase.storage.from("proofs").upload(path, blob, {
        contentType: "image/jpeg",
      });
      if (upErr) throw upErr;

      setPhase("scanning");
      const minDelay = new Promise((r) => setTimeout(r, 3500));
      const [res] = await Promise.all([
        verify({ data: { challengeId: challenge.id, proofPath: path, proofHash: hash } }),
        minDelay,
      ]);

      setResult(res as VerifyResult);
      setPhase("done");
      queryClient.invalidateQueries({ queryKey: ["challenge"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (e) {
      setPhase("idle");
      setError(e instanceof Error && e.message && !e.message.includes("no_session") ? e.message : "حصلت مشكلة... جرب تاني.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-20">
        <Desha expression="thinking" size="md" />
      </div>
    );
  }

  // Result screen (victory / defeat / needs more)
  if (phase === "done" && result) {
    return <ResultScreen result={result} onRetry={() => { setPhase("idle"); setResult(null); setFile(null); setPreview(null); }} />;
  }

  // Scanning cinematic
  if (phase === "scanning" || phase === "uploading") {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="relative">
          <div className="absolute -inset-6 rounded-full border-2 border-dashed border-primary/50 animate-ring-spin" aria-hidden />
          <Desha expression="thinking" size="lg" />
        </div>
        <DeshaSays text={phase === "uploading" ? "بنبعت الصورة..." : desha.scanning()} className="max-w-md" />
        {preview && (
          <div className="relative w-56 overflow-hidden rounded-2xl border border-primary/40 glow">
            <img src={preview} alt="الدليل" className="w-full opacity-80" />
            <div className="absolute inset-x-0 h-1 bg-primary-glow/80 blur-[2px] animate-scan" aria-hidden />
          </div>
        )}
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Desha expression="disappointed" size="md" />
        <DeshaSays text={desha.noChallenge()} className="max-w-md" />
        <Link to="/challenge/new" className="gradient-magic glow mt-2 rounded-2xl px-6 py-3 font-bold text-primary-foreground">
          ابدأ تحدي ⚔️
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 text-center">
        <h1 className="font-display text-2xl font-bold">{challenge.title}</h1>
        {challenge.description && <p className="mt-1 text-sm text-muted-foreground">{challenge.description}</p>}
        <div className="mt-6">
          <Countdown endsAt={challenge.ends_at} />
        </div>
      </motion.div>

      <div className="flex flex-col items-center gap-4 md:flex-row md:items-end">
        <Desha expression="thinking" size="sm" />
        <div className="w-full flex-1">
          <DeshaSays text="خلصت؟ صوّر الدليل وارفعه هنا. وبلاش صور قديمة، أنا حافظهم كلهم 😈" speed={20} />
        </div>
      </div>

      {/* Proof uploader */}
      <div
        className="glass rounded-3xl border-2 border-dashed border-primary/30 p-6 text-center transition-colors hover:border-primary/60"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pickFile(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <img src={preview} alt="معاينة الدليل" className="mx-auto max-h-72 rounded-2xl border border-border" />
              <div className="flex justify-center gap-3">
                <button
                  onClick={submitProof}
                  className="gradient-magic glow-strong rounded-2xl px-8 py-3 font-bold text-primary-foreground"
                >
                  ابعت لديشا 🔮
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded-2xl bg-muted/50 px-5 py-3 text-sm font-bold text-muted-foreground"
                >
                  <RefreshCw size={16} /> غيّر الصورة
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-3 py-8"
            >
              <div className="flex gap-4 text-primary-glow">
                <Camera size={34} />
                <ImagePlus size={34} />
              </div>
              <p className="font-bold">صوّر أو ارفع صورة الدليل</p>
              <p className="text-xs text-muted-foreground">اسحب الصورة هنا أو دوس للاختيار</p>
            </motion.button>
          )}
        </AnimatePresence>
        {error && <p className="mt-4 text-sm font-bold text-destructive">{error}</p>}
      </div>

      <button
        onClick={() => {
          if (window.confirm("متأكد إنك عايز تلغي؟ هتخسر 5 نقط 💀")) cancel.mutate();
        }}
        disabled={cancel.isPending}
        className="mx-auto flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-destructive"
      >
        <XCircle size={16} />
        إلغاء التحدي (فيه عقوبة!)
      </button>
    </div>
  );
}

function ResultScreen({ result, onRetry }: { result: VerifyResult; onRetry: () => void }) {
  const won = result.decision === "accepted";
  const needsMore = result.decision === "needs_more_evidence";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 16 }}
      className="flex flex-col items-center gap-5 py-10 text-center"
    >
      <Desha expression={won ? "celebrating" : needsMore ? "thinking" : "disappointed"} size="xl" />

      <h1
        className={`font-display text-4xl font-bold ${
          won ? "text-success" : needsMore ? "text-gold" : "text-destructive"
        } text-glow`}
      >
        {won ? "انتصااار! 😈🎉" : needsMore ? "محتاج دليل أوضح 🤨" : "خسرت الجولة 💀"}
      </h1>

      <DeshaSays text={result.deshaComment} className="max-w-md" />
      <p className="max-w-md text-sm text-muted-foreground">{result.reason}</p>

      <div className="glass flex items-center gap-6 rounded-2xl px-8 py-4">
        <div>
          <p className="font-display text-2xl font-bold tabular-nums text-primary-glow">
            {won ? `+${result.challenge.xp_reward}` : "0"}
          </p>
          <p className="text-xs text-muted-foreground">XP</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p
            className={`font-display text-2xl font-bold tabular-nums ${
              result.challenge.points_delta >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {result.challenge.points_delta >= 0 ? `+${result.challenge.points_delta}` : result.challenge.points_delta}
          </p>
          <p className="text-xs text-muted-foreground">نقاط</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="font-display text-2xl font-bold tabular-nums text-accent">{result.confidence}%</p>
          <p className="text-xs text-muted-foreground">ثقة ديشا</p>
        </div>
      </div>

      {needsMore ? (
        <button onClick={onRetry} className="gradient-magic glow-strong rounded-2xl px-8 py-3.5 font-bold text-primary-foreground">
          ارفع صورة تانية 📸
        </button>
      ) : (
        <div className="flex gap-3">
          <Link to="/challenge/new" className="gradient-magic glow-strong rounded-2xl px-6 py-3.5 font-bold text-primary-foreground">
            تحدي جديد ⚔️
          </Link>
          <Link to="/home" className="glass rounded-2xl px-6 py-3.5 font-bold text-muted-foreground">
            الرئيسية
          </Link>
        </div>
      )}
    </motion.div>
  );
}
