-- One row per user per local calendar day with at least one review; powers streaks
CREATE TABLE IF NOT EXISTS public.review_days (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  day date NOT NULL,
  cards_reviewed integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

ALTER TABLE public.review_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their review days" ON public.review_days;
CREATE POLICY "Users can read their review days" ON public.review_days
  FOR SELECT USING (auth.uid() = user_id);

-- Writes go through record_review so clients can't set arbitrary counts. p_day is the user's local
-- date, so it may differ from the server's by a day either way; anything else is ignored
CREATE OR REPLACE FUNCTION public.record_review(p_day date)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.review_days (user_id, day, cards_reviewed)
  SELECT auth.uid(), p_day, 1
  WHERE auth.uid() IS NOT NULL AND p_day BETWEEN current_date - 1 AND current_date + 1
  ON CONFLICT (user_id, day) DO UPDATE SET cards_reviewed = review_days.cards_reviewed + 1;
$$;

REVOKE ALL ON FUNCTION public.record_review(date) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.record_review(date) TO authenticated;
