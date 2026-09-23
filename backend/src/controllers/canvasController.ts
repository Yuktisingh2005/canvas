import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Canvas } from "../models/Canvas";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

function assertValidId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid canvas id", 400);
  }
}

export const createCanvas = asyncHandler(async (req: Request, res: Response) => {
  const { name, elements } = req.body;

  const canvas = await Canvas.create({ name, elements, userId: req.userId });
  res.status(201).json(canvas);
});

export const listCanvases = asyncHandler(async (req: Request, res: Response) => {
  
  const canvases = await Canvas.find({ userId: req.userId })
    .select("name createdAt updatedAt")
    .sort({ updatedAt: -1 });

  res.status(200).json(canvases);
});

export const getCanvas = asyncHandler(async (req: Request, res: Response) => {
  assertValidId(req.params.id);

  const canvas = await Canvas.findOne({ _id: req.params.id, userId: req.userId });
  if (!canvas) throw new AppError("Canvas not found", 404);

  res.status(200).json(canvas);
});

export const updateCanvas = asyncHandler(async (req: Request, res: Response) => {
  assertValidId(req.params.id);

  const canvas = await Canvas.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!canvas) throw new AppError("Canvas not found", 404);

  res.status(200).json(canvas);
});

export const deleteCanvas = asyncHandler(async (req: Request, res: Response) => {
  assertValidId(req.params.id);

  const canvas = await Canvas.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!canvas) throw new AppError("Canvas not found", 404);

  res.status(204).send();
});