import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Must be a valid email"),
  password: z.string().min(1, "Password is required"),
});

const elementSchema = z.object({
  id: z.string(),
  type: z.enum(["rect", "circle", "text"]),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  rotation: z.number().default(0),
  fill: z.string().default("#4f46e5"),
  text: z.string().optional(),
  fontSize: z.number().optional(),
  zIndex: z.number().default(0),
});

export const createCanvasSchema = z.object({
  name: z.string().min(1, "Canvas name is required"),
  elements: z.array(elementSchema).default([]),
});


export const updateCanvasSchema = z.object({
  name: z.string().min(1).optional(),
  elements: z.array(elementSchema).optional(),
});