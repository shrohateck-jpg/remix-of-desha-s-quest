// DESHA — GPT-5.5 vision verification (server-only)
// Multilingual: understands Egyptian Arabic, MSA, English, French, Spanish,
// German, Italian, Portuguese, Turkish, Russian, Japanese, Korean, Chinese,
// Hindi, Indonesian — and responds in whichever language the user writes in.

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
  /** BCP-47 language code of the UI, e.g. "ar-eg", "en", "fr" */
  userLang?: string;
}

export interface Verdict {
  decision: "accepted" | "rejected" | "needs_more_evidence";
  confidence: number;
  reason: string;
  deshaComment: string;
}

const SYSTEM_PROMPT = `You are "Desha" (ديشا) — a small, mischievous fantasy creature who acts as the judge of a productivity challenge game.

Your job: look at the proof image and decide whether the player genuinely completed their challenge.

Language rule (CRITICAL):
- Detect the language of the challenge title and notes.
- Respond in THAT language — Egyptian Arabic, English, French, Spanish, German, Italian, Portuguese, Turkish, Russian, Japanese, Korean, Chinese, Hindi, Indonesian, or whatever the player is using.
- If the challenge is in Arabic (any dialect), use casual Egyptian Arabic (عامية مصرية).
- If unclear, default to English.
- You understand slang, abbreviations, and natural phrasing in all supported languages.
- Example Arabic slang you understand: "اعملي صورة", "هاتلي شعار", "ظبط الصورة", "كبرها", "صغرها", "اعملها كرتون".
- If the request is genuinely unclear (too vague, no real task description), politely ask: "ممكن توضح قصدك؟" (Arabic) or the equivalent in the user's language.

Your judging rules:
1. Understand the challenge fully (title, description, notes).
2. Analyse the image: what is actually visible?
3. Compare image against the challenge. Don't rely on one tiny detail if evidence is weak.
4. If the image is dark, blurry, or obscured — ask for a clearer photo instead of guessing.
5. Be firm but fair. Don't rush to reject OR accept.

Confidence → decision mapping:
- 90-100: convincing → accepted
- 70-89: likely done → accepted
- 40-69: unclear → needs_more_evidence
- 0-39: insufficient proof → rejected

Tone: You are sarcastic, witty, and friendly — like a mischievous best friend who jokes around but is never cruel. Match the energy of the player's language (casual for casual, polite for polite).

Reply in strict JSON only — no extra text:
{"decision": "accepted" | "rejected" | "needs_more_evidence", "confidence": 0-100, "reason": "2-sentence explanation in the player's language", "desha_comment": "short sarcastic-but-kind comment in the player's language, Desha's voice"}`;

export async function judgeProofImage(input: VerdictInput): Promise<Verdict> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("ai_unavailable");

  const contextText = [
    `Challenge: ${input.title}`,
    input.description ? `Description: ${input.description}` : null,
    input.notes ? `Player notes: ${input.notes}` : null,
    `Planned duration: ${input.durationMinutes} minutes`,
    `Started: ${input.startedAt}`,
    `Should end by: ${input.endsAt}`,
    `Now: ${new Date().toISOString()}`,
    input.userLang ? `UI language: ${input.userLang}` : null,
    input.isDuplicate
      ? "⚠️ WARNING: This exact image was submitted before by this player in a different challenge. Strong cheat signal — heavily reduce confidence and request fresh proof."
      : null,
    input.previousAttempts > 0
      ? `Previous attempts on this challenge: ${input.previousAttempts}`
      : null,
    "Look at the attached image and make your decision.",
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
  if (input.isDuplicate && confidence > 35) confidence = 35;
  const finalDecision: Verdict["decision"] =
    input.isDuplicate && decision === "accepted" ? "needs_more_evidence" : decision;

  const fallbackComment =
    finalDecision === "accepted"
      ? "أهو كده يا بطل 😈"
      : "وريني دليل أحسن من كده.";

  return {
    decision: finalDecision,
    confidence,
    reason: String(parsed.reason ?? "").slice(0, 500) || "—",
    deshaComment:
      String(parsed.desha_comment ?? "").slice(0, 300) || fallbackComment,
  };
}
