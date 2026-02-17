import React, {useEffect, useState} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase,
    Plane,
    Users,
    MessageCircle,
    Utensils,
    Hotel,
    Stethoscope,
    Presentation,
    TrendingUp,
    BookOpen,
    GraduationCap,
    FileText,
    MessageSquareDashed,
    Plus,
    X,
    Headphones
} from "lucide-react";
import {Button} from "../Components/Button.jsx";
import {Card, CardContent} from "../Components/Card.jsx";


const scenarios = [
    {
        id: 1,
        title: "Job Interview",
        description: "Practice answering common interview questions in English.",
        icon: Briefcase,
        prompt: `You are a senior recruiter conducting a high-level corporate job interview. Assess strategic thinking, leadership, measurable achievements, and behavioral competencies. Challenge vague answers and demand specificity, metrics, and impact.`
    },
    {
        id: 2,
        title: "Airport Conversation",
        description: "Simulate check-in, boarding, and travel interactions.",
        icon: Plane,
        prompt: `You are an international airport officer handling complex travel situations (missed connections, documentation issues, baggage disputes). Require clarity, precision, and formal travel-related vocabulary.`
    },
    {
        id: 3,
        title: "Business Meeting",
        description: "Discuss projects, deadlines, and professional topics.",
        icon: Users,
        prompt: `You are leading a high-stakes executive meeting. Discuss strategy, risk mitigation, KPIs, deadlines, and stakeholder alignment. Expect structured, persuasive, and data-driven responses.`
    },
    {
        id: 4,
        title: "Daily Small Talk",
        description: "Casual conversations about routine and daily life.",
        icon: MessageCircle,
        prompt: `Engage in refined social conversation. Elevate everyday topics into intellectually engaging dialogue. Encourage idiomatic expressions and subtle pragmatic nuance.`
    },
    {
        id: 5,
        title: "Ordering at a Restaurant",
        description: "Practice food-related vocabulary and polite requests.",
        icon: Utensils,
        prompt: `You are in a fine-dining environment. Discuss ingredients, preparation techniques, dietary restrictions, and culinary preferences using sophisticated gastronomic vocabulary.`
    },
    {
        id: 6,
        title: "Hotel Check-in",
        description: "Handle reservations, complaints, and service requests.",
        icon: Hotel,
        prompt: `Simulate a luxury hotel interaction involving service recovery, negotiation, and policy clarification. Require diplomatic and precise professional language.`
    },
    {
        id: 7,
        title: "Doctor Appointment",
        description: "Describe symptoms and understand medical advice.",
        icon: Stethoscope,
        prompt: `Conduct a detailed medical consultation. Explore symptoms, differential considerations, and treatment plans using accurate medical terminology.`
    },
    {
        id: 8,
        title: "Tech Support Call",
        description: "Explain technical problems and follow troubleshooting steps.",
        icon: Headphones,
        prompt: `Handle a complex technical troubleshooting scenario involving systems, infrastructure, or software architecture. Demand clarity in describing processes and causality.`
    },
    {
        id: 9,
        title: "University Presentation",
        description: "Present a topic clearly and answer questions confidently.",
        icon: Presentation,
        prompt: `Evaluate a formal academic presentation. Probe theoretical frameworks, counterarguments, and methodological rigor. Expect coherent academic discourse.`
    },
    {
        id: 10,
        title: "Performance Review",
        description: "Discuss achievements, feedback, and career goals.",
        icon: TrendingUp,
        prompt: `Conduct a high-level performance evaluation. Discuss impact, growth trajectory, leadership maturity, and long-term strategic development.`
    },
    {
        id: 11,
        title: "Academic Exam (Written Test)",
        description: "Practice answering structured exam questions with formal language.",
        icon: BookOpen,
        prompt: `Provide rigorous written examination prompts. Evaluate argument structure, thesis clarity, logical progression, and lexical sophistication.`
    },
    {
        id: 12,
        title: "Oral Examination",
        description: "Respond clearly and confidently in spoken academic assessments.",
        icon: GraduationCap,
        prompt: `Conduct a demanding oral examination. Ask layered conceptual questions requiring analytical reasoning and terminological precision.`
    },
    {
        id: 14,
        title: "Research Paper Discussion",
        description: "Discuss methodology, results, and academic arguments.",
        icon: FileText,
        prompt: `Engage in a critical peer-review discussion of a research paper. Challenge methodology, statistical validity, limitations, and theoretical contribution.`
    }
];

export default function AddContextButton({ onSelect, currentScenario }) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState('');

    const [isCreating, setIsCreating] = useState(false);
    const [customTitle, setCustomTitle] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");


    useEffect(() => {
        setSelected(currentScenario);
    }, [currentScenario]);

    const SelectedIcon = selected?.icon;
    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant={selected ? "secondary" : "default"}
                className="rounded-2xl shadow-sm px-4 py-2 flex items-center gap-2"
            >
                {SelectedIcon ? <SelectedIcon size={18} /> : <Plus size={18} />}
                {selected ? selected.title : "Add Context"}
            </Button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Choose a Scenario</h2>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            {isCreating ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Title</label>
                                        <input
                                            value={customTitle}
                                            onChange={(e) => setCustomTitle(e.target.value)}
                                            className="w-full mt-1 p-2 border rounded-xl"
                                            placeholder="e.g. Startup Pitch"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Prompt</label>
                                        <textarea
                                            value={customPrompt}
                                            onChange={(e) => setCustomPrompt(e.target.value)}
                                            className="w-full mt-1 p-2 border rounded-xl h-28 resize-none"
                                            placeholder="Describe how the AI should behave..."
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setIsCreating(false);
                                                setCustomTitle("");
                                                setCustomPrompt("");
                                            }}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                if (!customTitle.trim() || !customPrompt.trim()) return;

                                                const newScenario = {
                                                    id: `custom-${Date.now()}`,
                                                    title: customTitle,
                                                    description: "Custom scenario",
                                                    icon: MessageSquareDashed,
                                                    prompt: customPrompt,
                                                    isCustom: true
                                                };

                                                setSelected(newScenario);
                                                onSelect?.(newScenario);

                                                setIsCreating(false);
                                                setCustomTitle("");
                                                setCustomPrompt("");
                                                setOpen(false);
                                            }}
                                        >
                                            Create
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                        <Card
                                            className="cursor-pointer rounded-2xl border-dashed border-2 hover:shadow-md transition"
                                            onClick={() => setIsCreating(true)}
                                        >
                                            <CardContent className="p-4 flex items-start gap-3">
                                                <MessageSquareDashed size={18} className="mt-1" />
                                                <div>
                                                    <h3 className="font-medium text-base">
                                                        Create Custom Scenario
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Define your own context and instructions.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {scenarios.map((scenario) => {
                                            const Icon = scenario.icon;
                                            const isActive = selected?.id === scenario.id;

                                            return (
                                                <Card
                                                    key={scenario.id}
                                                    className={`cursor-pointer rounded-2xl transition border ${
                                                        isActive ? "border-primary shadow-md" : "hover:shadow-md"
                                                    }`}
                                                    onClick={() => {
                                                        setSelected(scenario);
                                                        onSelect?.(scenario);
                                                        setOpen(false);
                                                    }}
                                                >
                                                    <CardContent className="p-4 flex items-start gap-3">
                                                        <div className="mt-1">
                                                            <Icon size={18} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-base">
                                                                {scenario.title}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {scenario.description}
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
