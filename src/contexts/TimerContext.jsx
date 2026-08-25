import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle } from 'lucide-react';
import { useAuth } from './AuthContext.jsx';
import { useContent } from './ContentContext.jsx';
import { recordStudySession } from '../lib/db.js';

const TimerContext = createContext(null);

function SessionCompleteDialog({ durationMinutes, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
             style={{ background: 'rgba(27,39,51,0.45)' }}>
            <div role="dialog" aria-modal="true" aria-label="Session complete"
                 className="w-full max-w-sm bg-surface border border-line rounded-xl shadow-overlay p-7 text-center">
                <CheckCircle size={32} strokeWidth={1.5} className="text-success mx-auto mb-4"/>
                <h2 className="font-display font-bold tracking-tight text-2xl mb-2">
                    Session complete!
                </h2>
                <p className="text-muted text-sm mb-6">
                    You studied for{' '}
                    <span className="font-semibold text-ink tabular-nums">
                        {durationMinutes} minute{durationMinutes !== 1 ? 's' : ''}
                    </span>.
                    Keep it up tomorrow.
                </p>
                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-lg bg-primary text-white text-sm font-semibold
                               hover:bg-primary-dark transition-colors focus-ring">
                    Continue
                </button>
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
