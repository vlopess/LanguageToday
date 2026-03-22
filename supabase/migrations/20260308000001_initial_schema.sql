-- ============================================================
-- CeskyToday / LanguageToday - Initial Database Schema
-- ============================================================
-- Run this migration in Supabase SQL editor or via CLI:
--   supabase db push
-- ============================================================

-- Enable UUID extension (already enabled in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- HELPER: updated_at trigger function
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TABLE: user_profiles
-- Extends Supabase auth.users with app-specific profile data.
-- ============================================================
CREATE TABLE public.user_profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL DEFAULT '',
  level         TEXT        NOT NULL DEFAULT 'A1'
                            CHECK (level IN ('A1','A2','B1','B2','C1','C2','beginner')),
  daily_time    INT         NOT NULL DEFAULT 15
                            CHECK (daily_time IN (5, 15, 30)),
  completed_onboarding BOOLEAN NOT NULL DEFAULT FALSE,
  current_language     TEXT NOT NULL DEFAULT 'czech'
                            CHECK (current_language IN ('czech', 'english')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Automatically create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- TABLE: scenarios
-- Pre-defined and user-created conversation scenarios for the
-- AI tutor chat (Teacher Catharina).
-- ============================================================
CREATE TABLE public.scenarios (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  -- NULL user_id = global/pre-defined scenario (visible to all)
  language    TEXT        NOT NULL DEFAULT 'english'
                          CHECK (language IN ('czech', 'english')),
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  prompt      TEXT        NOT NULL DEFAULT '',  -- system prompt for AI tutor
  is_custom   BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order  INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scenarios_language    ON public.scenarios (language);
CREATE INDEX idx_scenarios_user_id     ON public.scenarios (user_id);
CREATE INDEX idx_scenarios_is_custom   ON public.scenarios (is_custom);


-- ============================================================
-- TABLE: chat_sessions
-- Each conversation thread between the user and AI tutor.
-- ============================================================
CREATE TABLE public.chat_sessions (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  language        TEXT        NOT NULL DEFAULT 'english'
                              CHECK (language IN ('czech', 'english')),
  scenario_id     UUID        REFERENCES public.scenarios(id) ON DELETE SET NULL,
  label           TEXT        NOT NULL DEFAULT '',  -- formatted date label e.g. "March 8, 2026"
  last_message_at BIGINT      NOT NULL DEFAULT 0,   -- unix ms timestamp
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_user_id  ON public.chat_sessions (user_id);
CREATE INDEX idx_chat_sessions_language ON public.chat_sessions (language);
CREATE INDEX idx_chat_sessions_last_msg ON public.chat_sessions (last_message_at DESC);


-- ============================================================
-- TABLE: chat_messages
-- Individual messages within a chat session.
-- ============================================================
CREATE TABLE public.chat_messages (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_session_id UUID        NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role            TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  text            TEXT        NOT NULL DEFAULT '',
  is_initial      BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at_ms   BIGINT      NOT NULL DEFAULT 0,   -- original unix ms timestamp
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session  ON public.chat_messages (chat_session_id);
CREATE INDEX idx_chat_messages_created  ON public.chat_messages (created_at_ms ASC);


-- ============================================================
-- TABLE: learning_sessions
-- Groups all tasks/stories generated for a single study session.
-- ============================================================
CREATE TABLE public.learning_sessions (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  language    TEXT        NOT NULL DEFAULT 'english'
                          CHECK (language IN ('czech', 'english')),
  session_date DATE       NOT NULL DEFAULT CURRENT_DATE,
  completed   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_sessions_user     ON public.learning_sessions (user_id);
CREATE INDEX idx_learning_sessions_date     ON public.learning_sessions (session_date DESC);
CREATE INDEX idx_learning_sessions_language ON public.learning_sessions (language);


-- ============================================================
-- TABLE: session_tasks
-- Individual learning tasks generated for a session.
-- Supports 4 task types: active-recall, sentence-builder,
-- feynman, error-correction.
-- ============================================================
CREATE TABLE public.session_tasks (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  learning_session_id UUID        NOT NULL REFERENCES public.learning_sessions(id) ON DELETE CASCADE,
  user_id             UUID        NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type                TEXT        NOT NULL
                                  CHECK (type IN ('active-recall', 'sentence-builder', 'feynman', 'error-correction')),
  sort_order          INT         NOT NULL DEFAULT 0,

  -- Common field (all types)
  prompt              TEXT        NOT NULL DEFAULT '',

  -- active-recall fields
  answer              TEXT,
  phonetic            TEXT,
  explain             TEXT,
  hint                TEXT,
  example             TEXT,       -- "Czech sentence + English translation"

  -- sentence-builder fields
  correct_order       JSONB,      -- string[]
  options             JSONB,      -- string[] (shuffled words + distractors)
  grammar_note        TEXT,

  -- feynman fields
  key_points          JSONB,      -- string[] (3 key points)

  -- error-correction fields
  sentence            TEXT,       -- Czech sentence with error
  corrected_sentence  TEXT,
  error_explanation   TEXT,

  -- Progress tracking
  completed           BOOLEAN     NOT NULL DEFAULT FALSE,
  self_rating         TEXT        CHECK (self_rating IN ('easy', 'medium', 'hard')),
  -- maps to 😊 = easy, 🤔 = medium, 😅 = hard

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_session_tasks_updated_at
  BEFORE UPDATE ON public.session_tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_session_tasks_session  ON public.session_tasks (learning_session_id);
CREATE INDEX idx_session_tasks_user     ON public.session_tasks (user_id);
CREATE INDEX idx_session_tasks_type     ON public.session_tasks (type);


-- ============================================================
-- TABLE: review_tasks
-- Spaced-repetition flashcard sets (8 cards per session).
-- ============================================================
CREATE TABLE public.review_tasks (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  learning_session_id UUID        NOT NULL REFERENCES public.learning_sessions(id) ON DELETE CASCADE,
  user_id             UUID        NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  sort_order          INT         NOT NULL DEFAULT 0,
  prompt              TEXT        NOT NULL DEFAULT '',  -- English word/phrase
  answer              TEXT        NOT NULL DEFAULT '',  -- Czech translation
  emoji               TEXT        NOT NULL DEFAULT '',
  explanation         TEXT        NOT NULL DEFAULT '',  -- usage note
  completed           BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_tasks_session ON public.review_tasks (learning_session_id);
CREATE INDEX idx_review_tasks_user    ON public.review_tasks (user_id);


-- ============================================================
-- TABLE: stories
-- Language-learning immersive stories (Czech + English pair).
-- ============================================================
CREATE TABLE public.stories (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  learning_session_id UUID        REFERENCES public.learning_sessions(id) ON DELETE SET NULL,
  user_id             UUID        NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  language            TEXT        NOT NULL DEFAULT 'english'
                                  CHECK (language IN ('czech', 'english')),
  title               TEXT        NOT NULL DEFAULT '',
  icon                TEXT        NOT NULL DEFAULT '',  -- single emoji
  language_text       TEXT        NOT NULL DEFAULT '',  -- Czech text (min ~200 words)
  original_text       TEXT        NOT NULL DEFAULT '',  -- English translation
  is_saved            BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_stories_user       ON public.stories (user_id);
CREATE INDEX idx_stories_language   ON public.stories (language);
CREATE INDEX idx_stories_is_saved   ON public.stories (is_saved) WHERE is_saved = TRUE;


-- ============================================================
-- TABLE: study_topics
-- Academic path curriculum modules (pre-defined content).
-- ============================================================
CREATE TABLE public.study_topics (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  language     TEXT        NOT NULL DEFAULT 'english'
                           CHECK (language IN ('czech', 'english')),
  level        TEXT        NOT NULL DEFAULT 'A1'
                           CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  title        TEXT        NOT NULL DEFAULT '',
  emoji        TEXT        NOT NULL DEFAULT '',
  key_phrases  TEXT        NOT NULL DEFAULT '',   -- Markdown
  pattern      TEXT        NOT NULL DEFAULT '',   -- Grammar patterns in Markdown
  practice     TEXT        NOT NULL DEFAULT '',   -- Practice instructions
  quick_review TEXT        NOT NULL DEFAULT '',   -- Review questions
  sort_order   INT         NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_study_topics_language ON public.study_topics (language);
CREATE INDEX idx_study_topics_level    ON public.study_topics (level);


-- ============================================================
-- TABLE: user_topic_progress
-- Tracks which study topics a user has visited/completed.
-- ============================================================
CREATE TABLE public.user_topic_progress (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  study_topic_id  UUID        NOT NULL REFERENCES public.study_topics(id) ON DELETE CASCADE,
  completed       BOOLEAN     NOT NULL DEFAULT FALSE,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, study_topic_id)
);

CREATE INDEX idx_user_topic_progress_user  ON public.user_topic_progress (user_id);
CREATE INDEX idx_user_topic_progress_topic ON public.user_topic_progress (study_topic_id);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Every user can only access their own data.
-- Pre-defined scenarios (user_id IS NULL) are readable by all.
-- ============================================================

ALTER TABLE public.user_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_tasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_topics        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topic_progress ENABLE ROW LEVEL SECURITY;


-- user_profiles: own row only
CREATE POLICY "users_own_profile"
  ON public.user_profiles
  FOR ALL
  USING (id = auth.uid());

-- scenarios: own custom scenarios + all global ones
CREATE POLICY "scenarios_read"
  ON public.scenarios
  FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "scenarios_insert"
  ON public.scenarios
  FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_custom = TRUE);

CREATE POLICY "scenarios_update"
  ON public.scenarios
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "scenarios_delete"
  ON public.scenarios
  FOR DELETE
  USING (user_id = auth.uid());

-- chat_sessions: own sessions only
CREATE POLICY "chat_sessions_own"
  ON public.chat_sessions
  FOR ALL
  USING (user_id = auth.uid());

-- chat_messages: own messages via session ownership
CREATE POLICY "chat_messages_own"
  ON public.chat_messages
  FOR ALL
  USING (
    chat_session_id IN (
      SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
    )
  );

-- learning_sessions: own sessions only
CREATE POLICY "learning_sessions_own"
  ON public.learning_sessions
  FOR ALL
  USING (user_id = auth.uid());

-- session_tasks: own tasks only
CREATE POLICY "session_tasks_own"
  ON public.session_tasks
  FOR ALL
  USING (user_id = auth.uid());

-- review_tasks: own tasks only
CREATE POLICY "review_tasks_own"
  ON public.review_tasks
  FOR ALL
  USING (user_id = auth.uid());

-- stories: own stories only
CREATE POLICY "stories_own"
  ON public.stories
  FOR ALL
  USING (user_id = auth.uid());

-- study_topics: readable by all authenticated users (pre-defined content)
CREATE POLICY "study_topics_read"
  ON public.study_topics
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- user_topic_progress: own progress only
CREATE POLICY "user_topic_progress_own"
  ON public.user_topic_progress
  FOR ALL
  USING (user_id = auth.uid());


-- ============================================================
-- SEED: Pre-defined Scenarios (English)
-- These are global rows (user_id = NULL) so every user can see them.
-- ============================================================
INSERT INTO public.scenarios (user_id, language, title, description, prompt, is_custom, sort_order) VALUES
(NULL, 'english', 'Job Interview', 'Practice for a professional job interview in English.', 'You are a professional interviewer conducting a job interview in English. Ask relevant questions about the candidate''s experience, skills, and motivations. Give constructive feedback on their answers.', FALSE, 1),
(NULL, 'english', 'Airport Conversation', 'Navigate airport check-in, security, and boarding.', 'You are an airport staff member helping a traveler. Simulate realistic airport interactions including check-in, security questions, gate information, and boarding procedures.', FALSE, 2),
(NULL, 'english', 'Business Meeting', 'Participate in a formal business meeting.', 'You are a business professional in a meeting. Discuss project updates, deadlines, budgets, and decisions. Use formal business English vocabulary and phrases.', FALSE, 3),
(NULL, 'english', 'Daily Small Talk', 'Practice everyday casual conversation.', 'You are a friendly colleague or neighbor making small talk. Keep conversations light and natural, covering topics like weather, weekend plans, hobbies, and local events.', FALSE, 4),
(NULL, 'english', 'Ordering at a Restaurant', 'Order food and handle restaurant interactions.', 'You are a waiter at an English-speaking restaurant. Help the customer navigate the menu, take their order, handle special requests, and process the bill.', FALSE, 5),
(NULL, 'english', 'Hotel Check-in', 'Check into a hotel and handle common requests.', 'You are a hotel receptionist. Handle the guest''s check-in, answer questions about amenities, deal with room issues, and process requests professionally.', FALSE, 6),
(NULL, 'english', 'Doctor Appointment', 'Describe symptoms and understand medical advice.', 'You are a doctor conducting a patient consultation. Ask about symptoms, medical history, and lifestyle. Give clear medical advice and explanations in plain English.', FALSE, 7),
(NULL, 'english', 'Tech Support Call', 'Troubleshoot technical problems over the phone.', 'You are a tech support agent helping a customer with their computer or software issue. Guide them step by step through troubleshooting while being patient and clear.', FALSE, 8),
(NULL, 'english', 'University Presentation', 'Present academic research to a class or committee.', 'You are an academic audience member listening to a university presentation. Ask questions, request clarifications, and provide feedback on the content and delivery.', FALSE, 9),
(NULL, 'english', 'Performance Review', 'Discuss work performance with a manager.', 'You are a manager conducting an annual performance review. Discuss achievements, areas for improvement, goals, and career development professionally and constructively.', FALSE, 10),
(NULL, 'english', 'Academic Exam (Written)', 'Practice writing academic answers under exam conditions.', 'You are an exam proctor and evaluator. Give the student written exam questions and evaluate their responses for accuracy, clarity, and academic style.', FALSE, 11),
(NULL, 'english', 'Oral Examination', 'Prepare for a spoken academic exam.', 'You are an academic examiner conducting an oral examination. Ask challenging questions on the subject, probe understanding with follow-ups, and assess the quality of reasoning.', FALSE, 12),
(NULL, 'english', 'Research Paper Discussion', 'Defend or discuss academic research findings.', 'You are a peer reviewer or committee member discussing a research paper. Ask about methodology, findings, limitations, and implications of the research.', FALSE, 13);


-- ============================================================
-- SEED: Pre-defined Scenarios (Czech/English learners)
-- ============================================================
INSERT INTO public.scenarios (user_id, language, title, description, prompt, is_custom, sort_order) VALUES
(NULL, 'czech', 'Pracovní pohovor', 'Cvičení pro profesionální pracovní pohovor v angličtině.', 'You are a professional interviewer conducting a job interview in English with a Czech speaker learning English. Speak in English, correct major errors kindly, and help them express their ideas clearly.', FALSE, 1),
(NULL, 'czech', 'Na letišti', 'Navigace přes check-in, bezpečnost a nástup do letadla.', 'You are an English-speaking airport staff member helping a Czech traveler. Speak in English, but if they are stuck, offer a gentle hint. Cover check-in, security, and boarding.', FALSE, 2),
(NULL, 'czech', 'Obchodní schůzka', 'Účast na formální obchodní schůzce v angličtině.', 'You are an English-speaking business professional in a meeting with a Czech colleague. Use formal business English and help them practice professional vocabulary.', FALSE, 3),
(NULL, 'czech', 'Každodenní konverzace', 'Procvičování běžné neformální konverzace.', 'You are a friendly English-speaking person making casual small talk with a Czech learner. Keep it natural and fun, gently correcting significant English errors.', FALSE, 4),
(NULL, 'czech', 'Objednávání v restauraci', 'Objednávání jídla a interakce v restauraci.', 'You are an English-speaking waiter. Help the Czech customer order in English, answer their questions about the menu, and handle the bill.', FALSE, 5);
