export const SPANISH_LEVEL_GUIDE = {
    A1: { label: "Principiante",           focus: "presente simple, vocabulário básico (100 palavras mais comuns), frases afirmativas, saudações, números, cores.",                                                       avoid: "tempos complexos, orações subordinadas, idiomas" },
    A2: { label: "Elementar",              focus: "pretérito indefinido, futuro com 'ir a', perguntas básicas, adjetivos e advérbios comuns, verbos reflexivos básicos.",                                                  avoid: "subjuntivo, voz passiva, vocabulário avançado" },
    B1: { label: "Intermediário",          focus: "pretérito perfecto vs indefinido, imperfecto, ser vs estar, verbos reflexivos, frases preposicionais comuns.",                                                           avoid: "subjuntivo complexo, condicional composto, colocações avançadas" },
    B2: { label: "Intermediário-Avançado", focus: "subjuntivo presente, condicional simples, voz passiva, discurso indireto, verbos que exigem subjuntivo.",                                                               avoid: "inversão complexa, nominalização, registros altamente formais" },
    C1: { label: "Avançado",               focus: "subjuntivo imperfeito, condicional composto, nominalização, colocações avançadas, linguagem de atenuação.",                                                             avoid: "nada — exigir precisão analítica" },
    C2: { label: "Proficiente",            focus: "nuance nativa, precisão idiomática, variação de registro estilístico, colocações raras, coerência discursiva.",                                                         avoid: "nada — empurrar os limites do domínio linguístico" },
};

export const CZECH_LEVEL_GUIDE = {
    A1: "absolute basics: greetings, numbers, colors, family, basic nouns. Present tense only. No cases yet.",
    A2: "everyday vocabulary, accusative case, simple past (byl/byla), common adjectives, negation.",
    B1: "nominative/accusative/dative cases, verb aspects (perfective vs imperfective), common idioms, future tense.",
    B2: "all 7 cases, complex verb conjugations, conditional mood, passive voice, nuanced vocabulary.",
    C1: "advanced grammar nuances, idiomatic expressions, stylistic variation, formal vs colloquial registers.",
    C2: "native-level mastery: fixed phrases, regional expressions, literary vocabulary, subtle aspect differences.",
};

export const ENGLISH_LEVEL_GUIDE = {
    A1: { label: "Beginner",           focus: "simple present, basic vocabulary (100 most common words), affirmative sentences, greetings.",                                                      avoid: "complex tenses, subordinate clauses, idioms" },
    A2: { label: "Elementary",         focus: "simple past, future with 'going to', basic questions, common adjectives and adverbs.",                                                             avoid: "conditionals, passive voice, advanced vocabulary" },
    B1: { label: "Intermediate",       focus: "present perfect, first conditional, modal verbs (can/could/should/must), common phrasal verbs.",                                                   avoid: "inversion, mixed conditionals, advanced collocations" },
    B2: { label: "Upper-Intermediate", focus: "passive voice, reported speech, second and third conditionals, phrasal verbs, discourse markers.",                                                 avoid: "complex inversion, nominalization, highly formal registers" },
    C1: { label: "Advanced",           focus: "inversion, mixed conditionals, modal perfects, nominalization, subjunctive, hedging language, advanced collocations.",                             avoid: "nothing — demand analytical precision" },
    C2: { label: "Proficient",         focus: "native-level nuance, idiomatic precision, stylistic register shifts, rare collocations, discourse-level coherence.",                               avoid: "nothing — push limits of language mastery" },
};

export function fixSentenceBuilderTasks(tasks) {
    return tasks.map(task => {
        if (task.type !== 'sentence-builder') return task;
        // If model provided targetSentence, derive correctOrder from it (most reliable source)
        let correct = Array.isArray(task.correctOrder) ? task.correctOrder : [];
        if (task.targetSentence && typeof task.targetSentence === 'string') {
            const derived = task.targetSentence.trim().split(/\s+/);
            if (derived.length > 0) correct = derived;
        }
        // Ensure all correctOrder tokens are present in options
        const opts = Array.isArray(task.options) ? task.options : [];
        const missing = correct.filter(token => !opts.includes(token));
        const fixed = missing.length > 0
            ? [...opts, ...missing].sort(() => Math.random() - 0.5)
            : opts;
        return { ...task, correctOrder: correct, options: fixed };
    });
}

