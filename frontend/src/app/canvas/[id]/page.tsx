"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useCanvasStore } from "@/store/canvasStore";
import { fetchCanvas, createCanvasApi, updateCanvasApi } from "@/lib/canvasApi";
import { Toolbar } from "@/components/Toolbar";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { LayersPanel } from "@/components/LayersPanel";
import { useDebouncedEffect } from "@/lib/useDebouncedEffect";

const CanvasStage = dynamic(
  () => import("@/components/CanvasStage").then((mod) => mod.CanvasStage),
  { ssr: false }
);

export default function CanvasEditorPage() {
  const token = useRequireAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
    const hasInitiatedCreateRef = useRef(false);

  const exportFnRef = useRef<(() => string) | null>(null);

  const { canvasId, canvasName, elements, loadCanvas, resetCanvas, setCanvasName } =
    useCanvasStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const isNew = params.id === "new";

  // Combined signal the Toolbar's Save button reacts to — a manual save and
  // an in-flight autosave both show the same "Saving…" state on the button.
  const isBusy = isSaving || autosaveStatus === "saving";

   useEffect(() => {
    if (!token) return;

    if (!isNew && canvasId === params.id) {
      setIsLoading(false);
      return;
    }

    if (isNew) {
      // Guards against React 18 Strict Mode's double-invoke of effects in
      // development, which would otherwise fire createCanvasApi twice and
      // create two canvases before the URL even updates.
      if (hasInitiatedCreateRef.current) return;
      hasInitiatedCreateRef.current = true;

      resetCanvas();
      createCanvasApi("Untitled canvas")
        .then((created) => {
          loadCanvas(created._id, created.name, created.elements);
          router.replace(`/canvas/${created._id}`);
        })
        .catch(() => {
          setError("Couldn't create a new canvas. Try again.");
          hasInitiatedCreateRef.current = false; // allow retry on failure
        })
        .finally(() => setIsLoading(false));
      return;
    }

    fetchCanvas(params.id)
      .then((doc) => loadCanvas(doc._id, doc.name, doc.elements))
      .catch(() => setError("Couldn't load this canvas."))
      .finally(() => setIsLoading(false));
  }, [token, params.id]);

  // Autosave: fires 2s after elements/name stop changing, once the canvas has
  // a real id (which now happens immediately on creation, see above).
  useDebouncedEffect(
    () => {
      if (!canvasId || isLoading) return;
      setAutosaveStatus("saving");
      updateCanvasApi(canvasId, { name: canvasName, elements })
        .then(() => setAutosaveStatus("saved"))
        .catch(() => setAutosaveStatus("idle"));
    },
    [canvasId, canvasName, elements, isLoading],
    2000
  );

  // Keyboard shortcuts: Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z (or Ctrl+Y) to redo.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (isTyping) return;

      const key = e.key.toLowerCase();
      const isUndo = (e.ctrlKey || e.metaKey) && !e.shiftKey && key === "z";
      const isRedo =
        ((e.ctrlKey || e.metaKey) && e.shiftKey && key === "z") ||
        ((e.ctrlKey || e.metaKey) && key === "y");

      if (isUndo) {
        e.preventDefault();
        useCanvasStore.getState().undo();
      } else if (isRedo) {
        e.preventDefault();
        useCanvasStore.getState().redo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleExport() {
    const dataUrl = exportFnRef.current?.();
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download = `${canvasName || "canvas"}.png`;
    link.href = dataUrl;
    link.click();
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      if (canvasId) {
        await updateCanvasApi(canvasId, { name: canvasName, elements });
      } else {
        const created = await createCanvasApi(canvasName);
        await updateCanvasApi(created._id, { elements });
        router.replace(`/canvas/${created._id}`);
      }
    } catch {
      setError("Couldn't save. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!token || isLoading) return null;

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900/80 px-4 py-2 backdrop-blur-xl">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>

        {error && (
          <p className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs text-red-300">
            {error}
          </p>
        )}
      </div>

      <Toolbar
        onSave={handleSave}
        isSaving={isBusy}
        canvasName={canvasName}
        onNameChange={setCanvasName}
        onExport={handleExport}
      />

      <div className="flex flex-1 overflow-hidden">
        <CanvasStage onExportReady={(fn) => { exportFnRef.current = fn; }} />
        <div className="flex w-64 flex-col overflow-y-auto">
          <PropertiesPanel />
          <LayersPanel />
        </div>
      </div>
    </div>
  );
}