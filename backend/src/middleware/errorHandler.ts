import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

// Must be registered LAST, after all routes. Express recognizes error middleware
// by its 4-argument signature.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Mongoose duplicate key error (e.g. registering with an email already in use)
  if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
    return res.status(409).json({ error: "That value is already in use" });
  }

  console.error("Unexpected error:", err);
  return res.status(500).json({ error: "Something went wrong on our end" });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}