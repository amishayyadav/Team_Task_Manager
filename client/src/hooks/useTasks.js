import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { extractApiMessage } from "@/lib/utils";
import { projectKey } from "./useProjects";

export const tasksKey = (projectId, filters) => ["tasks", projectId, filters || {}];
export const taskKey = (id) => ["task", id];

export function useTasks(projectId, filters = {}) {
  return useQuery({
    queryKey: tasksKey(projectId, filters),
    queryFn: async () => {
      const params = {};
      for (const [k, v] of Object.entries(filters)) {
        if (v !== undefined && v !== "" && v !== null) params[k] = v;
      }
      const { data } = await api.get(`/projects/${projectId}/tasks`, { params });
      return data;
    },
    enabled: Boolean(projectId),
    keepPreviousData: true,
  });
}

export function useTask(id) {
  return useQuery({
    queryKey: taskKey(id),
    queryFn: async () => (await api.get(`/tasks/${id}`)).data.data,
    enabled: Boolean(id),
  });
}

export function useCreateTask(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) =>
      (await api.post(`/projects/${projectId}/tasks`, payload)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      qc.invalidateQueries({ queryKey: projectKey(projectId) });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task created");
    },
    onError: (err) => toast.error(extractApiMessage(err, "Failed to create task")),
  });
}

export function useUpdateTask(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => (await api.patch(`/tasks/${id}`, payload)).data.data,
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      qc.invalidateQueries({ queryKey: projectKey(projectId) });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      if (task?._id) qc.invalidateQueries({ queryKey: taskKey(task._id) });
    },
    onError: (err) => toast.error(extractApiMessage(err, "Failed to update task")),
  });
}

export function useDeleteTask(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      qc.invalidateQueries({ queryKey: projectKey(projectId) });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task deleted");
    },
    onError: (err) => toast.error(extractApiMessage(err, "Failed to delete task")),
  });
}
