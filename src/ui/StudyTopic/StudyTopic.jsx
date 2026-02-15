import {useContent} from "../../contexts/ContentContext.jsx";
import {useNavigate} from "react-router-dom";
import {Icon, X} from "lucide-react";

export const StudyTopic = () => {
    const navigate = useNavigate()
    const {selectedStudyTopic} = useContent();

    const steps = [
        { id: 'key', label: 'Phrases & Pronunciation', content: selectedStudyTopic.keyPhrases, icon: "MessageSquare", color: 'bg-red-500' },
        { id: 'pattern', label: 'Grammar & Tables', content: selectedStudyTopic.pattern, icon: "Layout", color: 'bg-[#11457E]' },
        { id: 'practice', label: 'Training Drill', content: selectedStudyTopic.practice, icon: "Zap", color: 'bg-orange-500' },
    ];

    const renderMarkdown = (text) => {
        if (typeof text !== 'string') return <>{String(text || "")}</>;
        let html = text;
        html = html.replace(/^### (.*$)/gm, '<h3 class="text-sm font-black text-[#11457E] mt-4 mb-2 uppercase tracking-widest">$1</h3>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-[#11457E]">$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-500">$1</em>');
        html = html.replace(/^\* (.*)/gm, '<div class="flex gap-2 mb-2 pl-2"><span class="text-[#D71920]">•</span><span class="text-slate-700">$1</span></div>');
        const lines = html.split('\n');
        const processedLines = [];
        let inTable = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('|') && line.includes('|')) {
                if (!inTable) { processedLines.push('<div class="my-4 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm"><table class="w-full text-left border-collapse bg-white">'); inTable = true; }
                const cells = line.split('|').filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1);
                const isSeparator = cells.every(cell => cell.trim().match(/^-+$/));
                if (!isSeparator) {
                    const isHeader = i === 0 || (lines[i+1] && lines[i+1].trim().startsWith('|---'));
                    processedLines.push(`<tr class="${isHeader ? 'bg-slate-50 border-b-2 border-slate-200' : 'border-b border-slate-100'}">`);
                    cells.forEach(cell => processedLines.push(`<${isHeader ? 'th' : 'td'} class="p-4 text-xs ${isHeader ? 'font-black text-[#11457E] uppercase tracking-wider' : 'text-slate-600 font-bold'}">${cell.trim()}</${isHeader ? 'th' : 'td'}>`));
                    processedLines.push('</tr>');
                }
            } else {
                if (inTable) { processedLines.push('</table></div>'); inTable = false; }
                processedLines.push(line ? `<div class="mb-1">${line}</div>` : '<br/>');
            }
        }
        if (inTable) processedLines.push('</table></div>');
        return processedLines.map((line, i) => <div key={i} dangerouslySetInnerHTML={{ __html: line }} />);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col animate-in fade-in">
            <header className="p-8 border-b flex justify-between items-center bg-white sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="bg-slate-50 p-4 rounded-3xl text-4xl shadow-inner">{selectedStudyTopic.emoji}</div>
                    <h2 className="font-black text-2xl text-slate-800 tracking-tighter uppercase">{selectedStudyTopic.topic}</h2>
                </div>
                <button onClick={() => navigate('/dashboard')} className="p-3 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100"><X/></button>
            </header>
            <main className="flex-1 overflow-y-auto p-6 md:p-12 max-w-4xl mx-auto w-full pb-40">
                <div className="space-y-24">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="relative group animate-in slide-in-from-bottom-12" style={{ animationDelay: `${idx * 0.2}s` }}>
                            <div className="flex gap-10 relative z-10">
                                <div className="flex-1 bg-white p-10 md:p-14 rounded-[5rem] shadow-2xl shadow-slate-200/50 border border-white">
                                    <div className="flex justify-between items-center mb-8">
                                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">{step.label}</h4>
                                        {/*<button onClick={() => speak(step.content)} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-full transition-all text-[#11457E]">*/}
                                        {/*    <Icon name={isAudioLoading ? "Loader2" : "Volume2"} className={isAudioLoading ? "animate-spin" : ""} />*/}
                                        {/*</button>*/}
                                    </div>
                                    <div className="text-2xl font-bold text-slate-800 leading-[2]">{renderMarkdown(step.content)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}