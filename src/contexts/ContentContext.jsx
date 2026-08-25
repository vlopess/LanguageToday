import {createContext, useContext, useEffect, useRef, useState} from 'react';
import { useAuth } from './AuthContext.jsx';
import { getChatSessions, getSavedStories, getStudyTopics, saveStudyTopics, deleteStudyTopics, getDailyStories, saveDailyStories } from '../lib/db.js';
import { fetchLanguages, getLanguageMeta, DEFAULT_SUPPORT_LANGUAGE } from '../lib/languages.js';
import { CURRICULUM, generateAcademicPath } from '../lib/generateTopics.js';
import { generateAndSaveSession } from '../lib/generateSession.js';
import { migrateOldSessionKeys, getCurrentSessionId, getSessions, saveSession } from '../lib/sessions.js';

const ContentContext = createContext(null);

// Legacy per-language localStorage suffixes (-en/-es/-cz) → generic -${code}
const LEGACY_CHAT_KEYS = [
    ['chatHistory-en', 'chatHistory-english'],
    ['chatHistory-es', 'chatHistory-spanish'],
    ['chatHistory-cz', 'chatHistory-czech'],
    ['currentChat-en', 'currentChat-english'],
    ['currentChat-es', 'currentChat-spanish'],
    ['currentChat-cz', 'currentChat-czech'],
];

function migrateLegacyChatKeys() {
    for (const [legacy, modern] of LEGACY_CHAT_KEYS) {
        if (localStorage.getItem(modern) !== null || localStorage.getItem(legacy) === null) continue;
        localStorage.setItem(modern, localStorage.getItem(legacy));
    }
}

// Load session data from the sessions array into state
function loadCurrentSession() {
    const migrated = migrateOldSessionKeys();
    if (migrated) return migrated;

    const id = getCurrentSessionId();
    if (!id) return null;
    const sessions = getSessions();
    return sessions.find(s => s.id === id) || null;
}

