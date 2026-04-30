import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { extractApiMessage } from "@/lib/utils";

export const projectsKey = ["projects"];
export const projectKey = (id) => ["project", id];

export function useProjects() {
  return useQuery({
    queryKey: projectsKey,
    queryFn: async () => (await api.get("/projects")).data.data,
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: projectKey(id),
    queryFn: async () => (await api.get(`/projects/${id}`)).data.data,
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post("/projects", payload)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectsKey });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Project created");
    },
    onError: (err) => toast.error(extractApiMessage(err, "Failed to create project")),
  });
}

export function useUpdateProject(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.patch(`/projects/${id}`, payload)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectsKey });
      qc.invalidateQueries({ queryKey: projectKey(id) });
      toast.success("Project updated");
    },
    onError: (err) => toast.error(extractApiMessage(err, "Failed to update project")),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectsKey });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Project deleted");
    },
    onError: (err) => toast.error(extractApiMessage(err, "Failed to delete project")),
  });
}
