import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ 
    children, 
    allowedRoles 
}: { 
    children: React.ReactNode, 
    allowedRoles?: ('patient' | 'doctor' | 'admin' | 'kazi' | 'partner')[]
}) {
    const { user, loading, isCheckingProfile, hasCompletedProfile, userProfile } = useAuth();
    const location = useLocation();

    if (loading || isCheckingProfile) {
        return (
            <div className="flex min-h-[100dvh] items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="inline-block animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    // SECURITY: If user is not logged in, redirect to /auth
    if (!user) {
        return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
    }

    // Profile gate: if logged in but no profile, redirect to complete-profile
    if (!hasCompletedProfile && location.pathname !== '/complete-profile') {
        return <Navigate to="/complete-profile" replace />;
    }

    // Role gate: if allowedRoles is specified, check userProfile.role
    if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role as any)) {
        console.warn(`Access denied for role: ${userProfile.role}. Required: ${allowedRoles}`);
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
}
