import {useContent} from "../../contexts/ContentContext.jsx";
import {useNavigate} from "react-router-dom";
import {ArrowLeft, X} from "lucide-react";
import {CURRICULUM} from "../../lib/generateTopics.js";
import {useState} from "react";

function parseAlphabetLetters(text) {
    if (!text || typeof text !== 'string') return [];
    const letters = [];
    const regex = /\*\*([^*]+)\*\*\s*\n\s*([^\n]*)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        const letter = match[1].trim();
        const pronunciation = match[2].trim();
        if (letter.length <= 4) {
            letters.push({ letter, pronunciation });
        }
    }
    return letters;
}

function AlphabetGrid({ text }) {
    const letters = parseAlphabetLetters(text);
    if (!letters.length) return null;
    return (
        <div className="mb-6">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {letters.map((item, i) => (
                    <div key={i}
                         className="bg-surface border border-line rounded-lg px-2 py-3 text-center">
                        <span className="block text-lg font-bold leading-none">{item.letter}</span>
                        {item.pronunciation && (
                            <span className="block text-[10px] text-muted mt-1.5 leading-tight">
                                {item.pronunciation}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function renderMarkdown(text) {
    if (typeof text !== 'string') return <>{String(text || "")}</>;
    let html = text;
    html = html.replace(/^### (.*$)/gm, '<h3 class="font-semibold text-ink mt-5 mb-1.5">$1</h3>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-muted">$1</em>');
    html = html.replace(/^\* (.*)/gm, '<div class="flex gap-2.5 mb-1.5"><span class="text-muted select-none">•</span><span>$1</span></div>');
    const lines = html.split('\n');
    const processedLines = [];
    let inTable = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('|') && line.includes('|')) {
            if (!inTable) { processedLines.push('<div class="my-4 overflow-x-auto rounded-lg border border-line"><table class="w-full text-left border-collapse bg-surface">'); inTable = true; }
            const cells = line.split('|').filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1);
            const isSeparator = cells.every(cell => cell.trim().match(/^-+$/));
            if (!isSeparator) {
                const isHeader = i === 0 || (lines[i+1] && lines[i+1].trim().startsWith('|---'));
                processedLines.push(`<tr class="${isHeader ? 'bg-sunken' : ''} ${isHeader ? '' : 'border-t border-line'}">`);
                cells.forEach(cell => processedLines.push(`<${isHeader ? 'th' : 'td'} class="px-3.5 py-2.5 text-left text-[13px] ${isHeader ? 'font-semibold' : 'border-t border-line'}">${cell.trim()}</${isHeader ? 'th' : 'td'}>`));
                processedLines.push('</tr>');
            }
        } else {
            if (inTable) { processedLines.push('</table></div>'); inTable = false; }
            processedLines.push(line ? `<div class="mb-1">${line}</div>` : '<br/>');
        }
    }
    if (inTable) processedLines.push('</table></div>');
    return processedLines.map((line, i) => <div key={i} dangerouslySetInnerHTML={{ __html: line }} />);
}

function stripAlphabetLetters(text) {
    if (!text) return '';
    return text.replace(/\*\*[^*]{1,4}\*\*\s*\n\s*[^\n]*(\n|$)/g, '').replace(/\n{3,}/g, '\n\n').trim();
}

/* ── Grid overview of all 10 steps ── */
function PathGrid({ studyMaterial, onSelect }) {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen pb-24">
            <header className="bg-surface border-b border-line sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
                    <h2 className="font-display font-bold tracking-tight">Academic Path</h2>
                    <button onClick={() => navigate('/dashboard')} aria-label="Close"
                            className="p-2 -mr-2 text-muted hover:text-ink transition-colors focus-ring">
                        <X size={18}/>
                    </button>
                </div>
            </header>
            <main className="max-w-3xl mx-auto px-5 pt-8">
                <div className="grid grid-cols-2 gap-3">
                    {studyMaterial.map((mat, i) => (
                        <button key={i} onClick={() => onSelect(i)}
                                className="bg-surface border border-line rounded-xl p-4 text-left
                                           hover:border-primary transition-colors focus-ring">
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-[11px] font-medium text-muted/70 tabular-nums">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="text-xl leading-none">{mat.emoji || CURRICULUM[i]?.emoji || '📘'}</span>
                            </div>
                            <span className="block text-sm font-semibold leading-snug">
                                {mat.topic}
                            </span>
                            {CURRICULUM[i]?.blurb && (
                                <span className="block text-[11px] text-muted mt-1 leading-snug">
                                    {CURRICULUM[i].blurb}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
}

/* ── Detail view for a single step ── */
function TopicDetail({ topic, onBack }) {
    const topicIndex = CURRICULUM.findIndex(s => s.title === topic.topic);
    const isAlphabetStep = topicIndex === 0;

    const steps = [
        { id: 'key', label: 'Phrases & pronunciation', content: topic.keyPhrases },
        { id: 'pattern', label: 'Grammar & tables', content: topic.pattern },
        { id: 'practice', label: 'Practice', content: topic.practice },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-surface border-b border-line sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
                    <button onClick={onBack}
                            className="flex items-center gap-1.5 text-muted hover:text-ink transition-colors text-[13px] font-medium focus-ring">
                        <ArrowLeft size={15}/>
                        Path
                    </button>
                    <div className="flex items-center gap-2 min-w-0">
                        <span aria-hidden className="text-lg leading-none">{topic.emoji}</span>
                        <h2 className="font-display font-bold tracking-tight truncate text-sm">
                            {topic.topic}
                        </h2>
                    </div>
                    <span className="w-16"/>
                </div>
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-10 pb-24">
                {steps.map((step, idx) => (
                    <section key={step.id} className={idx > 0 ? 'mt-12 pt-12 border-t border-line' : ''}>
                        <div className="flex items-baseline gap-3 mb-5">
                            <span aria-hidden className="font-display font-bold text-muted/50 tabular-nums">
                                {String(idx + 1).padStart(2, '0')}
                            </span>
                            <h3 className="text-lg font-semibold">{step.label}</h3>
                        </div>
                        {isAlphabetStep && idx === 0 && (
                            <AlphabetGrid text={step.content}/>
                        )}
                        <div className="pl-8 text-[15px] leading-[1.85]">
                            {isAlphabetStep && idx === 0
                                ? renderMarkdown(stripAlphabetLetters(step.content))
                                : renderMarkdown(step.content)
                            }
                        </div>
                    </section>
                ))}
            </main>
        </div>
    );
}

export const StudyTopic = () => {
    const navigate = useNavigate();
    const {selectedStudyTopic, studyMaterial} = useContent();
    const [viewedIndex, setViewedIndex] = useState(() => {
        if (selectedStudyTopic && studyMaterial.length) {
            const idx = studyMaterial.findIndex(m => m.topic === selectedStudyTopic.topic);
            if (idx >= 0) return idx;
        }
        return -1;
    });

    const activeTopic = viewedIndex >= 0 ? studyMaterial[viewedIndex] : null;

    if (!studyMaterial.length) {
        navigate('/dashboard');
        return null;
    }

    if (activeTopic) {
        return <TopicDetail topic={activeTopic} onBack={() => setViewedIndex(-1)}/>;
    }

    return <PathGrid studyMaterial={studyMaterial} onSelect={setViewedIndex}/>;
};
