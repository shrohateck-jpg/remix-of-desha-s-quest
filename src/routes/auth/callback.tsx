/**
 * /auth/callback
 * Handles the redirect from Google (or any Supabase OAuth provider).
 * Supabase sends back either:
 *  - PKCE: ?code=... in the query string → exchange for session
 *  - Implicit: #access_token=... in the hash → Supabase client auto-detects
 * After session is established, redirect to /home.
 */
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  component: AuthCallback,
});

function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let done = false;

    const redirect = () => {
      if (done) return;
      done = true;
      router.navigate({ to: "/home", replace: true });
    };

    async function handle() {
      // 1. PKCE — code in query string
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exchErr) {
          setError(exchErr.message);
          return;
        }
        redirect();
        return;
      }

      // 2. Implicit — access_token in hash (Supabase detects automatically)
      if (window.location.hash.includes("access_token")) {
        // Give the Supabase client a tick to parse the hash
        await new Promise((r) => setTimeout(r, 150));
        const { data } = await supabase.auth.getSession();
        if (data.session) { redirect(); return; }
      }

      // 3. Session might already exist (page reload)
      const { data } = await supabase.auth.getSession();
      if (data.session) { redirect(); return; }

      setError("لم يتم إنشاء جلسة. حاول مرة أخرى.");
    }

    handle();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-6" dir="rtl">
        <p className="text-destructive font-semibold">{error}</p>
        <a href="/login" className="text-primary-glow underline text-sm">← العودة لتسجيل الدخول</a>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background" dir="rtl">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">جاري تسجيل الدخول...</p>
    </div>
  );
}
