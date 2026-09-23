import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type { CanvasElement, ElementType } from "@/types";

const MAX_HISTORY = 50;

interface CanvasState {
  canvasId: string | null;
  canvasName: string;
  elements: CanvasElement[];
  selectedId: string | null;
  past: CanvasElement[][];
  future: CanvasElement[][];

  loadCanvas: (id: string, name: string, elements: CanvasElement[]) => void;
  resetCanvas: () => void;
  setCanvasName: (name: string) => void;

  addElement: (type: ElementType) => void;
  updateElement: (id: string, changes: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  moveLayer: (id: string, direction: "up" | "down") => void;

  undo: () => void;
  redo: () => void;
}

function defaultsFor(type: ElementType): Omit<CanvasElement, "id" | "zIndex"> {
  switch (type) {
    case "rect":
      return { type, x: 80, y: 80, width: 120, height: 80, rotation: 0, fill: "#4F46E5" };
    case "circle":
      return { type, x: 200, y: 200, radius: 50, rotation: 0, fill: "#059669" };
    case "text":
      return { type, x: 100, y: 100, rotation: 0, fill: "#111827", text: "Text", fontSize: 24 };
  }
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  canvasId: null,
  canvasName: "Untitled canvas",
  elements: [],
  selectedId: null,
  past: [],
  future: [],

  loadCanvas: (id, name, elements) =>
    set({ canvasId: id, canvasName: name, elements, selectedId: null, past: [], future: [] }),

  resetCanvas: () =>
    set({
      canvasId: null,
      canvasName: "Untitled canvas",
      elements: [],
      selectedId: null,
      past: [],
      future: [],
    }),

  setCanvasName: (name) => set({ canvasName: name }),

  addElement: (type) => {
    const { elements, past } = get();
    const newElement: CanvasElement = {
      id: uuid(),
      zIndex: elements.length,
      ...defaultsFor(type),
    };
    set({
      past: [...past, elements].slice(-MAX_HISTORY),
      future: [],
      elements: [...elements, newElement],
      selectedId: newElement.id,
    });
  },

  updateElement: (id, changes) => {
    const { elements, past } = get();
    set({
      past: [...past, elements].slice(-MAX_HISTORY),
      future: [],
      elements: elements.map((el) => (el.id === id ? { ...el, ...changes } : el)),
    });
  },

  deleteElement: (id) => {
    const { elements, past, selectedId } = get();
    set({
      past: [...past, elements].slice(-MAX_HISTORY),
      future: [],
      elements: elements.filter((el) => el.id !== id),
      selectedId: selectedId === id ? null : selectedId,
    });
  },

  selectElement: (id) => set({ selectedId: id }),

  moveLayer: (id, direction) => {
    const { elements, past } = get();
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const index = sorted.findIndex((el) => el.id === id);
    if (index === -1) return;

    const swapWith = direction === "up" ? index + 1 : index - 1;
    if (swapWith < 0 || swapWith >= sorted.length) return;

    const zA = sorted[index].zIndex;
    const zB = sorted[swapWith].zIndex;
    const idA = sorted[index].id;
    const idB = sorted[swapWith].id;

   
    const newElements = elements.map((el) => {
      if (el.id === idA) return { ...el, zIndex: zB };
      if (el.id === idB) return { ...el, zIndex: zA };
      return el;
    });

    set({
      past: [...past, elements].slice(-MAX_HISTORY),
      future: [],
      elements: newElements,
    });
  },

  undo: () => {
    const { past, future, elements } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [elements, ...future].slice(0, MAX_HISTORY),
      elements: previous,
      selectedId: null,
    });
  },

  redo: () => {
    const { past, future, elements } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      past: [...past, elements].slice(-MAX_HISTORY),
      future: future.slice(1),
      elements: next,
      selectedId: null,
    });
  },
}));