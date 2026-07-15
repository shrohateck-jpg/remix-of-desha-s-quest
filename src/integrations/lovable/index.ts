// @lovable.dev/cloud-auth-js is a Lovable-platform-only library and does not
// work on Replit. All OAuth is now handled directly via supabase.auth.signInWithOAuth.
// This file is kept as an empty shim to avoid breaking any auto-generated imports.
export const lovable = {
  auth: {
    // Stub — not used; kept for legacy import compatibility only.
    signInWithOAuth: async () => ({ error: new Error("Use supabase.auth.signInWithOAuth instead") }),
  },
};
