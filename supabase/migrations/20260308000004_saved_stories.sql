-- ============================================================
-- Saved stories: persists stories the user explicitly pinned.
-- AI-generated content is volatile; only user actions are saved.
-- ============================================================

CREATE TABLE public.saved_stories (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language     TEXT        NOT NULL CHECK (language IN ('czech', 'english')),
  title        TEXT        NOT NULL DEFAULT '',
  icon         TEXT        NOT NULL DEFAULT '',
  language_text TEXT       NOT NULL DEFAULT '',
  original_text TEXT       NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, title)
);

CREATE INDEX idx_saved_stories_user ON public.saved_stories (user_id);

ALTER TABLE public.saved_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_stories_own"
  ON public.saved_stories
  FOR ALL
  USING (user_id = auth.uid());
