import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle } from 'lucide-react';
import { useAuth } from './AuthContext.jsx';
import { useContent } from './ContentContext.jsx';
import { recordStudySession } from '../lib/db.js';

const TimerContext = createContext(null);

const display = { fontFamily: "'Bricolage Grotesque', sans-serif" };
const body    = { fontFamily: "'DM Sans', sans-serif" };

function SessionCompleteDialog({ durationMinutes, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
             style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="w-full max-w-sm rounded-[2rem] overflow-hidden"
                 style={{ background: '#F7F5F0', ...body }}>
                <div className="h-2" style={{ background: 'linear-gradient(90deg, #11457E, #D71920)' }}/>
                <div className="px-7 py-8 text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                         style={{ background: 'linear-gradient(135deg, #11457E 0%, #071e3d 100%)' }}>
                        <CheckCircle className="w-9 h-9 text-white" strokeWidth={2.5}/>
                    </div>
                    <h2 className="text-slate-900 leading-tight mb-2"
                        style={{ ...display, fontWeight: 800, fontSize: '1.8rem' }}>
                        Session complete!
                    </h2>
                    <p className="text-slate-500 text-sm mb-6">
                        You studied for{' '}
                        <span className="font-bold text-[#11457E]">
                            {durationMinutes} minute{durationMinutes !== 1 ? 's' : ''}
                        </span>.
                        Keep the streak going!
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl text-white font-bold text-base
                                   hover:brightness-110 active:scale-[0.98] transition-all"
                        style={{ background: 'linear-gradient(135deg, #11457E 0%, #D71920 100%)', ...display }}>
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}

export function TimerProvider({ children }) {
    const { userId }                          = useAuth();
    const { userProfile, currentLanguage }    = useContent();

    const dailyTime   = parseInt(userProfile?.dailyTime || '15', 10);
    const totalSecs   = dailyTime * 60;

    const [secondsLeft, setSecondsLeft]       = useState(totalSecs);
    const [isActive, setIsActive]             = useState(false);
    const [showDialog, setShowDialog]         = useState(false);
    const [lastCompletedAt, setLastCompleted] = useState(null);

    // Reset timer when dailyTime changes
    useEffect(() => {
        setSecondsLeft(dailyTime * 60);
        setIsActive(false);
    }, [dailyTime]);

    // Auto-start when user logs in; hard-reset everything on logout
    useEffect(() => {
        if (userId) {
            setSecondsLeft(dailyTime * 60);
            setIsActive(true);
        } else {
            setIsActive(false);
            setShowDialog(false);
            setSecondsLeft(dailyTime * 60);
        }
    }, [userId]);

    // Countdown
    useEffect(() => {
        if (!isActive) return;
        const id = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    setIsActive(false);
                    setShowDialog(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [isActive]);

    const handleDialogClose = async () => {
        await recordStudySession(userId, currentLanguage, dailyTime);
        setLastCompleted(Date.now());
        setShowDialog(false);
        setSecondsLeft(dailyTime * 60);
        setIsActive(true);
    };

    const progress = Math.min(1, (totalSecs - secondsLeft) / totalSecs);

    return (
        <TimerContext.Provider value={{ secondsLeft, progress, totalSecs, lastCompletedAt }}>
            {children}
            {showDialog && userId && createPortal(
                <SessionCompleteDialog
                    durationMinutes={dailyTime}
                    onClose={handleDialogClose}
                />,
                document.body
            )}
        </TimerContext.Provider>
    );
}

export function useTimer() {
    const ctx = useContext(TimerContext);
    if (!ctx) throw new Error('useTimer must be used inside TimerProvider');
    return ctx;
}
