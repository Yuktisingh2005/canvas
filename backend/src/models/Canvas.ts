import { Schema, model, Types, type Document } from "mongoose";

export type ElementType = "rect" | "circle" | "text";

export interface ICanvasElement {
  id: string; // client-generated id (uuid), stable across saves
  type: ElementType;
  x: number;
  y: number;
  width?: number; // rect
  height?: number; // rect
  radius?: number; // circle
  rotation: number;
  fill: string;
  text?: string; // text elements only
  fontSize?: number; // text elements only
  zIndex: number;
}

export interface ICanvas extends Document {
  name: string;
  userId: Types.ObjectId;
  elements: ICanvasElement[];
  createdAt: Date;
  updatedAt: Date;
}

const elementSchema = new Schema<ICanvasElement>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ["rect", "circle", "text"], required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: Number,
    height: Number,
    radius: Number,
    rotation: { type: Number, default: 0 },
    fill: { type: String, default: "#4f46e5" },
    text: String,
    fontSize: Number,
    zIndex: { type: Number, default: 0 },
  },
  { _id: false }
);

const canvasSchema = new Schema<ICanvas>(
  {
    name: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    elements: { type: [elementSchema], default: [] },
  },
  { timestamps: true }
);

export const Canvas = model<ICanvas>("Canvas", canvasSchema);