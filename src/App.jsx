import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "./contexts/AppProvider.jsx";
import { ProtectRoute } from "./contexts/ProtectRoute.jsx";
import { DashboardView } from "./ui/DashboardView/DashboardView.jsx";
import { LessonModeView } from "./ui/LessonModeView/LessonModeView.jsx";
import { StoryView } from "./ui/StoryView/StoryView.jsx";
import { ChatView } from "./ui/ChatView/ChatView.jsx";
import { FlasCardView } from "./ui/FlashcardView/FlashcardView.jsx";
import { StudyTopic } from "./ui/StudyTopic/StudyTopic.jsx";
import { TeleprompterView } from "./ui/TeleprompterView/TeleprompterView.jsx";
import { Landing } from "./ui/Landing/Landing.jsx";
import { AuthView } from "./ui/AuthView/AuthView.jsx";
import { LanguageSelectView } from "./ui/LanguageSelectView/LanguageSelectView.jsx";
import { SessionListView } from "./ui/SessionListView/SessionListView.jsx";
import { Navigate } from "react-router-dom";

const App = () => (
    <AppProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                {/* Legacy per-language landing routes */}
                <Route path="/czech" element={<Navigate to="/" replace />} />
                <Route path="/spanish" element={<Navigate to="/" replace />} />
                <Route path="/auth" element={<AuthView />} />
                <Route path="/onboarding" element={<Navigate to="/language-select" replace />} />
                <Route path="/language-select" element={<LanguageSelectView />} />
                <Route path="/sessions" element={<ProtectRoute><SessionListView /></ProtectRoute>} />
                <Route path="/dashboard" element={<ProtectRoute><DashboardView /></ProtectRoute>} />
                <Route path="/lesson" element={<ProtectRoute><LessonModeView /></ProtectRoute>} />
                <Route path="/story" element={<ProtectRoute><StoryView /></ProtectRoute>} />
                <Route path="/chat" element={<ProtectRoute><ChatView /></ProtectRoute>} />
                <Route path="/flashcard" element={<ProtectRoute><FlasCardView /></ProtectRoute>} />
                <Route path="/academic" element={<ProtectRoute><StudyTopic /></ProtectRoute>} />
                <Route path="/teleprompter" element={<ProtectRoute><TeleprompterView /></ProtectRoute>} />
            </Routes>
        </BrowserRouter>
    </AppProvider>
);

export default App;
