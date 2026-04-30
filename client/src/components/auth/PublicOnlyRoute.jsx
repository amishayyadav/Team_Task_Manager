import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, hydrated } = useAuthStore();
  if (!hydrated) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}
