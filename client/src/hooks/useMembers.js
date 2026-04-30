import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { extractApiMessage } from "@/lib/utils";
import { projectKey } from "./useProjects";

export function useAddMember(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) =>
      (await api.post(`/projects/${projectId}/members`, payload)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKey(projectId) });
      toast.success("Member added");
    },
    onError: (err) => toast.error(extractApiMessage(err, "Failed to add member")),
  });
}

export function useUpdateMemberRole(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }) =>
      (await api.patch(`/projects/${projectId}/members/${userId}`, { role })).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKey(projectId) });
      toast.success("Role updated");
    },
    onError: (err) => toast.error(extractApiMessage(err, "Failed to update role")),
  });
}

export function useRemoveMember(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId) =>
      (await api.delete(`/projects/${projectId}/members/${userId}`)).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKey(projectId) });
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Member removed");
    },
    onError: (err) => toast.error(extractApiMessage(err, "Failed to remove member")),
  });
}
