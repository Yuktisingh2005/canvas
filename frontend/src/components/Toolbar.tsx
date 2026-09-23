"use client";

import { Square, Circle as CircleIcon, Type, Trash2, Undo2, Redo2, Download, Save } from "lucide-react";
import { useCanvasStore } from "@/store/canvasStore";
import type { ElementType } from "@/types";

interface ToolbarProps {
  onSave: () => void;
  isSaving: boolean;
  canvasName: string;
  onNameChange: (name: string) => void;
  onExport: () => void;
}

function ToolButton({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

export function Toolbar({ onSave, isSaving, canvasName, onNameChange, onExport }: ToolbarProps) {
  const addElement = useCanvasStore((state) => state.addElement);
  const deleteElement = useCanvasStore((state) => state.deleteElement);
  const selectedId = useCanvasStore((state) => state.selectedId);
  const undo = useCanvasStore((state) => state.undo);
  const redo = useCanvasStore((state) => state.redo);
  const pastLength = useCanvasStore((state) => state.past.length);
  const futureLength = useCanvasStore((state) => state.future.length);

  const shapes: { type: ElementType; label: string; icon: React.ReactNode }[] = [
    { type: "rect", label: "Rectangle", icon: <Square className="h-4 w-4" /> },
    { type: "circle", label: "Circle", icon: <CircleIcon className="h-4 w-4" /> },
    { type: "text", label: "Text", icon: <Type className="h-4 w-4" /> },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-white/10 bg-zinc-900/80 px-4 py-2.5 backdrop-blur-xl">
      <input
        value={canvasName}
        onChange={(e) => onNameChange(e.target.value)}
        className="rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-medium text-white outline-none transition hover:border-white/10 hover:bg-white/5 focus:border-indigo-400/40 focus:bg-white/5"
      />

      <div className="h-6 w-px bg-white/10" />

      <div className="flex items-center gap-1">
        {shapes.map((shape) => (
          <ToolButton key={shape.type} onClick={() => addElement(shape.type)} title={`Add ${shape.label}`}>
            {shape.icon}
          </ToolButton>
        ))}
        <ToolButton
          onClick={() => selectedId && deleteElement(selectedId)}
          disabled={!selectedId}
          title="Delete selected"
        >
          <Trash2 className="h-4 w-4" />
        </ToolButton>
      </div>

      <div className="h-6 w-px bg-white/10" />

      <div className="flex items-center gap-1">
        <ToolButton onClick={undo} disabled={pastLength === 0} title="Undo (Ctrl+Z)">
          <Undo2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton onClick={redo} disabled={futureLength === 0} title="Redo (Ctrl+Shift+Z)">
          <Redo2 className="h-4 w-4" />
        </ToolButton>
      </div>

      <div className="flex-1" />

      <button
        onClick={onExport}
        className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
      >
        <Download className="h-3.5 w-3.5" />
        Export PNG
      </button>

      <button
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 disabled:opacity-50"
      >
        <Save className="h-3.5 w-3.5" />
        {isSaving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}