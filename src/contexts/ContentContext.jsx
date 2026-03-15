import {createContext, useContext, useEffect, useState} from 'react';
import { useAuth } from './AuthContext.jsx';
import { getChatSessions, getSavedStories } from '../lib/db.js';

const ContentContext = createContext(null);

export function ContentProvider({ children }) {

    const getChatHistoryKey = (lang) => {
        if (lang === "english") return "chatHistory-en";
        if (lang === "spanish") return "chatHistory-es";
        return "chatHistory-cz";
    };

    const getCurrentChatKey = (lang) => {
        if (lang === "english") return "currentChat-en";
        if (lang === "spanish") return "currentChat-es";
        return "currentChat-cz";
    };

    const [sessionTasks, setSessionTasks] = useState(() => {
        const stored = localStorage.getItem('sessionTasks');
        return stored ? JSON.parse(stored) : [];
    });

    const [reviewTasks, setReviewTasks] = useState(() => {
        const stored = localStorage.getItem('reviewTasks');
        return stored ? JSON.parse(stored) : [];
    });

    const [sessionStories, setSessionStories] = useState(() => {
        const stored = localStorage.getItem('sessionStories');
        return stored ? JSON.parse(stored) : [];
    });

    const [selectedStory, setSelectedStory] = useState(() => {
        const stored = localStorage.getItem('selectedStory');
        return stored ? JSON.parse(stored) : null;
    });

    const [userProfile, setUserProfile] = useState(() => {
        const stored = localStorage.getItem('userProfile');
        return stored
            ? JSON.parse(stored)
            : { name: '', level: 'beginner', dailyTime: '15', completedOnboarding: false };
    });

    const [savedStories, setSavedStories] = useState(() => {
        const stored = localStorage.getItem('savedStories');
        return stored ? JSON.parse(stored) : [];
    });

    const [currentLanguage, setCurrentLanguage]  = useState(() => {
        const stored = localStorage.getItem('currentLanguage');
        return stored ? JSON.parse(stored) : 'czech';
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

    useEffect(() => {
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

    useEffect(() => {
        localStorage.setItem('sessionTasks', JSON.stringify(sessionTasks));
    }, [sessionTasks]);

    useEffect(() => {
        localStorage.setItem('reviewTasks', JSON.stringify(reviewTasks));
    }, [reviewTasks]);

    useEffect(() => {
        localStorage.setItem('sessionStories', JSON.stringify(sessionStories));
    }, [sessionStories]);

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
        const historyKey = getChatHistoryKey(currentLanguage);
        localStorage.setItem(historyKey, JSON.stringify(chatHistory));
    }, [chatHistory]);

    useEffect(() => {
        console.log('currentChat', currentChat);
        const currentChatKey = getCurrentChatKey(currentLanguage);
        localStorage.setItem(currentChatKey, JSON.stringify(currentChat));
    }, [currentChat]);


    useEffect(() => {
        if (!userId) return;

        // Only force new session generation on actual login, not on page reload
        if (sessionStorage.getItem('freshLogin') === 'true') {
            sessionStorage.removeItem('freshLogin');
            setNeedsSessionGeneration(true);
        }

        // Load saved stories from DB
        getSavedStories(userId, currentLanguage).then(stories => {
            if (stories.length > 0) setSavedStories(stories);
        });

        // Load chat history from DB
        getChatSessions(userId, currentLanguage).then(chats => {
            if (chats.length > 0) {
                setChatHistory(chats);
                setCurrentChat(chats[0]);
            }
        });

    }, [userId]); // Only fire on login (userId change)

    useEffect(() => {
        localStorage.setItem('currentLanguage', JSON.stringify(currentLanguage));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStudyMaterial(
            () => {
                if (currentLanguage === "spanish") {
                    return [
                        {
                            topic: "Presentarte",
                            emoji: "👋",
                            keyPhrases: `**¡Hola!**
                [OH-la]
                Oi!

                **Buenos días**
                [BWEH-nos DEE-as]
                Bom dia

                **Me llamo Juan.**
                [meh YA-mo hwan]
                Meu nome é Juan.

                **Soy estudiante.**
                [soy es-tood-YAHN-teh]
                Sou estudante.

                **Tengo 25 años.**
                Tenho 25 anos.

                **Soy de Brasil.**
                Sou do Brasil.`,
                            pattern: `**Me llamo** = usado APENAS para dizer seu nome.

                **Soy** = usado para profissão, nacionalidade e origem.

                Exemplos:
                - Me llamo Ana.
                - Soy profesora.
                - Soy brasileña.`,
                            practice: `1. Diga seu nome em espanhol.
                2. Diga sua profissão.
                3. Diga sua idade.
                4. Diga de onde você é.
                5. Combine tudo em uma apresentação.`,
                            quickReview: `Qual verbo usa para dizer seu nome em espanhol?`
                        },
                        {
                            topic: "Ser vs Estar",
                            emoji: "⚖️",
                            keyPhrases: `**Soy** (ser) — identidade permanente
                **Estoy** (estar) — estado temporário

                Soy médico. (profissão)
                Estoy cansado. (estado físico)
                Soy de México. (origem)
                Estoy en casa. (localização)`,
                            pattern: `**SER** → identidade, profissão, origem, características permanentes.
                **ESTAR** → estados temporários, emoções, localização.

                Cuidado: "Soy feliz" (geralmente feliz) vs "Estoy feliz" (agora feliz)`,
                            practice: `Complete com ser ou estar:
                1. Yo ___ estudiante.
                2. Ella ___ cansada.
                3. Nosotros ___ en Madrid.
                4. Él ___ médico.
                5. ¿Cómo ___ tú?`,
                            quickReview: `Qual a diferença entre "Soy enfermo" e "Estoy enfermo"?`
                        },
                        {
                            topic: "Frases Essenciais",
                            emoji: "🆘",
                            keyPhrases: `Por favor
                Gracias
                De nada
                Perdón / Disculpe
                Sí / No / Quizás
                No entiendo
                ¿Puede repetir?
                ¿Cuánto cuesta?
                ¿Dónde está el baño?
                ¿Habla portugués?
                Mucho gusto
                Hasta luego`,
                            pattern: `Estrutura de perguntas básicas:
                - ¿Dónde? → Onde?
                - ¿Cómo? → Como?
                - ¿Qué? → O quê?
                - ¿Cuánto? → Quanto?
                - ¿Por qué? → Por quê?`,
                            practice: `Traduza para espanhol:
                1. Com licença, onde fica o banheiro?
                2. Quanto custa?
                3. Não entendo.
                4. Pode repetir, por favor?`,
                            quickReview: `Como se diz "Muito prazer" em espanhol?`
                        },
                        {
                            topic: "Números",
                            emoji: "🔢",
                            keyPhrases: `0 cero
                1 uno
                2 dos
                3 tres
                4 cuatro
                5 cinco
                10 diez
                20 veinte
                30 treinta
                100 cien / ciento`,
                            pattern: `De 16 a 19: formas contraídas
                16 → dieciséis (não "diez y seis")
                21 → veintiuno (não "veinte y uno")

                De 31 em diante: separado com "y"
                31 → treinta y uno`,
                            practice: `Diga em espanhol:
                1. Sua idade
                2. Seu número de telefone
                3. Preços: 15, 47, 83`,
                            quickReview: `Como se diz 21 em espanhol?`
                        },
                    ];
                }

                if (currentLanguage === "english") {
                    return [
                        {
                            topic: "Introduce Yourself",
                            emoji: "👋",
                            keyPhrases: `**Hi!**
                    [hai]
                    
                    **Hello**
                    [heh-loh]
                    
                    **My name is John.**
                    
                    **I am a student.**
                    
                    **I am 25 years old.**
                    
                    **I am from Brazil.**`,
                            pattern: `**My name is + Name** → Used to introduce yourself.
    
                    **I am + profession/nationality/age**
                    
                    Examples:
                    - My name is Anna.
                    - I am a teacher.
                    - I am Brazilian.`,
                            practice: `1. Say your name.
                    2. Say your profession.
                    3. Say your age.
                    4. Say where you are from.
                    5. Combine everything in one introduction.`,
                            quickReview: `1) How do you introduce your name?
                    2) Translate: "Eu sou engenheiro."
                    3) Correct: "I am 25 years."`
                        },
                        {
                            topic: "Formal / Informal",
                            emoji: "👔",
                            keyPhrases: `**Hi** (informal)
                    **Hello** (neutral)
                    **Good morning**
                    **Good afternoon**
                    **Good evening**
                    
                    **How are you?**`,
                            pattern: `Formal English often uses:
                    - Good morning
                    - Good afternoon
                    - Good evening
                    
                    Informal:
                    - Hi
                    - Hey
                    
                    Rule: In professional situations → avoid slang.`,
                            practice: `Choose appropriate greeting:
                    1. Talking to your boss
                    2. Talking to your friend
                    3. Job interview
                    4. Talking to a child`,
                            quickReview: `Which greeting is safest in professional settings?`
                        },
                        {
                            topic: "Start a Conversation",
                            emoji: "💬",
                            keyPhrases: `How are you?
                    Where are you from?
                    What do you do?
                    Nice to meet you.`,
                            pattern: `Conversation Example:
                    
                    1. A: Hi! How are you?
                    2. B: I'm good, thanks. And you?
                    3. A: I'm fine.
                    4. A: What's your name?
                    5. B: My name is Eva.
                    6. A: Where are you from?
                    7. B: I'm from Brazil.
                    8. A: What do you do?
                    9. B: I'm a student.`,
                            practice: `Change names, countries and professions.
                    Practice aloud.
                    Swap roles.`,
                            quickReview: `What question asks about profession?`
                        },
                        {
                            topic: "Basic Phrases",
                            emoji: "🆘",
                            keyPhrases: `Please
                    Thank you
                    Excuse me
                    Yes
                    No
                    Maybe
                    I don't understand
                    I understand
                    Help!
                    How much is it?
                    Where is the bathroom?
                    Do you speak Portuguese?
                    Nice to meet you
                    Goodbye`,
                            pattern: `Common question starters:
                    - Where
                    - How
                    - What
                    - Why
                    
                    Structure:
                    Question word + auxiliary verb + subject`,
                            practice: `Match English phrases to Portuguese.`,
                            quickReview: `Translate: "Você entende?"`
                        },
                        {
                            topic: "Alphabet",
                            emoji: "🔤",
                            keyPhrases: `A, B, C, D, E, F, G...
                    Pronunciation example:
                    A (ei)
                    B (bi)
                    C (si)
                    D (di)
                    E (i)
                    F (ef)`,
                            pattern: `English vowels have multiple sounds.
                    Example:
                    A → /æ/ (cat) or /ei/ (name)
                    
                    Spelling is not phonetic.`,
                            practice: `Spell your name aloud.
                    Spell your city.`,
                            quickReview: `How do you spell your name?`
                        },
                        {
                            topic: "Numbers",
                            emoji: "🔢",
                            keyPhrases: `0 zero
                    1 one
                    2 two
                    3 three
                    4 four
                    5 five
                    10 ten
                    20 twenty
                    30 thirty
                    100 one hundred`,
                            pattern: `After 20:
                    21 → twenty-one
                    22 → twenty-two
                    
                    Structure:
                    Tens + hyphen + unit`,
                            practice: `Say your age.
                    Say prices.
                    Count from 1 to 20.`,
                            quickReview: `How do you say 45?`
                        }
                    ];
                }

                // DEFAULT → CZECH
                return [
                    {
                        topic: "Introduce yourself",
                        emoji: "👋",
                        keyPhrases: `**Ahoj!**
                [ah-hoy]
                Hi!
                
                **Dobrý den**
                [doh-bree den]
                Good day / Hello (formal)
                
                **Jmenuju se Petr.**
                [ymeh-noo-yoo seh pehtr]
                My name is Petr.
                
                **Jsem student.**
                [ysem stoo-dent]
                I am a student.
                
                **Je mi 25 let.**
                I am 25 years old.
                
                **Pocházím z Brazílie.**
                I come from Brazil.`,
                        pattern: `**Jmenuju se** = used ONLY to say your name.
                
                **Jsem** = used for profession/nationality.`,
                        practice: `1. Say your name.
                2. Say your profession.
                3. Combine both.`,
                        quickReview: `Which verb introduces your name?`
                    }
                ];
            }
        );

    }, [currentLanguage]);




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
            selectedStory,
            setSelectedStory,
            studyMaterial,
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