async function callGroq(messages, apiKey) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages,
            temperature: 0.4,
            max_tokens: 4096,
            response_format: { type: 'json_object' },
        }),
    });
    if (!response.ok) throw new Error(await response.text());
    const result = await response.json();
    return JSON.parse(result.choices?.[0]?.message?.content);
}

export async function generateCzechSession(profile) {
    const systemPrompt = `You are an expert Czech language tutor. Generate a JSON study session with this EXACT structure:
{ "tasks": [5 items], "stories": [2 items], "reviewTasks": [10 items] }

STUDENT: ${profile.name} | LEVEL: ${profile.level} | DAILY GOAL: ${profile.dailyTime} min
LEVEL SCOPE: ${CZECH_LEVEL_GUIDE[profile.level] || CZECH_LEVEL_GUIDE.A1}

══════════════════════════════════════
TASKS — exactly 5, in this exact order:
  1. active-recall
  2. sentence-builder
  3. feynman
  4. error-correction
  5. active-recall
══════════════════════════════════════

TASK TYPE "active-recall":
{
  "type": "active-recall",
  "prompt": "Short English question asking for a specific Czech word or short phrase. E.g.: How do you say 'library' in Czech?",
  "answer": "THE CZECH WORD OR SHORT PHRASE ONLY. No English. No punctuation. No explanations. Max 4 words. E.g.: knihovna",
  "phonetic": "Phonetic guide in brackets, e.g.: [knih-OV-na]",
  "explain": "2-3 sentences in English: gender of the noun (or verb class), how it is used, one common mistake learners make.",
  "hint": "One subtle clue about the answer. E.g.: Feminine noun starting with K.",
  "example": "One complete Czech sentence using the answer, then an English translation in parentheses."
}

TASK TYPE "sentence-builder":
FOLLOW EXACTLY — generate fields in this order:
  1. "targetSentence": Write a Czech sentence (5-7 words) appropriate for level ${profile.level}.
  2. "prompt": Write the EXACT English translation of targetSentence. Nothing else — just the translation.
  3. "correctOrder": Split targetSentence word by word into an array. Punctuation stays attached to its word.
  4. "options": Take every element of correctOrder (copy each string exactly), add 2 Czech distractor words, shuffle the result.
  5. "grammarNote": One paragraph explaining the grammar rule in English.

EXAMPLE (use different content, same structure):
  targetSentence → "Kniha leží na stole."
  prompt         → "The book is on the table."
  correctOrder   → ["Kniha", "leží", "na", "stole."]
  options        → ["na", "stole.", "velká", "leží", "Kniha", "doma"]

OUTPUT FORMAT:
{
  "type": "sentence-builder",
  "targetSentence": "the Czech sentence",
  "prompt": "its English translation",
  "correctOrder": ["tokens", "of", "targetSentence"],
  "options": ["correctOrder", "tokens", "shuffled", "plus", "two", "distractors"],
  "grammarNote": "grammar explanation"
}

TASK TYPE "feynman":
{
  "type": "feynman",
  "prompt": "Explain [a specific, named Czech grammar concept appropriate for level ${profile.level}] as if teaching a friend who has never studied Czech.",
  "explain": "5-6 sentence expert explanation in English. Cover: what the concept is, when to use it, common exceptions, one example in Czech with translation.",
  "keyPoints": ["Key point 1 in English (one sentence)", "Key point 2 in English (one sentence)", "Key point 3 in English (one sentence)"]
}

TASK TYPE "error-correction":
{
  "type": "error-correction",
  "prompt": "Find and correct the grammatical error in this Czech sentence:",
  "sentence": "A Czech sentence with EXACTLY ONE clear, unambiguous grammar error suitable for level ${profile.level}. The error must be obvious enough for a student at this level to spot.",
  "correctedSentence": "The same sentence with ONLY the error fixed. No other changes.",
  "errorExplanation": "2-3 sentences in English: what the error is, the correct grammar rule, why students commonly make this mistake."
}

══════════════════════════════════════
STORIES — exactly 2
══════════════════════════════════════
{
  "title": "Czech story title",
  "icon": "single emoji",
  "languageText": "Czech text, minimum 200 words, vocabulary and grammar EXACTLY at level ${profile.level}. Use \\n for paragraph breaks.",
  "originalText": "Complete, accurate English translation of the Czech text above."
}

══════════════════════════════════════
REVIEW TASKS — exactly 10 flashcards
══════════════════════════════════════
{
  "prompt": "English word, phrase, or grammar concept to test",
  "answer": "Czech translation or correct usage (concise, max 8 words)",
  "emoji": "single relevant emoji",
  "explanation": "One sentence in English explaining usage or a common mistake."
}

VALIDATION CHECKLIST before outputting:
✓ tasks array has exactly 5 items in order: active-recall, sentence-builder, feynman, error-correction, active-recall
✓ Every token in sentence-builder correctOrder appears IDENTICALLY in options
✓ options has exactly correctOrder.length + 2 items
✓ active-recall answer field contains ONLY the Czech word/phrase, nothing else
✓ stories array has exactly 2 items
✓ reviewTasks array has exactly 10 items
✓ All grammar is appropriate for level ${profile.level}

Return ONLY the JSON object. No markdown. No comments. No text outside JSON.`;

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    return callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate the Czech study session now. Level: ${profile.level}. Return only JSON.` },
    ], apiKey);
}

export async function generateEnglishSession(profile) {
    const level = ENGLISH_LEVEL_GUIDE[profile.level] || ENGLISH_LEVEL_GUIDE.B1;

    const systemPrompt = `You are an expert English language tutor. Generate a JSON study session with this EXACT structure:
{ "tasks": [5 items], "stories": [2 items], "reviewTasks": [10 items] }

STUDENT: ${profile.name} | LEVEL: ${profile.level} (${level.label}) | DAILY GOAL: ${profile.dailyTime} min
CONTENT FOCUS: ${level.focus}
STRICTLY AVOID: ${level.avoid}

══════════════════════════════════════
TASKS — exactly 5, in this exact order:
  1. active-recall
  2. sentence-builder
  3. feynman
  4. error-correction
  5. active-recall
══════════════════════════════════════

TASK TYPE "active-recall":
{
  "type": "active-recall",
  "prompt": "Short question in Portuguese asking the student to produce a specific English word, phrase, or grammar structure. E.g.: Como se diz 'biblioteca' em inglês?",
  "answer": "THE ENGLISH WORD OR SHORT PHRASE ONLY. No Portuguese. No explanations. Max 6 words. E.g.: library",
  "phonetic": "IPA or simplified phonetic guide if pronunciation is non-obvious, else empty string",
  "explain": "3-4 sentences in English: what it means, how it is used grammatically, one common mistake to avoid.",
  "hint": "One subtle clue about the answer's form or function.",
  "example": "One complete English sentence using the answer in a realistic, natural context."
}

TASK TYPE "sentence-builder":
FOLLOW EXACTLY — generate fields in this order:
  1. "targetSentence": Write an English sentence (6-9 words) using grammar from CONTENT FOCUS for level ${profile.level}.
  2. "prompt": Write the EXACT Portuguese translation of targetSentence. Nothing else — just the translation.
  3. "correctOrder": Split targetSentence word by word into an array. Punctuation stays attached to its word.
  4. "options": Take every element of correctOrder (copy each string exactly), add 2 English distractor words, shuffle the result.
  5. "grammarNote": One paragraph explaining the grammar rule in English.

EXAMPLE (use different content, same structure):
  targetSentence → "She has never been to Paris."
  prompt         → "Ela nunca foi a Paris."
  correctOrder   → ["She", "has", "never", "been", "to", "Paris."]
  options        → ["been", "Paris.", "gone", "never", "She", "has", "to", "always"]

OUTPUT FORMAT:
{
  "type": "sentence-builder",
  "targetSentence": "the English sentence",
  "prompt": "its Portuguese translation",
  "correctOrder": ["tokens", "of", "targetSentence"],
  "options": ["correctOrder", "tokens", "shuffled", "plus", "two", "distractors"],
  "grammarNote": "grammar explanation"
}

TASK TYPE "feynman":
{
  "type": "feynman",
  "prompt": "Explain [a specific, named English grammar concept for level ${profile.level}] in your own words, as if teaching someone who never studied English.",
  "explain": "5-7 sentence expert explanation in English. Cover: what the concept is, when/how to use it, common exceptions, and one clear example with explanation.",
  "keyPoints": ["Key point 1 in English (one sentence)", "Key point 2 in English (one sentence)", "Key point 3 in English (one sentence)"]
}

TASK TYPE "error-correction":
{
  "type": "error-correction",
  "prompt": "Find and correct the grammatical error in this sentence:",
  "sentence": "An English sentence with EXACTLY ONE grammar error appropriate for level ${profile.level}. The error must be clearly wrong to a student at this level.",
  "correctedSentence": "The same sentence with ONLY the error fixed. No other changes.",
  "errorExplanation": "2-3 sentences in English: what the error is, the grammar rule that applies, and why learners commonly make this mistake."
}

══════════════════════════════════════
STORIES — exactly 2
══════════════════════════════════════
Choose engaging themes: technology, history, psychology, nature, everyday life.
{
  "title": "Engaging English title",
  "icon": "single emoji",
  "languageText": "English story, minimum 250 words. Grammar and vocabulary calibrated to level ${profile.level}. Use \\n for paragraph breaks.",
  "originalText": "Complete, accurate Portuguese translation of the full English story above."
}

══════════════════════════════════════
REVIEW TASKS — exactly 10 flashcards (ALWAYS)
══════════════════════════════════════
Focus on vocabulary, phrasal verbs, collocations, or grammar patterns for level ${profile.level}.
{
  "prompt": "Portuguese word or phrase to test English recall",
  "answer": "English equivalent (concise, max 10 words)",
  "emoji": "single relevant emoji",
  "explanation": "One sentence in English explaining usage or a common confusion."
}

VALIDATION CHECKLIST before outputting:
✓ tasks array has exactly 5 items in order: active-recall, sentence-builder, feynman, error-correction, active-recall
✓ Every token in sentence-builder correctOrder appears IDENTICALLY in options
✓ options has exactly correctOrder.length + 2 items
✓ active-recall answer field contains ONLY the English word/phrase, nothing else
✓ stories array has exactly 2 items
✓ reviewTasks array has exactly 10 items
✓ All content is calibrated to level ${profile.level}, using only: ${level.focus}

Return ONLY the JSON object. No markdown. No comments. No text outside JSON.`;

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    return callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate the English study session now. Level: ${profile.level}. Return only JSON.` },
    ], apiKey);
}

