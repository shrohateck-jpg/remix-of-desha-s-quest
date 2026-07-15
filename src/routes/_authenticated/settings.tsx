import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bell, ChevronLeft, FileText, Info, Languages, Laptop, LogOut, Moon, Music, Shield, Sun, Trash2, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { deleteAccount } from "@/lib/game.functions";
import { useLang } from "@/contexts/LangContext";
import { useTheme, type Theme } from "@/contexts/ThemeContext";
import { useAudio } from "@/contexts/AudioContext";
import { LANGUAGES } from "@/i18n/translations";
import { LanguageSelector } from "@/components/ui/LanguageSelector";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "الإعدادات — ديشا" }] }),
  component: SettingsPage,
});

function PreferenceSwitch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return <button type="button" onClick={onToggle} className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`} role="switch" aria-checked={on} aria-label={label}><motion.span className="absolute top-1 size-5 rounded-full bg-card shadow" animate={{ insetInlineStart: on ? 24 : 4 }} transition={{ type: "spring", stiffness: 500, damping: 35 }} /></button>;
}

function SettingsPage() {
  const router = useRouter();
  const { tr, dir, lang } = useLang();
  const { theme, setTheme } = useTheme();
  const { soundEnabled, musicEnabled, toggleSound, toggleMusic } = useAudio();
  const deleteFn = useServerFn(deleteAccount);
  const [notifications, setNotifications] = useState(() => localStorage.getItem("desha_notifications") !== "off");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isArabic = dir === "rtl";

  const signOut = async () => { await supabase.auth.signOut(); router.navigate({ to: "/" }); };
  const del = useMutation({
    mutationFn: () => deleteFn({}),
    onSuccess: async () => { await supabase.auth.signOut(); router.navigate({ to: "/" }); },
    onError: (e: Error) => setError(e.message || tr.common_error),
  });
  const setNotificationsPreference = () => {
    setNotifications((current) => { const next = !current; localStorage.setItem("desha_notifications", next ? "on" : "off"); return next; });
  };

  const themes: Array<{ value: Theme; label: string; icon: typeof Moon }> = [
    { value: "light", label: tr.settings_theme_light, icon: Sun },
    { value: "dark", label: tr.settings_theme_dark, icon: Moon },
    { value: "system", label: isArabic ? "النظام" : "System", icon: Laptop },
  ];
  const currentLanguage = LANGUAGES.find((item) => item.code === lang);

  return (
    <div className="flex flex-col gap-6" dir={dir}>
      <div><p className="text-sm font-bold text-primary-glow">DESHA</p><h1 className="font-display mt-1 text-4xl font-black tracking-tight">{tr.settings_title}</h1><p className="mt-2 text-sm text-muted-foreground">{isArabic ? "خصص تجربتك بالطريقة اللي تناسبك." : "Personalize your challenge experience."}</p></div>

      <section className="glass rounded-3xl p-5 md:p-6">
        <div className="flex items-center gap-3"><Languages size={20} className="text-primary-glow" /><div className="flex-1"><h2 className="font-bold">{tr.settings_language}</h2><p className="text-sm text-muted-foreground">{currentLanguage?.nativeName}</p></div><LanguageSelector /></div>
      </section>

      <section className="glass rounded-3xl p-5 md:p-6">
        <h2 className="font-bold">{tr.settings_theme}</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {themes.map(({ value, label, icon: Icon }) => <button key={value} onClick={() => setTheme(value)} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border text-sm font-bold transition-all ${theme === value ? "border-primary bg-primary text-primary-foreground shadow-lg" : "border-border bg-muted/45 text-muted-foreground hover:text-foreground"}`}><Icon size={19} />{label}</button>)}
        </div>
      </section>

      <section className="glass flex flex-col gap-1 rounded-3xl p-3">
        <SettingRow icon={Volume2} title={tr.settings_sound} description={isArabic ? "تأثيرات الفوز والعداد" : "Victory and timer effects"}><PreferenceSwitch on={soundEnabled} onToggle={toggleSound} label={tr.settings_sound} /></SettingRow>
        <SettingRow icon={Music} title={tr.settings_music} description={isArabic ? "موسيقى خلفية أثناء التحدي" : "Background challenge music"}><PreferenceSwitch on={musicEnabled} onToggle={toggleMusic} label={tr.settings_music} /></SettingRow>
        <SettingRow icon={Bell} title={isArabic ? "التنبيهات" : "Notifications"} description={isArabic ? "تذكيرات محلية بالتحديات" : "Local challenge reminders"}><PreferenceSwitch on={notifications} onToggle={setNotificationsPreference} label="Notifications" /></SettingRow>
      </section>

      <section className="glass flex flex-col gap-1 rounded-3xl p-3">
        <SettingsLink to="/privacy" icon={Shield} title={isArabic ? "سياسة الخصوصية" : "Privacy Policy"} />
        <SettingsLink to="/terms" icon={FileText} title={isArabic ? "الشروط والأحكام" : "Terms of Use"} />
        <SettingRow icon={Info} title={isArabic ? "عن ديشا" : "About DESHA"} description="Version 1.0"><span className="text-xs font-bold text-muted-foreground">2026</span></SettingRow>
      </section>

      <section className="glass rounded-3xl p-5 md:p-6">
        <h2 className="font-bold">{tr.settings_account}</h2><p className="mt-1 text-sm text-muted-foreground">{tr.settings_signed_in_google}</p>
        <button onClick={signOut} className="mt-4 flex min-h-11 items-center gap-2 rounded-2xl bg-muted px-4 text-sm font-bold hover:bg-secondary"><LogOut size={17} />{tr.settings_sign_out}</button>
      </section>

      <section className="rounded-3xl border border-destructive/35 bg-destructive/5 p-5 md:p-6">
        <h2 className="font-bold text-destructive">{tr.settings_danger}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{tr.settings_delete_warning}</p>
        <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={tr.settings_delete_placeholder} className="mt-4 min-h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-destructive" />
        <button onClick={() => del.mutate()} disabled={confirmText.trim() !== tr.settings_delete_confirm_word || del.isPending} className="mt-3 flex min-h-11 items-center gap-2 rounded-2xl bg-destructive px-4 text-sm font-bold text-destructive-foreground disabled:opacity-40"><Trash2 size={17} />{del.isPending ? tr.settings_deleting : tr.settings_delete_btn}</button>
        {error && <p className="mt-3 text-sm font-bold text-destructive">{error}</p>}
      </section>
    </div>
  );
}

function SettingRow({ icon: Icon, title, description, children }: { icon: typeof Bell; title: string; description: string; children: React.ReactNode }) {
  return <div className="flex min-h-16 items-center gap-3 rounded-2xl px-3 hover:bg-muted/45"><span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary-glow"><Icon size={18} /></span><div className="min-w-0 flex-1"><h3 className="text-sm font-bold">{title}</h3><p className="truncate text-xs text-muted-foreground">{description}</p></div>{children}</div>;
}

function SettingsLink({ to, icon: Icon, title }: { to: "/privacy" | "/terms"; icon: typeof Shield; title: string }) {
  return <Link to={to} className="flex min-h-16 items-center gap-3 rounded-2xl px-3 hover:bg-muted/45"><span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary-glow"><Icon size={18} /></span><span className="flex-1 text-sm font-bold">{title}</span><ChevronLeft size={17} className="text-muted-foreground rtl:rotate-180" /></Link>;
}
