import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";

// Augment Express's Request type so `req.userId` is recognized everywhere downstream.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Missing or malformed Authorization header", 401));
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}