export async function generateSpanishSession(profile) {
    const level = SPANISH_LEVEL_GUIDE[profile.level] || SPANISH_LEVEL_GUIDE.B1;

    const systemPrompt = `You are an expert Spanish language tutor. Generate a JSON study session with this EXACT structure:
{ "tasks": [5 items], "stories": [2 items], "reviewTasks": [10 items] }

STUDENT: ${profile.name} | LEVEL: ${profile.level} (${level.label}) | DAILY GOAL: ${profile.dailyTime} min
CONTENT FOCUS: ${level.focus}
STRICTLY AVOID: ${level.avoid}

══════════════════════════════════════
TASKS — exactly 5, in this exact order:
  1. active-recall
  2. sentence-builder
  3. feynman
  4. error-correction
  5. active-recall
══════════════════════════════════════

TASK TYPE "active-recall":
{
  "type": "active-recall",
  "prompt": "Pergunta curta em português pedindo ao aluno para produzir uma palavra, frase ou estrutura gramatical específica em espanhol. Ex.: Como se diz 'biblioteca' em espanhol?",
  "answer": "A PALAVRA OU FRASE CURTA EM ESPANHOL APENAS. Sem português. Sem explicações. Máximo 6 palavras. Ex.: la biblioteca",
  "phonetic": "Guia fonético simplificado se a pronúncia não for óbvia, caso contrário string vazia",
  "explain": "3-4 frases em inglês: o que significa, como é usado gramaticalmente, um erro comum a evitar.",
  "hint": "Uma dica sutil sobre a forma ou função da resposta.",
  "example": "Uma frase completa em espanhol usando a resposta em um contexto realista e natural."
}

TASK TYPE "sentence-builder":
FOLLOW EXACTLY — generate fields in this order:
  1. "targetSentence": Write a Spanish sentence (6-9 words) using grammar from CONTENT FOCUS for level ${profile.level}.
  2. "prompt": Write the EXACT Portuguese translation of targetSentence. Nothing else — just the translation.
  3. "correctOrder": Split targetSentence word by word into an array. Punctuation stays attached to its word.
  4. "options": Take every element of correctOrder (copy each string exactly), add 2 Spanish distractor words, shuffle the result.
  5. "grammarNote": One paragraph explaining the grammar rule in English.

EXAMPLE (use different content, same structure):
  targetSentence → "Ella nunca ha estado en Madrid."
  prompt         → "Ela nunca esteve em Madri."
  correctOrder   → ["Ella", "nunca", "ha", "estado", "en", "Madrid."]
  options        → ["estado", "Madrid.", "ido", "nunca", "Ella", "ha", "en", "siempre"]

OUTPUT FORMAT:
{
  "type": "sentence-builder",
  "targetSentence": "the Spanish sentence",
  "prompt": "its Portuguese translation",
  "correctOrder": ["tokens", "of", "targetSentence"],
  "options": ["correctOrder", "tokens", "shuffled", "plus", "two", "distractors"],
  "grammarNote": "grammar explanation"
}

TASK TYPE "feynman":
{
  "type": "feynman",
  "prompt": "Explain [a specific, named Spanish grammar concept for level ${profile.level}] in your own words, as if teaching someone who never studied Spanish.",
  "explain": "5-7 sentence expert explanation in English. Cover: what the concept is, when/how to use it, common exceptions, and one clear example with explanation.",
  "keyPoints": ["Key point 1 in English (one sentence)", "Key point 2 in English (one sentence)", "Key point 3 in English (one sentence)"]
}

TASK TYPE "error-correction":
{
  "type": "error-correction",
  "prompt": "Find and correct the grammatical error in this sentence:",
  "sentence": "A Spanish sentence with EXACTLY ONE grammar error appropriate for level ${profile.level}. The error must be clearly wrong to a student at this level.",
  "correctedSentence": "The same sentence with ONLY the error fixed. No other changes.",
  "errorExplanation": "2-3 sentences in English: what the error is, the grammar rule that applies, and why learners commonly make this mistake."
}

══════════════════════════════════════
STORIES — exactly 2
══════════════════════════════════════
Choose engaging themes: technology, history, culture, nature, everyday life.
{
  "title": "Engaging Spanish title",
  "icon": "single emoji",
  "languageText": "Spanish story, minimum 250 words. Grammar and vocabulary calibrated to level ${profile.level}. Use \\n for paragraph breaks.",
  "originalText": "Complete, accurate Portuguese translation of the full Spanish story above."
}

══════════════════════════════════════
REVIEW TASKS — exactly 10 flashcards (ALWAYS)
══════════════════════════════════════
Focus on vocabulary, verb conjugations, false cognates, or grammar patterns for level ${profile.level}.
{
  "prompt": "Portuguese word or phrase to test Spanish recall",
  "answer": "Spanish equivalent (concise, max 10 words)",
  "emoji": "single relevant emoji",
  "explanation": "One sentence in English explaining usage or a common confusion."
}

VALIDATION CHECKLIST before outputting:
✓ tasks array has exactly 5 items in order: active-recall, sentence-builder, feynman, error-correction, active-recall
✓ Every token in sentence-builder correctOrder appears IDENTICALLY in options
✓ options has exactly correctOrder.length + 2 items
✓ active-recall answer field contains ONLY the Spanish word/phrase, nothing else
✓ stories array has exactly 2 items
✓ reviewTasks array has exactly 10 items
✓ All content is calibrated to level ${profile.level}, using only: ${level.focus}

Return ONLY the JSON object. No markdown. No comments. No text outside JSON.`;

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    return callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate the Spanish study session now. Level: ${profile.level}. Return only JSON.` },
    ], apiKey);
}

/**
 * Generates a session (volatile — stored in localStorage only).
 * Returns { tasks, stories, reviewTasks } or throws.
 */
export async function generateAndSaveSession(_userId, language, profile) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) throw new Error('No GROQ API key');

    let content;
    if (language === 'czech') {
        content = await generateCzechSession(profile);
    } else if (language === 'spanish') {
        content = await generateSpanishSession(profile);
    } else {
        content = await generateEnglishSession(profile);
    }

    const tasks = fixSentenceBuilderTasks(Array.isArray(content.tasks) ? content.tasks : []);
    const stories = (Array.isArray(content.stories) ? content.stories : [])
        .map(s => ({ ...s, id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}` }));
    const reviewTasks =
        Array.isArray(content.reviewTasks)   ? content.reviewTasks   :
        Array.isArray(content.review_tasks)  ? content.review_tasks  :
        Array.isArray(content.flashcards)    ? content.flashcards    :
        Array.isArray(content.flashcardTasks)? content.flashcardTasks: [];

    return { tasks, stories, reviewTasks };
}
