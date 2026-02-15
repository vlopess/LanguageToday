import {useLocation, useNavigate} from "react-router-dom";
import {Home, MessageSquare, Target} from "lucide-react";
import React from "react";

export const BottomNavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    return (
        <nav
            className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t px-8 py-5 flex justify-around z-20 shadow-2xl">
            <button onClick={() => navigate('/onboarding')}
                    className={`flex flex-col items-center gap-1 ${location.pathname === "/dashboard" ? "text-[#11457E]" : "text-slate-300"}`}>
                <Home className="w-6 h-6"/><span className="text-[10px] font-black">HOME</span>
            </button>
            <button onClick={() => navigate('/chat')}
                    className={`flex flex-col items-center gap-1 ${location.pathname === "/chat" ? "text-[#11457E]" : "text-slate-300"}`}>
                <MessageSquare className="w-6 h-6"/><span
                className="text-[10px] font-black">CHAT</span></button>
        </nav>
    );
}