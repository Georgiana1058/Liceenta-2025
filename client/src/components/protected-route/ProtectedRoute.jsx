import { useStrapiUser } from "@/hooks/useStrapiUser";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { isLoaded, isSignedIn, user } = useUser();

  // Nu apela hook-ul până nu e încărcat user-ul complet
  const shouldLoadStrapiUser = isLoaded && isSignedIn && user?.id;
  const { user: strapiUser, loading } = useStrapiUser(shouldLoadStrapiUser ? user.id : null);

  if (!shouldLoadStrapiUser || loading) return null;
  if (!strapiUser || !allowedRoles.includes(strapiUser.role.name)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
