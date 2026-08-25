import { supabase } from './supabase.js';

// ─── Saved Stories ────────────────────────────────────────────────────────────

export async function getSavedStories(userId, language) {
    if (!userId) return [];
    const { data, error } = await supabase
        .from('saved_stories')
        .select('id, title, icon, language_text, original_text, language')
        .eq('user_id', userId)
        .eq('language', language)
        .order('created_at', { ascending: false });
    if (error) { console.error('[db] getSavedStories:', error.message); return []; }
    return (data || []).map(s => ({
        id: s.id,
        title: s.title,
        icon: s.icon,
        languageText: s.language_text,
        originalText: s.original_text,
        language: s.language,
    }));
}

export async function saveStory(userId, story, language) {
    if (!userId) return;
    const { error } = await supabase.from('saved_stories').upsert({
        user_id: userId,
        language,
        title: story.title ?? '',
        icon: story.icon ?? '',
        language_text: story.languageText ?? '',
        original_text: story.originalText ?? '',
    }, { onConflict: 'user_id,language,title' });
    if (error) console.error('[db] saveStory:', error.message);
}

export async function removeSavedStory(userId, title) {
    if (!userId) return;
    const { error } = await supabase
        .from('saved_stories')
        .delete()
        .eq('user_id', userId)
        .eq('title', title);
    if (error) console.error('[db] removeSavedStory:', error.message);
}

// ─── Daily Stories (shared per language, cached like study_topics) ─────────────

export async function getDailyStories(language) {
    if (!language) return [];
    const { data, error } = await supabase
        .from('daily_stories')
        .select('title, icon, language_text, original_text')
        .eq('language', language)
        .order('sort_order');
    if (error) { console.error('[db] getDailyStories:', error.message); return []; }
    return (data || []).map(s => ({
        title: s.title,
        icon: s.icon,
        languageText: s.language_text,
        originalText: s.original_text,
    }));
}

export async function saveDailyStories(language, stories) {
    if (!language || !Array.isArray(stories) || stories.length === 0) return;
    const rows = stories.map((s, i) => ({
        language,
        title: s.title ?? '',
        icon: s.icon ?? '',
        language_text: s.languageText ?? '',
        original_text: s.originalText ?? '',
        sort_order: i,
    }));
    const { error } = await supabase
        .from('daily_stories')
        .upsert(rows, { onConflict: 'language,title' });
    if (error) console.error('[db] saveDailyStories:', error.message);
}

// ─── Chat Sessions ─────────────────────────────────────────────────────────────

export async function createChatSession(userId, language, scenario = null) {
    if (!userId) return null;
    const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
            user_id: userId,
            language,
            label: new Date().toLocaleDateString(),
            last_message_at: Date.now(),
            scenario_data: scenario ?? null,
        })
        .select('id')
        .single();
    if (error) {
        console.error('[db] createChatSession:', error.message);
        return null;
    }
    return data.id;
}

export async function addChatMessage(chatSupabaseId, message) {
    if (!chatSupabaseId) return;
    const { error } = await supabase.from('chat_messages').insert({
        chat_session_id: chatSupabaseId,
        role: message.role,
        text: message.text,
        is_initial: message.isInitial ?? false,
        created_at_ms: message.createdAt ?? Date.now(),
    });
    if (error) console.error('[db] addChatMessage:', error.message);
}

export async function updateChatSessionTimestamp(chatSupabaseId) {
    if (!chatSupabaseId) return;
    const { error } = await supabase
        .from('chat_sessions')
        .update({ last_message_at: Date.now() })
        .eq('id', chatSupabaseId);
    if (error) console.error('[db] updateChatSessionTimestamp:', error.message);
}

export async function deleteChatSession(supabaseId) {
    if (!supabaseId) return;
    // chat_messages deletes via CASCADE
    const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', supabaseId);
    if (error) console.error('[db] deleteChatSession:', error.message);
}

// ─── Study Sessions (Frequency Tracking) ──────────────────────────────────────

export async function recordStudySession(userId, language, durationMinutes) {
    if (!userId) return null;
    const { data, error } = await supabase
        .from('study_sessions')
        .insert({ user_id: userId, language, duration_minutes: durationMinutes })
        .select('id, completed_at')
        .single();
    if (error) { console.error('[db] recordStudySession:', error.message); return null; }
    return data;
}

export async function getStudySessions(userId, language) {
    if (!userId) return [];
    const { data, error } = await supabase
        .from('study_sessions')
        .select('id, duration_minutes, completed_at')
        .eq('user_id', userId)
        .eq('language', language)
        .order('completed_at', { ascending: false })
        .limit(100);
    if (error) { console.error('[db] getStudySessions:', error.message); return []; }
    return data || [];
}

// ─── Study Topics (AI-generated academic path, shared per language+level) ─────

export async function getStudyTopics(language, level) {
    if (!language) return [];
    const { data, error } = await supabase
        .from('study_topics')
        .select('title, emoji, key_phrases, pattern, practice, quick_review')
        .eq('language', language)
        .eq('level', level)
        .order('sort_order');
    if (error) { console.error('[db] getStudyTopics:', error.message); return []; }
    return (data || []).map(t => ({
        topic: t.title,
        emoji: t.emoji,
        keyPhrases: t.key_phrases,
        pattern: t.pattern,
        practice: t.practice,
        quickReview: t.quick_review,
    }));
}

export async function saveStudyTopics(language, level, topics) {
    if (!language || !Array.isArray(topics) || topics.length === 0) return;
    const rows = topics.map((t, i) => ({
        language,
        level,
        title: t.topic ?? '',
        emoji: t.emoji ?? '',
        key_phrases: t.keyPhrases ?? '',
        pattern: t.pattern ?? '',
        practice: t.practice ?? '',
        quick_review: t.quickReview ?? '',
        sort_order: i,
    }));
    const { error } = await supabase
        .from('study_topics')
        .upsert(rows, { onConflict: 'language,level,title' });
    if (error) console.error('[db] saveStudyTopics:', error.message);
}

export async function deleteStudyTopics(language, level) {
    if (!language) return;
    const { error } = await supabase
        .from('study_topics')
        .delete()
        .eq('language', language)
        .eq('level', level);
    if (error) console.error('[db] deleteStudyTopics:', error.message);
}

// ─── Chat Sessions ─────────────────────────────────────────────────────────────

export async function getChatSessions(userId, language) {
    if (!userId) return [];
    const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select('id, label, last_message_at, created_at, scenario_data')
        .eq('user_id', userId)
        .eq('language', language)
        .order('last_message_at', { ascending: false })
        .limit(30);
    if (error) { console.error('[db] getChatSessions:', error.message); return []; }

    const chatsWithMessages = await Promise.all((sessions || []).map(async (session) => {
        const { data: messages } = await supabase
            .from('chat_messages')
            .select('role, text, is_initial, created_at_ms')
            .eq('chat_session_id', session.id)
            .order('created_at_ms', { ascending: true });
        return {
            id: session.id,
            supabase_id: session.id,
            date: session.label || new Date(session.created_at).toLocaleDateString(),
            scenario: session.scenario_data ?? null,
            messages: (messages || []).map(m => ({
                role: m.role,
                text: m.text,
                isInitial: m.is_initial,
                createdAt: m.created_at_ms,
            })),
            lastMessageAt: session.last_message_at || 0,
        };
    }));
    return chatsWithMessages;
}
