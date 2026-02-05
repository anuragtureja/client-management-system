import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { loginSchema } from "@shared/routes";

// Hardcoded credentials for demo
const VALID_USER = {
  email: "anuragtureja@gmail.com",   // 👈 अपना email
  password: "123456",          // 👈 अपना password
};


const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
      };
    }
  }
}

// Middleware to verify JWT token
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid authorization header" });
  }

  const token = authHeader.substring(7).trim(); // Remove "Bearer " prefix and trim

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    req.user = decoded;
    next();
  } catch (err: any) {
    console.error('JWT Verification Error:', err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Auth routes
export function createAuthRouter() {
  const router = Router();

  router.post("/login", (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      // Check credentials
      if (email !== VALID_USER.email || password !== VALID_USER.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      // Use a longer expiry in development to avoid immediate expirations during local testing
      const expiry = process.env.NODE_ENV === "production" ? "24h" : "7d";
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: expiry });

      return res.status(200).json({ token });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/logout", (req: Request, res: Response) => {
    // JWT is stateless, so logout is just client-side (removing token from localStorage)
    // This endpoint is optional but can be used for audit logging
    return res.status(200).json({ message: "Logged out successfully" });
  });

  return router;
}
