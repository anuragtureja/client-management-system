import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const developers = pgTable("developers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  techStack: text("tech_stack"),
  skills: text("skills"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDeveloperSchema = createInsertSchema(developers).omit({ 
  id: true, 
  createdAt: true 
});

export type Developer = typeof developers.$inferSelect;
export type InsertDeveloper = z.infer<typeof insertDeveloperSchema>;

// Explicit API types for developers
export type CreateDeveloperRequest = InsertDeveloper;
export type UpdateDeveloperRequest = Partial<InsertDeveloper>;
export type DeveloperResponse = Developer;
export type DevelopersListResponse = Developer[];

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  details: text("details"),
  budget: numeric("budget").notNull(), // Using numeric for currency
  status: text("status").notNull().default("New"), // New, In Progress, Completed, On Hold
  assignedDeveloper: text("assigned_developer"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  budget: z.string().or(z.number()).transform(v => String(v)), // Handle form input which might be string or number
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

// Explicit API types
export type CreateClientRequest = InsertClient;
export type UpdateClientRequest = Partial<InsertClient>;
export type ClientResponse = Client;
export type ClientsListResponse = Client[];
