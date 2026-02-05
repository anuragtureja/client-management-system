import { db } from "./db";
import {
  clients,
  developers,
  type CreateClientRequest,
  type UpdateClientRequest,
  type ClientResponse,
  type CreateDeveloperRequest,
  type DeveloperResponse
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Client methods
  getClients(): Promise<ClientResponse[]>;
  getClient(id: number): Promise<ClientResponse | undefined>;
  createClient(client: CreateClientRequest): Promise<ClientResponse>;
  updateClient(id: number, updates: UpdateClientRequest): Promise<ClientResponse>;
  deleteClient(id: number): Promise<void>;
  
  // Developer methods
  getDevelopers(): Promise<DeveloperResponse[]>;
  getDeveloper(id: number): Promise<DeveloperResponse | undefined>;
  createDeveloper(developer: CreateDeveloperRequest): Promise<DeveloperResponse>;
  updateDeveloper(id: number, updates: Partial<CreateDeveloperRequest>): Promise<DeveloperResponse>;
  deleteDeveloper(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Client methods
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

  // Developer methods
  async getDevelopers(): Promise<DeveloperResponse[]> {
    return await db.select().from(developers).orderBy(developers.id);
  }

  async getDeveloper(id: number): Promise<DeveloperResponse | undefined> {
    const [developer] = await db.select().from(developers).where(eq(developers.id, id));
    return developer;
  }

  async createDeveloper(developer: CreateDeveloperRequest): Promise<DeveloperResponse> {
    const [newDeveloper] = await db.insert(developers).values(developer).returning();
    return newDeveloper;
  }

  async updateDeveloper(id: number, updates: Partial<CreateDeveloperRequest>): Promise<DeveloperResponse> {
    const [updated] = await db.update(developers).set(updates).where(eq(developers.id, id)).returning();
    return updated;
  }

  async deleteDeveloper(id: number): Promise<void> {
    await db.delete(developers).where(eq(developers.id, id));
  }
}

export const storage = new DatabaseStorage();
