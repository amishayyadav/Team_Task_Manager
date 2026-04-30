import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, hydrated } = useAuthStore();
  const location = useLocation();

  if (!hydrated) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
