import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateClientRequest, type UpdateClientRequest } from "@shared/routes";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function useClients() {
  return useQuery({
    queryKey: [api.clients.list.path],
    queryFn: async () => {
      const res = await fetch(api.clients.list.path, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch clients");
      return api.clients.list.responses[200].parse(await res.json());
    },
  });
}

export function useClient(id: number) {
  return useQuery({
    queryKey: [api.clients.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.clients.get.path, { id });
      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch client");
      return api.clients.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateClientRequest) => {
      // Validate with Zod before sending to ensure type safety
      const validated = api.clients.create.input.parse(data);
      const res = await fetch(api.clients.create.path, {
        method: api.clients.create.method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(validated),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.clients.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create client");
      }
      return api.clients.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.clients.list.path] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateClientRequest) => {
      const validated = api.clients.update.input.parse(updates);
      const url = buildUrl(api.clients.update.path, { id });
      const res = await fetch(url, {
        method: api.clients.update.method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(validated),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.clients.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 404) throw new Error("Client not found");
        throw new Error("Failed to update client");
      }
      return api.clients.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.clients.list.path] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.clients.delete.path, { id });
      const res = await fetch(url, {
        method: api.clients.delete.method,
        headers: getAuthHeaders(),
      });
      if (res.status === 404) throw new Error("Client not found");
      if (!res.ok) throw new Error("Failed to delete client");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.clients.list.path] });
    },
  });
}
