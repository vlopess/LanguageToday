import { ContentProvider } from "./ContentContext.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import { TimerProvider } from "./TimerContext.jsx";

export function AppProvider({ children }) {
    return (
        <AuthProvider>
            <ContentProvider>
                <TimerProvider>
                    {children}
                </TimerProvider>
            </ContentProvider>
        </AuthProvider>
    );
}
