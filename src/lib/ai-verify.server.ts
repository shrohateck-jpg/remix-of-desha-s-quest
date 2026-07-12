// DESHA — GPT-5.5 vision verification (server-only)
// All AI functionality runs exclusively on OpenAI GPT-5.5 via the secure gateway.

export interface VerdictInput {
  title: string;
  description: string | null;
  notes: string | null;
  durationMinutes: number;
  startedAt: string;
  endsAt: string;
  imageUrl: string;
  isDuplicate: boolean;
  previousAttempts: number;
}

export interface Verdict {
  decision: "accepted" | "rejected" | "needs_more_evidence";
  confidence: number;
  reason: string;
  deshaComment: string;
}

const SYSTEM_PROMPT = `أنت "ديشا" — كائن فانتازيا شرير الشكل بس طيب القلب، بيحكم على تحديات لاعبين في لعبة إنتاجية.
شغلتك: تبص على صورة الدليل وتقرر هل اللاعب فعلاً عمل التحدي ولا لأ.

قواعدك:
1. افهم التحدي كويس (العنوان والوصف والملاحظات).
2. حلل الصورة: إيه اللي باين فيها فعلاً؟
3. قارن الصورة بالتحدي. متعتمدش على حاجة واحدة صغيرة لو الدليل ضعيف.
4. لو الصورة مظلمة أو مش واضحة أو مغطية — اطلب صورة أوضح بدل ما تخمن.
5. كن حازم بس عادل. متتسرعش في الرفض ولا في القبول.

درجات الثقة:
- 90-100: مقنعة جداً → accepted
- 70-89: غالباً عملها → accepted
- 40-69: مش واضح → needs_more_evidence
- 0-39: مفيش دليل كفاية → rejected

رد بصيغة JSON فقط، من غير أي كلام تاني:
{"decision": "accepted" | "rejected" | "needs_more_evidence", "confidence": 0-100, "reason": "سبب قرارك بالعامية المصرية في جملة أو اتنين", "desha_comment": "تعليقك الساخر الودود بالعامية المصرية للاعب"}

قواعد الكلام: عامية مصرية بس. ساخر وضاحك بس مش جارح أبداً. زي صاحب مصري بيهزر.`;

export async function judgeProofImage(input: VerdictInput): Promise<Verdict> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("ai_unavailable");

  const contextText = [
    `التحدي: ${input.title}`,
    input.description ? `الوصف: ${input.description}` : null,
    input.notes ? `ملاحظات اللاعب: ${input.notes}` : null,
    `المدة المخططة: ${input.durationMinutes} دقيقة`,
    `بدأ: ${input.startedAt}`,
    `المفروض يخلص: ${input.endsAt}`,
    `دلوقتي: ${new Date().toISOString()}`,
    input.isDuplicate
      ? "تحذير مهم: نفس الصورة دي اترفعت قبل كده من نفس اللاعب في تحدي تاني. ده مؤشر غش قوي — خفّض الثقة جداً واطلب دليل جديد أو ارفض."
      : null,
    input.previousAttempts > 0 ? `عدد المحاولات السابقة على نفس التحدي: ${input.previousAttempts}` : null,
    "بص على الصورة المرفقة وقرر.",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-5.5",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: contextText },
            { type: "image_url", image_url: { url: input.imageUrl } },
          ],
        },
      ],
    }),
  });

  if (res.status === 429) throw new Error("ai_rate_limited");
  if (res.status === 402) throw new Error("ai_credits");
  if (!res.ok) {
    console.error("[DESHA AI] gateway error", res.status, await res.text());
    throw new Error("ai_failed");
  }

  const payload = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = payload.choices?.[0]?.message?.content ?? "";
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    console.error("[DESHA AI] unparseable response", raw.slice(0, 400));
    throw new Error("ai_failed");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    console.error("[DESHA AI] JSON parse failed", match[0].slice(0, 400));
    throw new Error("ai_failed");
  }

  const decisionRaw = String(parsed.decision ?? "");
  const decision: Verdict["decision"] =
    decisionRaw === "accepted" || decisionRaw === "rejected" || decisionRaw === "needs_more_evidence"
      ? decisionRaw
      : "needs_more_evidence";

  let confidence = Math.max(0, Math.min(100, Math.round(Number(parsed.confidence ?? 0)) || 0));

  // Anti-cheat signal: exact duplicate image caps confidence hard.
  if (input.isDuplicate && confidence > 35) confidence = 35;

  const finalDecision: Verdict["decision"] = input.isDuplicate && decision === "accepted" ? "needs_more_evidence" : decision;

  return {
    decision: finalDecision,
    confidence,
    reason: String(parsed.reason ?? "").slice(0, 500) || "مفيش تفاصيل.",
    deshaComment:
      String(parsed.desha_comment ?? "").slice(0, 300) ||
      (finalDecision === "accepted" ? "أهو كده يا بطل 😈" : "وريني دليل أحسن من كده."),
  };
}
