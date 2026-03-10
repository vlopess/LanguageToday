import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { useContent } from "./ContentContext.jsx";

export const ProtectRoute = ({ children }) => {
    const { userId, isReady } = useAuth();
    const { needsSessionGeneration } = useContent();

    if (!isReady) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#11457E] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!userId) return <Navigate to="/auth" replace />;
    if (needsSessionGeneration) return <Navigate to="/language-select" replace />;

    return children;
};
