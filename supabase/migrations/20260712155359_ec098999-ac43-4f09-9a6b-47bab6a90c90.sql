REVOKE ALL ON FUNCTION public.ensure_profile() FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.start_challenge(text, text, text, integer) FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_active_challenge() FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.claim_daily_reward() FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.mark_verifying(uuid, text, text) FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.apply_verification(uuid, public.verification_decision, integer, text, text) FROM anon, PUBLIC, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.level_for_xp(integer) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.level_for_xp(integer) TO authenticated, service_role;