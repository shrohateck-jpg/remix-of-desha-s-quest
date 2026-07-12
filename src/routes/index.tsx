import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { Desha } from "@/components/game/Desha";
import { DeshaSays } from "@/components/game/DeshaSays";
import { MagicBackground } from "@/components/game/MagicBackground";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ديشا — لعبة الإنتاجية الشريرة 😈" },
      { name: "description", content: "حوّل مهامك لتحديات، وخلي ديشا يحكم عليك بالصور. اكسب XP ونقاط وستريكات — أو اخسر قدامه." },
      { property: "og:title", content: "ديشا — لعبة الإنتاجية الشريرة 😈" },
      { property: "og:description", content: "حوّل مهامك لتحديات، وخلي ديشا يحكم عليك بالصور. اكسب XP ونقاط وستريكات — أو اخسر قدامه." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.navigate({ to: "/home" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") router.navigate({ to: "/home" });
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  const line = useMemo(
    () => "أهلاً... أنا ديشا 😈 هحوّل شغلك للعبة. بس خليني أقولك حاجة — أنا مش بصدق حد من غير دليل.",
    [],
  );

  const signIn = async () => {
    setLoading(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("حصلت مشكلة في تسجيل الدخول... جرب تاني.");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    router.navigate({ to: "/home" });
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12" dir="rtl">
      <MagicBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex w-full max-w-md flex-col items-center text-center"
      >
        <Desha expression="idle" size="xl" />

        <h1 className="font-display mt-6 text-5xl font-bold text-glow md:text-6xl">ديشا</h1>
        <p className="mt-2 text-lg font-semibold text-primary-glow">لعبة الإنتاجية الشريرة</p>

        <div className="mt-6 w-full">
          <DeshaSays text={line} />
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={signIn}
          disabled={loading}
          className="gradient-magic glow-strong mt-8 flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-lg font-bold text-primary-foreground transition-opacity disabled:opacity-60"
        >
          <GoogleIcon />
          {loading ? "ثانية واحدة..." : "ادخل بحساب جوجل"}
        </motion.button>

        {error && <p className="mt-3 text-sm font-semibold text-destructive">{error}</p>}

        <div className="mt-10 grid w-full grid-cols-3 gap-3 text-center">
          {[
            { emoji: "⚔️", label: "تحديات بوقت حقيقي" },
            { emoji: "📸", label: "إثبات بالصور" },
            { emoji: "🔥", label: "XP وستريكات" },
          ].map((f) => (
            <div key={f.label} className="glass rounded-2xl px-2 py-4">
              <div className="text-2xl">{f.emoji}</div>
              <div className="mt-1 text-xs font-semibold text-muted-foreground">{f.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M21.35 11.1H12v2.9h5.35c-.25 1.4-1.02 2.58-2.17 3.38v2.8h3.5c2.05-1.9 3.23-4.7 3.23-8 0-.37-.02-.72-.06-1.08z"
        opacity=".9"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 4.97-.9 6.63-2.42l-3.5-2.8c-.9.6-2.05.97-3.13.97-2.4 0-4.44-1.62-5.17-3.8H3.2v2.88C4.85 19.98 8.16 22 12 22z"
        opacity=".7"
      />
      <path
        fill="currentColor"
        d="M6.83 13.95A5.97 5.97 0 0 1 6.5 12c0-.68.12-1.33.33-1.95V7.17H3.2A9.97 9.97 0 0 0 2 12c0 1.6.38 3.13 1.2 4.83l3.63-2.88z"
        opacity=".5"
      />
      <path
        fill="currentColor"
        d="M12 6.25c1.47 0 2.78.5 3.82 1.5l2.86-2.87C16.96 3.3 14.7 2.25 12 2.25 8.16 2.25 4.85 4.27 3.2 7.17l3.63 2.88C7.56 7.87 9.6 6.25 12 6.25z"
        opacity=".8"
      />
    </svg>
  );
}
