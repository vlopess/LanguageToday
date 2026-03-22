import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext({ user: null, userId: null, isReady: false });

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isReady, setIsReady] = useState(false);


    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setIsReady(true);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email, password) => {
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (!result.error) sessionStorage.setItem('freshLogin', 'true');
        return result;
    };

    const signUp = async (email, password) => {
        const result = await supabase.auth.signUp({ email, password });
        if (!result.error) sessionStorage.setItem('freshLogin', 'true');
        return result;
    };

    const signOut = () => {
        // Keep only userProfile (name, level) and last selected language
        const profile = localStorage.getItem('userProfile');
        const language = localStorage.getItem('currentLanguage');
        localStorage.clear();
        sessionStorage.removeItem('freshLogin');
        if (language) localStorage.setItem('currentLanguage', language);
        if (profile) localStorage.setItem('userProfile', profile);
        return supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, userId: user?.id ?? null, isReady, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
