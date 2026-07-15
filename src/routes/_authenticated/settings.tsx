import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LogOut, Trash2, Moon, Sun, Volume2, VolumeX, Music, Music2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { deleteAccount } from "@/lib/game.functions";
import { useLang } from "@/contexts/LangContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAudio } from "@/contexts/AudioContext";
import { LANGUAGES } from "@/i18n/translations";
import { LanguageSelector } from "@/components/ui/LanguageSelector";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "الإعدادات — ديشا" }] }),
  component: SettingsPage,
});

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}
      role="switch"
      aria-checked={on}
    >
      <motion.span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />
    </button>
  );
}

function SettingsPage() {
  const router = useRouter();
  const { tr, dir } = useLang();
  const { theme, setTheme } = useTheme();
  const { soundEnabled, musicEnabled, toggleSound, toggleMusic } = useAudio();
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
    onError: (e: Error) => setError(e.message || tr.common_error),
  });

  const cards = [
    {
      title: tr.settings_account,
      content: (
        <div>
          <p className="text-sm text-muted-foreground">{tr.settings_signed_in_google}</p>
          <button
            onClick={signOut}
            className="mt-4 flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-muted"
          >
            <LogOut size={16} /> {tr.settings_sign_out}
          </button>
        </div>
      ),
    },
    {
      title: tr.settings_language,
      content: (
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <span className="text-sm text-muted-foreground">
            {LANGUAGES.find((l) => l.code === (dir === "rtl" ? "ar-eg" : "en"))?.nativeName}
          </span>
        </div>
      ),
    },
    {
      title: tr.settings_theme,
      content: (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-all ${theme === "dark" ? "gradient-magic text-primary-foreground" : "bg-muted/40 text-muted-foreground"}`}
          >
            <Moon size={15} /> {tr.settings_theme_dark}
          </button>
          <button
            onClick={() => setTheme("light")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-all ${theme === "light" ? "gradient-magic text-primary-foreground" : "bg-muted/40 text-muted-foreground"}`}
          >
            <Sun size={15} /> {tr.settings_theme_light}
          </button>
        </div>
      ),
    },
    {
      title: null,
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-muted-foreground" />}
              {tr.settings_sound}
            </div>
            <Toggle on={soundEnabled} onToggle={toggleSound} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              {musicEnabled ? <Music size={16} /> : <Music2 size={16} className="text-muted-foreground" />}
              {tr.settings_music}
            </div>
            <Toggle on={musicEnabled} onToggle={toggleMusic} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5" dir={dir}>
      <h1 className="font-display text-3xl font-bold text-glow">{tr.settings_title} ⚙️</h1>

      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="glass rounded-3xl p-5"
        >
          {card.title && <h2 className="mb-3 font-bold">{card.title}</h2>}
          {card.content}
        </motion.div>
      ))}

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-3xl border border-destructive/30 p-5"
      >
        <h2 className="font-bold text-destructive">{tr.settings_danger}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{tr.settings_delete_warning}</p>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={tr.settings_delete_placeholder}
          className="mt-4 w-full rounded-xl border border-input bg-muted/40 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-destructive"
          dir="rtl"
        />
        <button
          onClick={() => del.mutate()}
          disabled={confirmText.trim() !== tr.settings_delete_confirm_word || del.isPending}
          className="mt-3 flex items-center gap-2 rounded-xl bg-destructive/15 px-4 py-2.5 text-sm font-bold text-destructive transition-opacity disabled:opacity-40"
        >
          <Trash2 size={16} /> {del.isPending ? tr.settings_deleting : tr.settings_delete_btn}
        </button>
        {error && <p className="mt-3 text-sm font-bold text-destructive">{error}</p>}
      </motion.div>
    </div>
  );
}
