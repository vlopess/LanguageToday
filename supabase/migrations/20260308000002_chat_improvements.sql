-- ============================================================
-- Migration: Chat scenario data + sentence builder improvements
-- ============================================================

-- Store the full scenario object in chat sessions (needed for custom scenarios
-- that don't have a row in the scenarios table)
ALTER TABLE public.chat_sessions
  ADD COLUMN IF NOT EXISTS scenario_data JSONB;

-- Store targetSentence for sentence-builder tasks
ALTER TABLE public.session_tasks
  ADD COLUMN IF NOT EXISTS target_sentence TEXT;
