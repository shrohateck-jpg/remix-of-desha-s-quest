import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MagicBackground } from "@/components/game/MagicBackground";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLang } from "@/contexts/LangContext";

export const Route = createFileRoute("/login")({
  ssr: false,
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const { tr, dir } = useLang();
  const isRtl = dir === "rtl";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If the user is already logged in, send them home
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.navigate({ to: "/home", replace: true });
    });
  }, [router]);

  const callbackUrl = `${window.location.origin}/auth/callback`;

  const signInEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(
        err.message.toLowerCase().includes("invalid") ||
        err.message.toLowerCase().includes("credentials")
          ? tr.auth_error_credentials
          : tr.auth_error_generic,
      );
      setLoading(false);
    } else {
      router.navigate({ to: "/home" });
    }
  };

  const signInGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
    if (err) {
      setError(tr.auth_error_generic);
      setGoogleLoading(false);
    }
    // On success Supabase redirects the browser — no further action needed
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-10" dir={dir}>
      <MagicBackground />

      {/* Top bar */}
      <div className="absolute inset-x-6 top-5 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <BackIcon size={16} />
          {tr.auth_back}
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="glass-strong w-full max-w-sm rounded-3xl p-8"
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-bold text-glow">{tr.auth_sign_in_title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{tr.landing_subtitle}</p>
        </div>

        {/* Google */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={signInGoogle}
          disabled={googleLoading || loading}
          className="gradient-magic glow mb-5 flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-3.5 font-bold text-primary-foreground transition-opacity disabled:opacity-60"
        >
          <GoogleIcon />
          {googleLoading ? tr.common_loading + "..." : tr.auth_google}
        </motion.button>

        {/* Divider */}
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold text-muted-foreground">{tr.auth_or}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Email form */}
        <form onSubmit={signInEmail} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{tr.auth_email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="auth-input"
              placeholder="you@example.com"
              dir="ltr"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{tr.auth_password}</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="auth-input pe-10"
                placeholder="••••••••"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute inset-y-0 end-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-destructive/15 px-3 py-2 text-sm font-semibold text-destructive"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-2xl bg-muted/60 py-3 text-sm font-bold text-foreground transition-all hover:bg-muted disabled:opacity-50"
          >
            {loading ? tr.common_loading + "..." : tr.auth_sign_in_btn}
          </motion.button>
        </form>

        {/* Switch to signup */}
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {tr.auth_no_account}{" "}
          <Link to="/signup" className="font-bold text-primary-glow hover:underline">
            {tr.landing_sign_up}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M21.35 11.1H12v2.9h5.35c-.25 1.4-1.02 2.58-2.17 3.38v2.8h3.5c2.05-1.9 3.23-4.7 3.23-8 0-.37-.02-.72-.06-1.08z" opacity=".9" />
      <path fill="currentColor" d="M12 22c2.7 0 4.97-.9 6.63-2.42l-3.5-2.8c-.9.6-2.05.97-3.13.97-2.4 0-4.44-1.62-5.17-3.8H3.2v2.88C4.85 19.98 8.16 22 12 22z" opacity=".7" />
      <path fill="currentColor" d="M6.83 13.95A5.97 5.97 0 0 1 6.5 12c0-.68.12-1.33.33-1.95V7.17H3.2A9.97 9.97 0 0 0 2 12c0 1.6.38 3.13 1.2 4.83l3.63-2.88z" opacity=".5" />
      <path fill="currentColor" d="M12 6.25c1.47 0 2.78.5 3.82 1.5l2.86-2.87C16.96 3.3 14.7 2.25 12 2.25 8.16 2.25 4.85 4.27 3.2 7.17l3.63 2.88C7.56 7.87 9.6 6.25 12 6.25z" opacity=".8" />
    </svg>
  );
}
