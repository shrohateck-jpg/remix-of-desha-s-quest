import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { deleteAccount } from "@/lib/game.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [{ title: "الإعدادات — ديشا" }, { name: "description", content: "إعدادات حسابك." }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const router = useRouter();
  const deleteFn = useServerFn(deleteAccount);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  const del = useMutation({
    mutationFn: () => deleteFn({}),
    onSuccess: async () => {
      await supabase.auth.signOut();
      router.navigate({ to: "/" });
    },
    onError: (e: Error) => setError(e.message || "حصلت مشكلة."),
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-glow">الإعدادات ⚙️</h1>

      <div className="glass rounded-3xl p-5">
        <h2 className="font-bold">الحساب</h2>
        <p className="mt-1 text-sm text-muted-foreground">إنت داخل بحساب جوجل.</p>
        <button
          onClick={signOut}
          className="mt-4 flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-muted"
        >
          <LogOut size={16} /> تسجيل خروج
        </button>
      </div>

      <div className="glass rounded-3xl border-destructive/30 p-5">
        <h2 className="font-bold text-destructive">منطقة الخطر 💀</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          مسح الحساب بيمسح كل حاجة — التحديات والنقاط والمستوى. مفيش رجوع.
        </p>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder='اكتب "امسح" للتأكيد'
          className="mt-4 w-full rounded-xl border border-input bg-muted/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-destructive"
        />
        <button
          onClick={() => del.mutate()}
          disabled={confirmText.trim() !== "امسح" || del.isPending}
          className="mt-3 flex items-center gap-2 rounded-xl bg-destructive/15 px-4 py-2.5 text-sm font-bold text-destructive transition-opacity disabled:opacity-40"
        >
          <Trash2 size={16} /> {del.isPending ? "بنمسح..." : "امسح حسابي نهائياً"}
        </button>
        {error && <p className="mt-3 text-sm font-bold text-destructive">{error}</p>}
      </div>
    </div>
  );
}
