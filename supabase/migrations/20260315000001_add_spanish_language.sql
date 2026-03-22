-- Add 'spanish' to all language CHECK constraints

ALTER TABLE public.user_profiles
    DROP CONSTRAINT IF EXISTS user_profiles_current_language_check;
ALTER TABLE public.user_profiles
    ADD CONSTRAINT user_profiles_current_language_check
    CHECK (current_language IN ('czech', 'english', 'spanish'));

ALTER TABLE public.scenarios
    DROP CONSTRAINT IF EXISTS scenarios_language_check;
ALTER TABLE public.scenarios
    ADD CONSTRAINT scenarios_language_check
    CHECK (language IN ('czech', 'english', 'spanish'));

ALTER TABLE public.chat_sessions
    DROP CONSTRAINT IF EXISTS chat_sessions_language_check;
ALTER TABLE public.chat_sessions
    ADD CONSTRAINT chat_sessions_language_check
    CHECK (language IN ('czech', 'english', 'spanish'));

ALTER TABLE public.learning_sessions
    DROP CONSTRAINT IF EXISTS learning_sessions_language_check;
ALTER TABLE public.learning_sessions
    ADD CONSTRAINT learning_sessions_language_check
    CHECK (language IN ('czech', 'english', 'spanish'));

ALTER TABLE public.stories
    DROP CONSTRAINT IF EXISTS stories_language_check;
ALTER TABLE public.stories
    ADD CONSTRAINT stories_language_check
    CHECK (language IN ('czech', 'english', 'spanish'));

ALTER TABLE public.study_topics
    DROP CONSTRAINT IF EXISTS study_topics_language_check;
ALTER TABLE public.study_topics
    ADD CONSTRAINT study_topics_language_check
    CHECK (language IN ('czech', 'english', 'spanish'));

ALTER TABLE public.saved_stories
    DROP CONSTRAINT IF EXISTS saved_stories_language_check;
ALTER TABLE public.saved_stories
    ADD CONSTRAINT saved_stories_language_check
    CHECK (language IN ('czech', 'english', 'spanish'));

-- Seed Spanish scenarios
INSERT INTO public.scenarios (language, title, description, prompt, icon) VALUES
('spanish', 'Entrevista de trabajo',    'Practica para una entrevista laboral formal en español.',                                          'You are a hiring manager conducting a job interview in Spanish. Ask the candidate about their experience, strengths, and motivation. Correct grammar mistakes gently and keep the conversation formal.', '💼'),
('spanish', 'En el aeropuerto',         'Navega conversaciones típicas de aeropuerto en español.',                                          'You are an airport staff member in a Spanish-speaking country. Help the passenger with check-in, gate information, and directions. Use natural airport vocabulary.', '✈️'),
('spanish', 'Reunión de negocios',      'Simula una reunión de trabajo profesional en español.',                                             'You are a business partner in a Spanish-speaking country attending a meeting. Discuss project updates, deadlines, and team dynamics. Maintain a professional but friendly tone.', '📊'),
('spanish', 'Conversación cotidiana',   'Practica charlas informales del día a día en español.',                                            'You are a friendly local in a Spanish-speaking country making small talk. Discuss weather, weekend plans, food, and local culture. Keep the tone casual and natural.', '☕'),
('spanish', 'En el restaurante',        'Ordena comida y conversa en un restaurante hispanohablante.',                                      'You are a waiter in a Spanish restaurant. Take the customer''s order, describe the menu, make recommendations, and handle any requests or complaints naturally.', '🍽️'),
('spanish', 'En el médico',             'Practica describir síntomas y entender consejos médicos en español.',                              'You are a doctor in a Spanish-speaking clinic. Ask the patient about their symptoms, give a diagnosis, and prescribe treatment. Use clear medical vocabulary appropriate for the patient''s level.', '🏥'),
('spanish', 'Comprando ropa',           'Simula una compra en una tienda de ropa en español.',                                              'You are a shop assistant in a clothing store in Spain or Latin America. Help the customer find their size, suggest outfits, and process the purchase. Use natural retail vocabulary.', '🛍️');
