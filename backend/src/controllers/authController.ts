import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { signToken } from "../utils/jwt";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with that email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  const token = signToken(user.id);
  res.status(201).json({ token, user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken(user.id);
  res.status(200).json({ token, user });
});