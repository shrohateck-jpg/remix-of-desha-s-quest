import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { profileQuery } from "@/lib/queries";
import { levelProgress, desha } from "@/lib/game";
import { Desha } from "@/components/game/Desha";
import { DeshaSays } from "@/components/game/DeshaSays";
import { XPBar } from "@/components/game/XPBar";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [{ title: "البروفايل — ديشا" }, { name: "description", content: "بياناتك ومستواك." }],
  }),
  component: ProfilePage,
});

const TITLES = [
  "مبتدئ نعسان 😴",
  "صاحي بالعافية ☕",
  "مقاتل ناشئ ⚔️",
  "محارب جدع 🛡️",
  "وحش الإنتاجية 😈",
  "أسطورة حية 👑",
];

function titleForLevel(level: number): string {
  return TITLES[Math.min(TITLES.length - 1, Math.floor((level - 1) / 3))];
}

function ProfilePage() {
  const { data: profile } = useQuery(profileQuery);
  if (!profile) return <p className="py-16 text-center text-muted-foreground">ثانية...</p>;

  const { level } = levelProgress(profile.xp);

  return (
    <div className="space-y-6">
      <div className="glass flex flex-col items-center gap-4 rounded-3xl p-8 text-center">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="h-24 w-24 rounded-full border-2 border-primary/50 glow"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="gradient-magic glow flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold">
            {profile.display_name.slice(0, 1)}
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold">{profile.display_name}</h1>
          <p className="mt-1 text-sm font-semibold text-primary-glow">{titleForLevel(level)}</p>
        </div>
        <div className="w-full max-w-sm">
          <XPBar xp={profile.xp} />
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="font-display text-xl font-bold tabular-nums text-gold">{profile.current_streak} 🔥</p>
            <p className="text-xs text-muted-foreground">ستريك حالي</p>
          </div>
          <div>
            <p className="font-display text-xl font-bold tabular-nums text-accent">{profile.points} 💎</p>
            <p className="text-xs text-muted-foreground">نقاط</p>
          </div>
          <div>
            <p className="font-display text-xl font-bold tabular-nums text-success">{profile.total_completed} ⚔️</p>
            <p className="text-xs text-muted-foreground">انتصارات</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 md:flex-row md:items-end">
        <Desha expression="idle" size="sm" />
        <div className="w-full flex-1">
          <DeshaSays text={desha.streak(profile.current_streak)} />
        </div>
      </div>
    </div>
  );
}
