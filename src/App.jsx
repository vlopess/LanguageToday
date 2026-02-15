import {BrowserRouter, Route, Routes } from "react-router-dom";
import {OnboardingView} from "./ui/OnboardingView/OnboardingView.jsx";
import {DashboardView} from "./ui/DashboardView/DashboardView.jsx";
import {LessonModeView} from "./ui/LessonModeView/LessonModeView.jsx";
import {StoryView} from "./ui/StoryView/StoryView.jsx";
import {ChatView} from "./ui/ChatView/ChatView.jsx";
import {ContentProvider} from "./contexts/ContentContext.jsx";
import {ProtectRoute} from "./contexts/ProtectRoute.jsx";
import {FlasCardView} from "./ui/FlashcardView/FlashcardView.jsx";
import {StudyTopic} from "./ui/StudyTopic/StudyTopic.jsx";
import {LandingCestina} from "./ui/Landing/LandingCestina.jsx";
import {Landing} from "./ui/Landing/LandingEnglish.jsx";
import {OnboardingEnglishView} from "./ui/OnboardingView/OnboardingEnglishView.jsx";


const App = () => {
    return (
        <ContentProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Landing/>}/>
                    <Route path="/czech" element={<LandingCestina/>}/>
                    <Route path="/login" element={<OnboardingView/>}/>
                    <Route path="/login-en" element={<OnboardingEnglishView/>}/>
                    <Route path="/dashboard" element={<ProtectRoute><DashboardView/></ProtectRoute>}/>
                    <Route path="/lesson" element={<ProtectRoute><LessonModeView/></ProtectRoute>}/>
                    <Route path="/story" element={<ProtectRoute><StoryView/></ProtectRoute>}/>
                    <Route path="/chat" element={<ProtectRoute><ChatView/></ProtectRoute>}/>
                    <Route path="/flashcard" element={<ProtectRoute><FlasCardView/></ProtectRoute>}/>
                    <Route path="/academic" element={<ProtectRoute><StudyTopic/></ProtectRoute>}/>
                </Routes>
            </BrowserRouter>
        </ContentProvider>
    );
}

export default App;