import {Navigate, Outlet} from "react-router-dom";
import {useContent} from "./ContentContext.jsx";
import {OnboardingView} from "../ui/OnboardingView/OnboardingView.jsx";
import React from "react";

export const ProtectRoute = ({children}) => {

    const { userProfile } = useContent();
    if (!userProfile?.completedOnboarding) {
        return <Navigate to="/" replace />;
    }
    return children;
};
