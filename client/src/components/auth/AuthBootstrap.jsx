import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerAuthFailureHandler } from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { useQueryClient } from "@tanstack/react-query";

export default function AuthBootstrap({ children }) {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    registerAuthFailureHandler(() => {
      clearAuth();
      qc.clear();
      navigate("/login", { replace: true });
    });
  }, [clearAuth, navigate, qc]);

  return children;
}
