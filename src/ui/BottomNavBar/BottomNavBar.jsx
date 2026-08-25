import { useLocation, useNavigate } from "react-router-dom";
import { Home, MessageSquare } from "lucide-react";
import React from "react";

export const BottomNavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const itemClass = (active) =>
        `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors focus-ring ${
            active ? "text-primary" : "text-muted hover:text-ink"
        }`;

    return (
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-line">
            <div className="max-w-2xl mx-auto flex">
                <button
                    onClick={() => navigate("/dashboard")}
                    className={itemClass(location.pathname === "/dashboard")}
                >
                    <Home size={18} strokeWidth={location.pathname === "/dashboard" ? 2.2 : 1.8} />
                    Home
                </button>
                <button
                    onClick={() => navigate("/chat")}
                    className={itemClass(location.pathname === "/chat")}
                >
                    <MessageSquare size={18} strokeWidth={location.pathname === "/chat" ? 2.2 : 1.8} />
                    Chat
                </button>
            </div>
        </nav>
    );
};
