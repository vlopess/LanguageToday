import {ContentProvider} from "./ContentContext.jsx";

export function AppProvider({ children }) {
    return (
        <ContentProvider>
            {children}
        </ContentProvider>
    );
}
