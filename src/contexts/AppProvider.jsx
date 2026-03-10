import { ContentProvider } from "./ContentContext.jsx";
import { AuthProvider } from "./AuthContext.jsx";

export function AppProvider({ children }) {
    return (
        <AuthProvider>
            <ContentProvider>
                {children}
            </ContentProvider>
        </AuthProvider>
    );
}
