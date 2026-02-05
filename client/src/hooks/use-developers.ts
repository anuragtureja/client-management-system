import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateDeveloperRequest } from "@shared/routes";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export function useDevelopers() {
  return useQuery({
    queryKey: [api.developers.list.path],
    queryFn: async () => {
      const res = await fetch(api.developers.list.path, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch developers");
      return api.developers.list.responses[200].parse(await res.json());
    },
  });
}

export function useDeveloper(id: number) {
  return useQuery({
    queryKey: [api.developers.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.developers.get.path, { id });
      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch developer");
      return api.developers.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateDeveloper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDeveloperRequest) => {
      const validated = api.developers.create.input.parse(data);
      const res = await fetch(api.developers.create.path, {
        method: api.developers.create.method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(validated),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.developers.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create developer");
      }
      return api.developers.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.developers.list.path] });
    },
  });
}

export function useDeleteDeveloper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.developers.delete.path, { id });
      const res = await fetch(url, {
        method: api.developers.delete.method,
        headers: getAuthHeaders(),
      });
      if (res.status === 404) throw new Error("Developer not found");
      if (!res.ok) throw new Error("Failed to delete developer");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.developers.list.path] });
    },
  });
}
