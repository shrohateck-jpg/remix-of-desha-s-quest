import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Desha } from "@/components/game/Desha";
import { DeshaSays } from "@/components/game/DeshaSays";

export const Route = createFileRoute("/_authenticated/how-to-play")({
  head: () => ({
    meta: [{ title: "إزاي ألعب؟ — ديشا" }, { name: "description", content: "قواعد اللعبة مع ديشا." }],
  }),
  component: HowToPlayPage,
});

const STEPS = [
  { emoji: "⚔️", title: "ابدأ تحدي", body: "اكتب هتعمل إيه وحدد الوقت. من ساعتها العداد بيمشي — وأنا بحسبه من السيرفر، مش من موبايلك، فبلاش ألاعيب." },
  { emoji: "⏳", title: "اشتغل بجد", body: "التايمر شغال. خلص اللي وعدت بيه قبل ما الوقت يخلص." },
  { emoji: "📸", title: "صوّر الدليل", body: "خلصت؟ صوّر حاجة تثبت — الكراسة، الشاشة، الجيم، أي حاجة توريني إنك عملتها فعلاً." },
  { emoji: "🔮", title: "أنا بحكم", body: "ببص على الصورة بعيني السحرية وبقارنها بالتحدي. لو مقنعة تكسب، لو لأ... معلش 💀" },
  { emoji: "⭐", title: "اكسب XP ونقاط", body: "كل انتصار بيديك XP ونقاط ومستويات. والخسارة بتاخد منك نقاط. اللعبة لعبة جد." },
  { emoji: "🔥", title: "حافظ على الستريك", body: "اكسب كل يوم والستريك يكبر. يوم من غير فوز؟ الستريك بيموت. وأنا بضحك." },
];

const RULES = [
  "تحدي واحد بس في نفس الوقت.",
  "الصور المكررة بكشفها — عندي ذاكرة فيل 😈",
  "إلغاء التحدي فيه عقوبة 5 نقط.",
  "لو الصورة مش واضحة هطلب واحدة أحسن، مش هرفضك على طول.",
  "الهدية اليومية مرة واحدة في اليوم... متطمعش.",
];

function HowToPlayPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-end">
        <Desha expression="idle" size="md" />
        <div className="w-full flex-1">
          <DeshaSays text="تعالى أشرحلك اللعبة... ركز معايا عشان مش هعيد 😂" />
        </div>
      </div>

      <div className="space-y-3">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass flex items-start gap-4 rounded-2xl p-4"
          >
            <span className="text-3xl">{s.emoji}</span>
            <div>
              <h2 className="font-bold">{s.title}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{s.body}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-3xl p-5">
        <h2 className="font-display text-lg font-bold text-primary-glow">قوانين ديشا 📜</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {RULES.map((r) => (
            <li key={r} className="flex items-start gap-2">
              <span className="text-primary-glow">✦</span> {r}
            </li>
          ))}
        </ul>
      </div>

      <Link
        to="/challenge/new"
        className="gradient-magic glow-strong block rounded-2xl py-4 text-center text-lg font-bold text-primary-foreground"
      >
        فهمت... يلا نلعب ⚔️
      </Link>
    </div>
  );
}
