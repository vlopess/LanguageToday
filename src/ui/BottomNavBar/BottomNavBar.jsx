import { useLocation, useNavigate } from "react-router-dom";
import { Home, MessageSquare } from "lucide-react";
import React from "react";

export const BottomNavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const items = [
        { label: "Home", icon: Home,         path: "/dashboard" },
        { label: "Chat", icon: MessageSquare, path: "/chat"      },
    ];

    return (
        <nav
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '9999px',
                backgroundColor: '#11457E',
                boxShadow: '0 8px 32px rgba(17,69,126,0.45)',
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: 'nowrap',
            }}>
            {items.map(({ label, icon: Icon, path }) => {
                const active = location.pathname === path;
                return (
                    <button
                        key={path}
                        onClick={() => navigate(path)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            borderRadius: '9999px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                            color: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
                            transition: 'all 0.2s',
                        }}>
                        <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                        {active && (
                            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>
                                {label}
                            </span>
                        )}
                    </button>
                );
            })}
        </nav>
    );
};
