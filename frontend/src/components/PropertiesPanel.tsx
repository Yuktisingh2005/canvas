"use client";

import { useCanvasStore } from "@/store/canvasStore";

export function PropertiesPanel() {
  const elements = useCanvasStore((state) => state.elements);
  const selectedId = useCanvasStore((state) => state.selectedId);
  const updateElement = useCanvasStore((state) => state.updateElement);

  const selected = elements.find((el) => el.id === selectedId);

  if (!selected) {
    return (
      <aside className="border-l border-white/10 bg-zinc-900/60 p-4 backdrop-blur-xl">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Properties
        </h2>
        <p className="text-sm text-zinc-500">Select an element to edit its properties.</p>
      </aside>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-zinc-100 outline-none transition focus:border-indigo-400/50 focus:bg-white/[0.08]";

  const field = (
    label: string,
    key: "x" | "y" | "width" | "height" | "radius" | "rotation" | "fontSize"
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-500">{label}</label>
      <input
        type="number"
        value={Math.round((selected[key] as number) ?? 0)}
        onChange={(e) => updateElement(selected.id, { [key]: Number(e.target.value) })}
        className={inputClass}
      />
    </div>
  );

  return (
    <aside className="border-l border-white/10 bg-zinc-900/60 p-4 backdrop-blur-xl">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Properties
      </h2>
      <p className="mb-4 text-sm font-medium text-white">
        {selected.type[0].toUpperCase() + selected.type.slice(1)}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {field("X", "x")}
        {field("Y", "y")}

        {selected.type === "rect" && (
          <>
            {field("Width", "width")}
            {field("Height", "height")}
          </>
        )}

        {selected.type === "circle" && field("Radius", "radius")}

        {field("Rotation", "rotation")}

        {selected.type === "text" && field("Font size", "fontSize")}
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500">Fill color</label>
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1.5">
          <input
            type="color"
            value={selected.fill}
            onChange={(e) => updateElement(selected.id, { fill: e.target.value })}
            className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent"
          />
          <span className="text-xs text-zinc-400">{selected.fill}</span>
        </div>
      </div>

      {selected.type === "text" && (
        <div className="mt-4 flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Text</label>
          <input
            value={selected.text ?? ""}
            onChange={(e) => updateElement(selected.id, { text: e.target.value })}
            className={inputClass}
          />
        </div>
      )}
    </aside>
  );
}