export function ContentProvider({ children }) {

    const [languages, setLanguages] = useState([]);
    const [languageMeta, setLanguageMeta] = useState(null);
    const [studyMaterialLoading, setStudyMaterialLoading] = useState(false);

    const getChatHistoryKey = (lang) => `chatHistory-${lang}`;
    const getCurrentChatKey = (lang) => `currentChat-${lang}`;

    // Session data — hydrated from the sessions array on mount
    const [sessionTasks, setSessionTasks] = useState(() => {
        const session = loadCurrentSession();
        return session?.tasks || [];
    });

    const [reviewTasks, setReviewTasks] = useState(() => {
        const session = loadCurrentSession();
        return session?.reviewTasks || [];
    });

    const [sessionStories, setSessionStories] = useState(() => {
        const session = loadCurrentSession();
        return session?.stories || [];
    });
    const [sessionStoriesLoading, setSessionStoriesLoading] = useState(false);

    const [selectedStory, setSelectedStory] = useState(() => {
        const stored = localStorage.getItem('selectedStory');
        return stored ? JSON.parse(stored) : null;
    });

    const [userProfile, setUserProfile] = useState(() => {
        const stored = localStorage.getItem('userProfile');
        return stored
            ? JSON.parse(stored)
            : { name: '', level: 'beginner', dailyTime: '15', completedOnboarding: false, supportLanguage: DEFAULT_SUPPORT_LANGUAGE };
    });

    const [savedStories, setSavedStories] = useState(() => {
        const stored = localStorage.getItem('savedStories');
        return stored ? JSON.parse(stored) : [];
    });

    // No hardcoded default language: null means "not chosen yet".
    const [currentLanguage, setCurrentLanguage]  = useState(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('currentLanguage'));
            return typeof stored === 'string' ? stored : null;
        } catch {
            return null;
        }
    });

    const { userId } = useAuth();

    const [studyMaterial, setStudyMaterial] = useState([]);

    const [selectedStudyTopic, setSelectedStudyTopic] = useState(() => {
        const stored = localStorage.getItem('selectedStudyTopic');
        return stored ? JSON.parse(stored) : null;
    });

    const [chatHistory, setChatHistory] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [needsSessionGeneration, setNeedsSessionGeneration] = useState(false);

    /* ── Language catalog ── */
    useEffect(() => {
        let cancelled = false;
        fetchLanguages().then(list => {
            if (!cancelled) setLanguages(list);
        });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        setLanguageMeta(getLanguageMeta(currentLanguage, languages));
    }, [currentLanguage, languages]);

    /* ── Chat storage (per target language) ── */
    useEffect(() => {
        migrateLegacyChatKeys();
    }, []);

    useEffect(() => {
        if (!currentLanguage) return;
        const historyKey = getChatHistoryKey(currentLanguage);
        const currentChatKey = getCurrentChatKey(currentLanguage);

        const storedHistory = localStorage.getItem(historyKey);
        const storedCurrentChat = localStorage.getItem(currentChatKey);

        const parseChat = (chat) => {
            if (!chat?.scenario) return chat;
            const { icon: _icon, ...scenario } = chat.scenario;
            return { ...chat, scenario };
        };

        const parsedHistory = storedHistory
            ? JSON.parse(storedHistory).map(parseChat)
            : [];
        const parsedCurrentChat = storedCurrentChat
            ? parseChat(JSON.parse(storedCurrentChat))
            : null;

        setChatHistory(parsedHistory);
        setCurrentChat(parsedCurrentChat);

    }, [currentLanguage]);

    /* ── Persist session data back to sessions array ── */
    useEffect(() => {
        const id = getCurrentSessionId();
        if (!id) return;
        const sessions = getSessions();
        const idx = sessions.findIndex(s => s.id === id);
        if (idx < 0) return;
        sessions[idx].tasks = sessionTasks;
        sessions[idx].reviewTasks = reviewTasks;
        sessions[idx].stories = sessionStories;
        localStorage.setItem('sessions', JSON.stringify(sessions));
    }, [sessionTasks, reviewTasks, sessionStories]);

    useEffect(() => {
        localStorage.setItem('selectedStory', JSON.stringify(selectedStory));
    }, [selectedStory]);

    useEffect(() => {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }, [userProfile]);

    useEffect(() => {
        localStorage.setItem('selectedStudyTopic', JSON.stringify(selectedStudyTopic));
    }, [selectedStudyTopic]);

    useEffect(() => {
        localStorage.setItem('savedStories', JSON.stringify(savedStories));
    }, [savedStories]);

    useEffect(() => {
        if (!currentLanguage) return;
        localStorage.setItem('currentLanguage', JSON.stringify(currentLanguage));

        const historyKey = getChatHistoryKey(currentLanguage);
        localStorage.setItem(historyKey, JSON.stringify(chatHistory));
    }, [chatHistory, currentLanguage]);

    useEffect(() => {
        if (!currentLanguage) return;
        const currentChatKey = getCurrentChatKey(currentLanguage);
        localStorage.setItem(currentChatKey, JSON.stringify(currentChat));
    }, [currentChat, currentLanguage]);

    // Fires only on login to trigger session selection
    useEffect(() => {
        if (!userId) return;
        if (sessionStorage.getItem('freshLogin') === 'true') {
            sessionStorage.removeItem('freshLogin');
            setNeedsSessionGeneration(true);
        }
    }, [userId]);

    // Reload DB data whenever user or language changes
    useEffect(() => {
        if (!userId || !currentLanguage) return;
        let cancelled = false;

        // Load saved stories from DB (language-scoped)
        getSavedStories(userId, currentLanguage).then(stories => {
            if (cancelled) return;
            setSavedStories(stories);
        });

        // Load chat history from DB (language-scoped)
        getChatSessions(userId, currentLanguage).then(chats => {
            if (cancelled) return;
            if (chats.length > 0) {
                setChatHistory(chats);
                setCurrentChat(chats[0]);
            }
        });

        return () => { cancelled = true; };
    }, [userId, currentLanguage]);

    /* ── Stories: shared DB cache → AI fallback ── */
    const storiesGeneratingRef = useRef(false);

    useEffect(() => {
        if (!currentLanguage) return;
        if (storiesGeneratingRef.current) return;
        storiesGeneratingRef.current = true;
        setSessionStoriesLoading(true);

        (async () => {
            try {
                let stories = await getDailyStories(currentLanguage);

                if (stories.length === 0) {
                    const profile = userProfile || {};
                    const supportLang = profile.supportLanguage || DEFAULT_SUPPORT_LANGUAGE;
                    const content = await generateAndSaveSession(null, currentLanguage, profile, supportLang);
                    stories = Array.isArray(content.stories) ? content.stories : [];
                    if (stories.length) {
                        await saveDailyStories(currentLanguage, stories);
                    }
                }

                setSessionStories(stories);
            } catch (err) {
                console.error('[Content] stories loading failed:', err);
                setSessionStories([]);
            } finally {
                setSessionStoriesLoading(false);
                storiesGeneratingRef.current = false;
            }
        })();
    }, [currentLanguage, userProfile?.level]);

    /* ── Academic path: fixed 10-step curriculum; cache → shared DB → AI ── */
    const generatingRef = useRef(false);

    useEffect(() => {
        if (!currentLanguage) return;
        const level = userProfile?.level || 'A1';
        const cacheKey = `studyMaterial-v2-${currentLanguage}-${level}`;

        // Instant cache hit (localStorage or previously fetched in this session)
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            setStudyMaterial(JSON.parse(cached));
            setStudyMaterialLoading(false);
            return;
        }

        if (generatingRef.current) return;
        generatingRef.current = true;
        setStudyMaterial([]);
        setStudyMaterialLoading(true);

        (async () => {
            try {
                // 1. Shared content already generated by any user?
                let topics = await getStudyTopics(currentLanguage, level);

                // Rows must mirror the fixed curriculum exactly — older
                // free-form generations fail this check and get regenerated.
                const matchesCurriculum = topics.length === CURRICULUM.length &&
                    CURRICULUM.every((step, i) => topics[i]?.topic === step.title);

                // 2. Stale or missing → generate with AI and share globally
                if (!matchesCurriculum) {
                    topics = await generateAcademicPath({
                        targetLanguageName: getLanguageMeta(currentLanguage)?.name || currentLanguage,
                        supportLanguage: userProfile?.supportLanguage || DEFAULT_SUPPORT_LANGUAGE,
                        level,
                    });
                    if (topics.length) {
                        await deleteStudyTopics(currentLanguage, level);
                        saveStudyTopics(currentLanguage, level, topics);
                    }
                }

                if (topics.length) localStorage.setItem(cacheKey, JSON.stringify(topics));
                setStudyMaterial(topics);
            } catch (err) {
                console.error('[Content] academic topics generation failed:', err);
                setStudyMaterial([]);
            } finally {
                setStudyMaterialLoading(false);
                generatingRef.current = false;
            }
        })();
    }, [currentLanguage, userProfile?.level]);

    return (
        <ContentContext.Provider value={{
            userProfile,
            setUserProfile,
            sessionTasks,
            setSessionTasks,
            reviewTasks,
            setReviewTasks,
            sessionStories,
            setSessionStories,
            sessionStoriesLoading,
            selectedStory,
            setSelectedStory,
            studyMaterial,
            studyMaterialLoading,
            selectedStudyTopic,
            setSelectedStudyTopic,
            savedStories,
            setSavedStories,
            chatHistory,
            setChatHistory,
            currentChat,
            setCurrentChat,
            currentLanguage,
            setCurrentLanguage,
            needsSessionGeneration,
            setNeedsSessionGeneration,
            languages,
            languageMeta,
        }}>
            {children}
        </ContentContext.Provider>
    );
}

export function useContent() {
    const context = useContext(ContentContext);

    if (!context) {
        throw new Error('useContext must be used inside ContentContext');
    }

    return context;
}
