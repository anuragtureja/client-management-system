import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { createAuthRouter, requireAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Register auth routes (no auth required)
  app.use("/api/auth", createAuthRouter());

  // All client routes require authentication
  app.get(api.clients.list.path, requireAuth, async (req, res) => {
    const clients = await storage.getClients();
    res.json(clients);
  });

  app.get(api.clients.get.path, requireAuth, async (req, res) => {
    const client = await storage.getClient(Number(req.params.id));
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  });

  app.post(api.clients.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.clients.create.input.parse(req.body);
      const client = await storage.createClient(input);
      res.status(201).json(client);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.clients.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.clients.update.input.parse(req.body);
      const updatedClient = await storage.updateClient(Number(req.params.id), input);
      if (!updatedClient) {
        return res.status(404).json({ message: 'Client not found' });
      }
      res.json(updatedClient);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.clients.delete.path, requireAuth, async (req, res) => {
    await storage.deleteClient(Number(req.params.id));
    res.status(204).send();
  });

  // Seed data — if the database isn't initialized yet this may fail.
  // Catch and log errors so the server can still start in dev.
  try {
    await seedDatabase();
  } catch (err: any) {
    console.warn("Database seed skipped:", err?.message ?? err);
  }

  return httpServer;
}

async function seedDatabase() {
  const existingClients = await storage.getClients();
  if (existingClients.length === 0) {
    await storage.createClient({
      name: "Acme Corp",
      email: "contact@acme.com",
      phone: "555-0123",
      details: "Leading supplier of road runner traps.",
      budget: "50000",
      status: "In Progress",
      assignedDeveloper: "John Doe"
    });
    await storage.createClient({
      name: "Wayne Enterprises",
      email: "bruce@wayne.com",
      phone: "555-0999",
      details: "Secret project 'Batmobile upgrade'.",
      budget: "1000000",
      status: "New",
      assignedDeveloper: "Lucius Fox"
    });
    await storage.createClient({
      name: "Stark Industries",
      email: "tony@stark.com",
      phone: "555-3000",
      details: "Jarvis AI enhancement.",
      budget: "5000000",
      status: "Completed",
      assignedDeveloper: "Tony Stark"
    });
  }
}
