import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuthContext();
  const { profile, loading: profileLoading } = useProfile();

  // Loading state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Logged in but NOT admin
  if (profile?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Admin allowed
  return <>{children}</>;
};

export default AdminRoute;
