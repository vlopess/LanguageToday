-- Study sessions table to track user study frequency
CREATE TABLE study_sessions (
    id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          UUID        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    language         TEXT        NOT NULL CHECK (language IN ('czech', 'english', 'spanish')),
    duration_minutes INTEGER     NOT NULL,
    completed_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own study sessions"
    ON study_sessions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own study sessions"
    ON study_sessions FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Index for fast per-user queries
CREATE INDEX idx_study_sessions_user_language
    ON study_sessions (user_id, language, completed_at DESC);
