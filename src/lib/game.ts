// DESHA shared game constants + dialogue (Egyptian Arabic only)

export const LEVEL_XP_BASE = 50;

/** Must mirror public.level_for_xp in the database */
export function levelForXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(xp, 0) / LEVEL_XP_BASE)) + 1;
}

/** XP at which `level` starts */
export function xpForLevel(level: number): number {
  return LEVEL_XP_BASE * (level - 1) * (level - 1);
}

export function levelProgress(xp: number): { level: number; current: number; needed: number; pct: number } {
  const level = levelForXp(xp);
  const start = xpForLevel(level);
  const end = xpForLevel(level + 1);
  const current = xp - start;
  const needed = end - start;
  return { level, current, needed, pct: Math.min(100, Math.round((current / needed) * 100)) };
}

export type ChallengeStatus = "running" | "waiting_proof" | "verifying" | "completed" | "failed" | "cancelled";

export const STATUS_LABELS: Record<ChallengeStatus, string> = {
  running: "شغّال دلوقتي",
  waiting_proof: "مستني الدليل",
  verifying: "بيتفحص",
  completed: "كسبت 😈",
  failed: "خسرت 💀",
  cancelled: "اتلغى",
};

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const desha = {
  greet: (name: string) =>
    pick([
      `أهلاً يا ${name} 😈 جاهز تثبتلي إنك مش كسول؟`,
      `${name}! رجعتلي تاني؟ يلا وريني همتك.`,
      `إيه يا ${name}... النهاردة هنشتغل ولا هنتفرج؟`,
    ]),
  noChallenge: () =>
    pick([
      "مفيش تحدي شغال... إيه يا عم الكسوف ده؟ 😂",
      "قاعد على الفاضي؟ يلا ابدأ تحدي بقى.",
      "أنا زهقت من الاستنى... اعمل حاجة!",
    ]),
  challengeRunning: () =>
    pick([
      "لسه؟ أنا مستني 👀",
      "شد حيلك... الوقت بيجري.",
      "ركّز يا بطل، متتلهيش.",
    ]),
  startChallenge: () =>
    pick([
      "يلا وريني هتعمل إيه 😈",
      "أهو كده اللعب! ابدأ بقى.",
      "حلو... بس الكلام سهل. نفّذ.",
    ]),
  scanning: () =>
    pick([
      "استنى... بفكر في الصورة 🔍",
      "همممم... خليني أبص كويس.",
      "لحظة واحدة... بحلل الدليل بتاعك.",
    ]),
  victory: () =>
    pick([
      "أهو كده يا بطل 😈 كسبت الجولة!",
      "برافو يا وحش! المرة دي أقنعتني.",
      "جامد يا نجم... خد الـ XP وكمّل.",
    ]),
  defeat: () =>
    pick([
      "المرة دي معرفتش تقنعني... جرب تاني 💀",
      "إنت فاكر هتضحك عليا؟ 😂 هات دليل أحسن.",
      "الصورة دي مش داخلة دماغي. حاول تاني.",
    ]),
  needMore: () =>
    pick([
      "حاسس إنك عملتها... بس محتاج دليل أوضح 🤨",
      "الصورة دي مش مقنعة كفاية. وريني صورة أوضح.",
      "قرّب الكاميرا شوية وصوّر تاني.",
    ]),
  levelUp: () =>
    pick([
      "واااو 😈 بقيت أقوى! مستوى جديد!",
      "ليفل أب يا وحش! كمّل كده.",
    ]),
  dailyReady: () => "خد هديتك اليومية... ومتضيعهاش 😂",
  dailyClaimed: () => "خدت هديتك خلاص... ارجعلي بكرة 😈",
  emptyHistory: () => "مفيش تاريخ لسه... يعني لسه مبدأتش أصلاً 😂",
  streak: (n: number) => (n >= 3 ? `ستريك ${n} أيام؟ جامد أوي يا وحش 🔥` : "كمّل كل يوم عشان الستريك يكبر."),
};

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} دقيقة`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return h === 1 ? "ساعة" : h === 2 ? "ساعتين" : `${h} ساعات`;
  return `${h} س ${m} د`;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
