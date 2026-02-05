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

  // All developer routes require authentication
  app.get(api.developers.list.path, requireAuth, async (req, res) => {
    const developers = await storage.getDevelopers();
    res.json(developers);
  });

  app.get(api.developers.get.path, requireAuth, async (req, res) => {
    const developer = await storage.getDeveloper(Number(req.params.id));
    if (!developer) {
      return res.status(404).json({ message: 'Developer not found' });
    }
    res.json(developer);
  });

  app.post(api.developers.create.path, requireAuth, async (req, res) => {
    console.log('Developer create route hit! User:', req.user);
    try {
      const input = api.developers.create.input.parse(req.body);
      console.log('Creating developer:', input);
      const developer = await storage.createDeveloper(input);
      console.log('Developer created:', developer);
      res.status(201).json(developer);
    } catch (err) {
      console.error('Developer creation error:', err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.developers.delete.path, requireAuth, async (req, res) => {
    await storage.deleteDeveloper(Number(req.params.id));
    res.status(204).send();
  });

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
  const defaults = [
    {
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      techStack: "React, Node",
      skills: "Frontend, Typescript",
      description: "Senior frontend engineer",
    },
    {
      name: "Mike Chen",
      email: "mike@example.com",
      techStack: "Node, Postgres",
      skills: "Backend, Databases",
      description: "Backend specialist",
    },
    {
      name: "Alex Rivera",
      email: "alex@example.com",
      techStack: "Fullstack",
      skills: "React, Node, DevOps",
      description: "Fullstack developer",
    },
    {
      name: "Jessica Wong",
      email: "jessica@example.com",
      techStack: "Python, ML",
      skills: "Data Science, ML",
      description: "Machine learning engineer",
    },
  ];

  const existingDevelopers = await storage.getDevelopers();
  for (const d of defaults) {
    const found = existingDevelopers.find((ed) => ed.email === d.email);
    if (found) {
      await storage.updateDeveloper(found.id, {
        techStack: d.techStack,
        skills: d.skills,
        description: d.description,
      });
    } else {
      await storage.createDeveloper(d as any);
    }
  }

  const existingClients = await storage.getClients();
  if (existingClients.length === 0) {
    await storage.createClient({
      name: "Acme Corp",
      email: "contact@acme.com",
      phone: "555-0123",
      details: "Leading supplier of road runner traps.",
      budget: "50000",
      status: "In Progress",
      assignedDeveloper: "Sarah Jenkins"
    });
    await storage.createClient({
      name: "Wayne Enterprises",
      email: "bruce@wayne.com",
      phone: "555-0999",
      details: "Secret project 'Batmobile upgrade'.",
      budget: "1000000",
      status: "New",
      assignedDeveloper: "Mike Chen"
    });
    await storage.createClient({
      name: "Stark Industries",
      email: "tony@stark.com",
      phone: "555-3000",
      details: "Jarvis AI enhancement.",
      budget: "5000000",
      status: "Completed",
      assignedDeveloper: "Alex Rivera"
    });
  }
}

