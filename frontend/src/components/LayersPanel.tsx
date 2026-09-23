"use client";

import { ArrowUp, ArrowDown, Square, Circle as CircleIcon, Type } from "lucide-react";
import { useCanvasStore } from "@/store/canvasStore";

export function LayersPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedId = useCanvasStore((state) => state.selectedId);
  const selectElement = useCanvasStore((state) => state.selectElement);
  const moveLayer = useCanvasStore((state) => state.moveLayer);

  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  const iconFor = (type: (typeof elements)[number]["type"]) => {
    if (type === "rect") return <Square className="h-3.5 w-3.5" />;
    if (type === "circle") return <CircleIcon className="h-3.5 w-3.5" />;
    return <Type className="h-3.5 w-3.5" />;
  };

  const labelFor = (el: (typeof elements)[number]) =>
    el.type === "text" ? el.text || "Text" : el.type[0].toUpperCase() + el.type.slice(1);

  return (
    <div className="border-l border-t border-white/10 bg-zinc-900/60 p-4 backdrop-blur-xl">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Layers</h2>

      {elements.length === 0 ? (
        <p className="text-sm text-zinc-500">No elements yet.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {sorted.map((el) => (
            <li
              key={el.id}
              onClick={() => selectElement(el.id)}
              className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm transition ${
                el.id === selectedId
                  ? "bg-indigo-500/15 text-indigo-300"
                  : "text-zinc-300 hover:bg-white/5"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                {iconFor(el.type)}
                <span className="truncate">{labelFor(el)}</span>
              </span>
              <span className="flex shrink-0 gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayer(el.id, "up");
                  }}
                  title="Bring forward"
                  className="rounded p-1 text-zinc-500 hover:bg-white/10 hover:text-white"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayer(el.id, "down");
                  }}
                  title="Send backward"
                  className="rounded p-1 text-zinc-500 hover:bg-white/10 hover:text-white"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}