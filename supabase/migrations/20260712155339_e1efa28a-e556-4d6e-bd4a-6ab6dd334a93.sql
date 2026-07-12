-- ========= DESHA game schema =========

CREATE TYPE public.challenge_status AS ENUM ('running', 'waiting_proof', 'verifying', 'completed', 'failed', 'cancelled');
CREATE TYPE public.verification_decision AS ENUM ('accepted', 'rejected', 'needs_more_evidence');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;

-- ========= profiles =========
CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT 'بطل مجهول',
  avatar_url text,
  level integer NOT NULL DEFAULT 1,
  xp integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 100,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_win_date date,
  total_completed integer NOT NULL DEFAULT 0,
  total_failed integer NOT NULL DEFAULT 0,
  last_daily_claim timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========= challenges =========
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  notes text,
  duration_minutes integer NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  completed_at timestamptz,
  status public.challenge_status NOT NULL DEFAULT 'running',
  proof_image_path text,
  proof_image_hash text,
  verification_decision public.verification_decision,
  verification_reason text,
  confidence_score integer,
  desha_comment text,
  xp_reward integer NOT NULL DEFAULT 0,
  points_delta integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.challenges TO authenticated;
GRANT ALL ON public.challenges TO service_role;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own challenges" ON public.challenges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER challenges_updated_at BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_challenges_user_status ON public.challenges (user_id, status);
CREATE INDEX idx_challenges_user_created ON public.challenges (user_id, created_at DESC);

-- ========= challenge_logs =========
CREATE TABLE public.challenge_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  event text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.challenge_logs TO authenticated;
GRANT ALL ON public.challenge_logs TO service_role;
ALTER TABLE public.challenge_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own logs" ON public.challenge_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ========= daily_rewards =========
CREATE TABLE public.daily_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reward_points integer NOT NULL DEFAULT 10,
  claimed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.daily_rewards TO authenticated;
GRANT ALL ON public.daily_rewards TO service_role;
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own rewards" ON public.daily_rewards
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ========= Level helper =========
CREATE OR REPLACE FUNCTION public.level_for_xp(_xp integer)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT floor(sqrt(greatest(_xp, 0) / 50.0))::integer + 1;
$$;

-- ========= ensure_profile =========
CREATE OR REPLACE FUNCTION public.ensure_profile()
RETURNS public.profiles
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _meta jsonb := coalesce(auth.jwt() -> 'user_metadata', '{}'::jsonb);
  _row public.profiles;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    _uid,
    coalesce(nullif(_meta ->> 'full_name', ''), nullif(_meta ->> 'name', ''), 'بطل مجهول'),
    nullif(_meta ->> 'avatar_url', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = coalesce(nullif(_meta ->> 'full_name', ''), nullif(_meta ->> 'name', ''), public.profiles.display_name),
    avatar_url = coalesce(nullif(_meta ->> 'avatar_url', ''), public.profiles.avatar_url)
  RETURNING * INTO _row;
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.ensure_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_profile() TO authenticated;

-- ========= start_challenge =========
CREATE OR REPLACE FUNCTION public.start_challenge(_title text, _description text, _notes text, _duration_minutes integer)
RETURNS public.challenges
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _row public.challenges;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _title IS NULL OR length(trim(_title)) < 2 OR length(_title) > 120 THEN
    RAISE EXCEPTION 'invalid_title';
  END IF;
  IF _duration_minutes IS NULL OR _duration_minutes < 1 OR _duration_minutes > 1440 THEN
    RAISE EXCEPTION 'invalid_duration';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext(_uid::text));
  IF EXISTS (SELECT 1 FROM public.challenges WHERE user_id = _uid AND status IN ('running','waiting_proof','verifying')) THEN
    RAISE EXCEPTION 'active_challenge_exists';
  END IF;
  INSERT INTO public.challenges (user_id, title, description, notes, duration_minutes, started_at, ends_at)
  VALUES (_uid, trim(_title), nullif(trim(coalesce(_description,'')), ''), nullif(trim(coalesce(_notes,'')), ''), _duration_minutes, now(), now() + make_interval(mins => _duration_minutes))
  RETURNING * INTO _row;
  INSERT INTO public.challenge_logs (challenge_id, user_id, event, details)
  VALUES (_row.id, _uid, 'started', jsonb_build_object('duration_minutes', _duration_minutes));
  RETURN _row;
END; $$;
REVOKE ALL ON FUNCTION public.start_challenge(text, text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_challenge(text, text, text, integer) TO authenticated;

-- ========= cancel_active_challenge =========
CREATE OR REPLACE FUNCTION public.cancel_active_challenge()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  UPDATE public.challenges SET status = 'cancelled', completed_at = now()
  WHERE user_id = _uid AND status IN ('running','waiting_proof')
  RETURNING id INTO _id;
  IF _id IS NOT NULL THEN
    INSERT INTO public.challenge_logs (challenge_id, user_id, event) VALUES (_id, _uid, 'cancelled');
  END IF;
END; $$;
REVOKE ALL ON FUNCTION public.cancel_active_challenge() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_active_challenge() TO authenticated;

-- ========= claim_daily_reward =========
CREATE OR REPLACE FUNCTION public.claim_daily_reward()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _last timestamptz;
  _points integer := 10;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext(_uid::text || ':daily'));
  SELECT last_daily_claim INTO _last FROM public.profiles WHERE user_id = _uid FOR UPDATE;
  IF _last IS NOT NULL AND now() - _last < interval '24 hours' THEN
    RETURN jsonb_build_object('claimed', false, 'next_at', _last + interval '24 hours');
  END IF;
  UPDATE public.profiles SET points = points + _points, last_daily_claim = now() WHERE user_id = _uid;
  INSERT INTO public.daily_rewards (user_id, reward_points) VALUES (_uid, _points);
  RETURN jsonb_build_object('claimed', true, 'points', _points);
