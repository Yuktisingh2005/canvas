import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../utils/AppError";

// Validates req.body against the given Zod schema and replaces req.body with the
// parsed (and type-coerced) result, so controllers can trust the shape of the data.
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      return next(new AppError(`Validation failed — ${message}`, 400));
    }

    req.body = result.data;
    next();
  };
}