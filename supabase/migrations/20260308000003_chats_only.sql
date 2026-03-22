-- ============================================================
-- Simplify schema: keep ONLY chat_sessions + chat_messages.
-- Everything else (tasks, stories, review, profile) is volatile
-- and handled via localStorage + AI generation.
-- ============================================================

-- 1. Drop FK so we can alter chat_sessions.user_id reference later
ALTER TABLE public.chat_sessions
  DROP CONSTRAINT IF EXISTS chat_sessions_user_id_fkey;

-- 2. Drop all volatile/unused tables (CASCADE cleans up dependent FKs/policies)
DROP TABLE IF EXISTS public.user_topic_progress CASCADE;
DROP TABLE IF EXISTS public.review_tasks        CASCADE;
DROP TABLE IF EXISTS public.session_tasks       CASCADE;
DROP TABLE IF EXISTS public.stories             CASCADE;
DROP TABLE IF EXISTS public.learning_sessions   CASCADE;
DROP TABLE IF EXISTS public.study_topics        CASCADE;
DROP TABLE IF EXISTS public.scenarios           CASCADE;
DROP TABLE IF EXISTS public.user_profiles       CASCADE;

-- 3. Remove scenario_id column from chat_sessions (scenarios table is gone)
ALTER TABLE public.chat_sessions DROP COLUMN IF EXISTS scenario_id;

-- 4. Point user_id directly at auth.users (no more user_profiles middleman)
ALTER TABLE public.chat_sessions
  ADD CONSTRAINT chat_sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Drop triggers and helper functions that are no longer needed
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS set_updated_at();
