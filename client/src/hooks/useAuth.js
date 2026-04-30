import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { extractApiMessage } from "@/lib/utils";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (payload) => (await api.post("/auth/login", payload)).data,
    onSuccess: (data) => {
      setAuth({ user: data.user, accessToken: data.accessToken });
      toast.success(`Welcome back, ${data.user.name}`);
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => toast.error(extractApiMessage(err, "Login failed")),
  });
}

export function useSignup() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (payload) => (await api.post("/auth/signup", payload)).data,
    onSuccess: (data) => {
      setAuth({ user: data.user, accessToken: data.accessToken });
      toast.success("Account created");
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => toast.error(extractApiMessage(err, "Sign up failed")),
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => api.post("/auth/logout"),
    onSettled: () => {
      clearAuth();
      qc.clear();
      navigate("/login", { replace: true });
    },
  });
}

export function useMe(enabled = true) {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      return data.user;
    },
    enabled,
    staleTime: 60_000,
  });
}
