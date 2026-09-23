export type ElementType = "rect" | "circle" | "text";

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  rotation: number;
  fill: string;
  text?: string;
  fontSize?: number;
  zIndex: number;
}

export interface CanvasDoc {
  _id: string;
  name: string;
  elements: CanvasElement[];
  createdAt: string;
  updatedAt: string;
}

// Trimmed shape returned by the list endpoint (no elements array).
export interface CanvasSummary {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}