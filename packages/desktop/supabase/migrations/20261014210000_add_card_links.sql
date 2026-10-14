-- Reference links that help explain a card's answer: [{ "url": "https://...", "title": "optional" }]
ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS links jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.cards DROP CONSTRAINT IF EXISTS cards_links_is_array;
ALTER TABLE public.cards
  ADD CONSTRAINT cards_links_is_array CHECK (jsonb_typeof(links) = 'array');