END; $$;
REVOKE ALL ON FUNCTION public.claim_daily_reward() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_daily_reward() TO authenticated;

-- ========= mark_verifying =========
CREATE OR REPLACE FUNCTION public.mark_verifying(_challenge_id uuid, _proof_path text, _proof_hash text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  UPDATE public.challenges
  SET status = 'verifying', proof_image_path = _proof_path, proof_image_hash = _proof_hash
  WHERE id = _challenge_id AND user_id = _uid AND status IN ('running','waiting_proof');
  IF NOT FOUND THEN RAISE EXCEPTION 'challenge_not_active'; END IF;
  INSERT INTO public.challenge_logs (challenge_id, user_id, event, details)
  VALUES (_challenge_id, _uid, 'proof_submitted', jsonb_build_object('hash', _proof_hash));
END; $$;
REVOKE ALL ON FUNCTION public.mark_verifying(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_verifying(uuid, text, text) TO authenticated;

-- ========= apply_verification: SERVICE ROLE ONLY =========
CREATE OR REPLACE FUNCTION public.apply_verification(
  _challenge_id uuid,
  _decision public.verification_decision,
  _confidence integer,
  _reason text,
  _desha_comment text
)
RETURNS public.challenges
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _c public.challenges;
  _p public.profiles;
  _xp_gain integer := 0;
  _points_change integer := 0;
  _overtime_penalty integer := 0;
  _new_streak integer;
BEGIN
  SELECT * INTO _c FROM public.challenges WHERE id = _challenge_id FOR UPDATE;
  IF _c IS NULL THEN RAISE EXCEPTION 'challenge_not_found'; END IF;
  IF _c.status <> 'verifying' THEN RAISE EXCEPTION 'challenge_not_verifying'; END IF;
  SELECT * INTO _p FROM public.profiles WHERE user_id = _c.user_id FOR UPDATE;

  _overtime_penalty := greatest(0, floor(extract(epoch FROM (now() - _c.ends_at)) / 600))::integer;

  IF _decision = 'accepted' THEN
    _xp_gain := 20 + least(_c.duration_minutes, 480);
    _points_change := (10 + _c.duration_minutes / 10) - _overtime_penalty;
    IF _p.last_win_date = current_date THEN
      _new_streak := _p.current_streak;
    ELSIF _p.last_win_date = current_date - 1 THEN
      _new_streak := _p.current_streak + 1;
    ELSE
      _new_streak := 1;
    END IF;
    _xp_gain := _xp_gain + least(_new_streak * 5, 100);
    UPDATE public.challenges SET
      status = 'completed', completed_at = now(), verification_decision = _decision,
      confidence_score = _confidence, verification_reason = _reason, desha_comment = _desha_comment,
      xp_reward = _xp_gain, points_delta = _points_change
    WHERE id = _challenge_id RETURNING * INTO _c;
    UPDATE public.profiles SET
      xp = xp + _xp_gain,
      level = public.level_for_xp(xp + _xp_gain),
      points = greatest(0, points + _points_change),
      total_completed = total_completed + 1,
      current_streak = _new_streak,
      longest_streak = greatest(longest_streak, _new_streak),
      last_win_date = current_date
    WHERE user_id = _c.user_id;
  ELSIF _decision = 'rejected' THEN
    _points_change := -10 - _overtime_penalty;
    UPDATE public.challenges SET
      status = 'failed', completed_at = now(), verification_decision = _decision,
      confidence_score = _confidence, verification_reason = _reason, desha_comment = _desha_comment,
      xp_reward = 0, points_delta = _points_change
    WHERE id = _challenge_id RETURNING * INTO _c;
    UPDATE public.profiles SET
      points = greatest(0, points + _points_change),
      total_failed = total_failed + 1
    WHERE user_id = _c.user_id;
  ELSE
    UPDATE public.challenges SET
      status = 'waiting_proof', verification_decision = _decision,
      confidence_score = _confidence, verification_reason = _reason, desha_comment = _desha_comment
    WHERE id = _challenge_id RETURNING * INTO _c;
  END IF;

  INSERT INTO public.challenge_logs (challenge_id, user_id, event, details)
  VALUES (_challenge_id, _c.user_id, 'verified',
    jsonb_build_object('decision', _decision, 'confidence', _confidence, 'xp', _xp_gain, 'points', _points_change));
  RETURN _c;
END; $$;
REVOKE ALL ON FUNCTION public.apply_verification(uuid, public.verification_decision, integer, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_verification(uuid, public.verification_decision, integer, text, text) TO service_role;