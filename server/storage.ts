import { db } from "./db";
import {
  clients,
  type CreateClientRequest,
  type UpdateClientRequest,
  type ClientResponse
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getClients(): Promise<ClientResponse[]>;
  getClient(id: number): Promise<ClientResponse | undefined>;
  createClient(client: CreateClientRequest): Promise<ClientResponse>;
  updateClient(id: number, updates: UpdateClientRequest): Promise<ClientResponse>;
  deleteClient(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getClients(): Promise<ClientResponse[]> {
    return await db.select().from(clients).orderBy(clients.id);
  }

  async getClient(id: number): Promise<ClientResponse | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(client: CreateClientRequest): Promise<ClientResponse> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: number, updates: UpdateClientRequest): Promise<ClientResponse> {
    const [updated] = await db.update(clients)
      .set(updates)
      .where(eq(clients.id, id))
      .returning();
    return updated;
  }

  async deleteClient(id: number): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }
}

export const storage = new DatabaseStorage();
