// DESHA — server functions (verification engine + account)
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { judgeProofImage } from "@/lib/ai-verify.server";

const VerifyInput = z.object({
  challengeId: z.string().uuid(),
  proofPath: z.string().min(3),
  proofHash: z.string().min(16),
});

export const verifyProof = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => VerifyInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Proof must live in the caller's own folder
    if (!data.proofPath.startsWith(`${userId}/`)) {
      throw new Error("مسار الصورة مش صح.");
    }

    const { data: challenge, error: chErr } = await supabase
      .from("challenges")
      .select("*")
      .eq("id", data.challengeId)
      .single();
    if (chErr || !challenge) throw new Error("التحدي مش موجود.");
    if (!["running", "waiting_proof", "verifying"].includes(challenge.status)) {
      throw new Error("التحدي ده خلص خلاص.");
    }

    // Duplicate-image anti-cheat: same hash used on another challenge before?
    const { data: dupes } = await supabase
      .from("challenges")
      .select("id")
      .eq("user_id", userId)
      .eq("proof_image_hash", data.proofHash)
      .neq("id", challenge.id)
      .limit(1);
    const isDuplicate = (dupes?.length ?? 0) > 0;

    // How many earlier attempts on this same challenge
    const { count: attemptCount } = await supabase
      .from("challenge_logs")
      .select("id", { count: "exact", head: true })
      .eq("challenge_id", challenge.id);

    // Record the proof server-side (as the user, RLS applies)
    const { error: mvErr } = await supabase.rpc("mark_verifying", {
      _challenge_id: challenge.id,
      _proof_path: data.proofPath,
      _proof_hash: data.proofHash,
    });
    if (mvErr) {
      console.error("[DESHA] mark_verifying failed", mvErr);
      throw new Error("حصلت مشكلة وإحنا بنسجل الدليل. جرب تاني.");
    }

    // Signed URL for the private proof image (service role, verification only)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("proofs")
      .createSignedUrl(data.proofPath, 600);
    if (signErr || !signed?.signedUrl) {
      console.error("[DESHA] signed url failed", signErr);
      throw new Error("مقدرتش أوصل للصورة. ارفعها تاني.");
    }

    // GPT-5.5 Vision — the only judge
    let verdict;
    try {
      verdict = await judgeProofImage({
        title: challenge.title,
        description: challenge.description,
        notes: challenge.notes,
        durationMinutes: challenge.duration_minutes,
        startedAt: challenge.started_at,
        endsAt: challenge.ends_at,
        imageUrl: signed.signedUrl,
        isDuplicate,
        previousAttempts: attemptCount ?? 0,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "ai_failed";
      if (msg === "ai_rate_limited") throw new Error("ديشا مشغول شوية دلوقتي... جرب كمان دقيقة.");
      if (msg === "ai_credits") throw new Error("رصيد الذكاء الاصطناعي خلص. كلم صاحب التطبيق.");
      throw new Error("ديشا معرفش يشوف الصورة... جرب تاني.");
    }

    // Apply the verdict server-side (service role — the only path that changes XP/points)
    const { data: updated, error: applyErr } = await supabaseAdmin.rpc("apply_verification", {
      _challenge_id: challenge.id,
      _decision: verdict.decision,
      _confidence: verdict.confidence,
      _reason: verdict.reason,
      _desha_comment: verdict.deshaComment,
    });
    if (applyErr || !updated) {
      console.error("[DESHA] apply_verification failed", applyErr);
      throw new Error("حصلت مشكلة وإحنا بنسجل النتيجة. جرب تاني.");
    }

    return {
      decision: verdict.decision,
      confidence: verdict.confidence,
      reason: verdict.reason,
      deshaComment: verdict.deshaComment,
      challenge: updated,
    };
  });

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Remove proof images
    const { data: files } = await supabaseAdmin.storage.from("proofs").list(userId, { limit: 1000 });
    if (files?.length) {
      await supabaseAdmin.storage.from("proofs").remove(files.map((f) => `${userId}/${f.name}`));
    }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error("[DESHA] delete account failed", error);
      throw new Error("مقدرناش نمسح الحساب دلوقتي. جرب تاني.");
    }
    return { ok: true };
  });
