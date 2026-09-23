"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useAuthStore } from "@/store/authStore";
import { useCanvasStore } from "@/store/canvasStore";
import { fetchCanvases, deleteCanvasApi } from "@/lib/canvasApi";
import { AuthBackground } from "@/components/AuthBackground";
import { UserMenu } from "@/components/UserMenu";
import type { CanvasSummary } from "@/types";

export default function DashboardPage() {
  const token = useRequireAuth();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [canvases, setCanvases] = useState<CanvasSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    loadCanvases();
  }, [token]);

  async function loadCanvases() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCanvases();
      setCanvases(data);
    } catch {
      setError("Couldn't load your canvases. Try refreshing.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleCreate() {
    useCanvasStore.getState().resetCanvas();
    router.push("/canvas/new");
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this canvas? This can't be undone.")) return;
    try {
      await deleteCanvasApi(id);
      setCanvases((prev) => prev.filter((c) => c._id !== id));
    } catch {
      setError("Couldn't delete the canvas. Try again.");
    }
  }

  if (token === undefined || !token) return null;

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <main className="relative min-h-screen px-6 py-8">
      <AuthBackground />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Header row: profile menu left, logout icon right */}
                {/* Header row: profile menu on the right */}
        <div className="flex items-center justify-end">
          <UserMenu />
        </div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10 text-center"
        >
          <h1 className="text-3xl font-semibold text-white">
            Let&apos;s start making canvases, {firstName}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Pick up where you left off, or start something new.
          </p>
        </motion.div>

        {/* Create + grid */}
        <div className="mt-10">
          {error && (
            <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Create new canvas card */}
            <motion.button
              onClick={handleCreate}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] text-zinc-300 transition hover:border-indigo-400/40 hover:bg-white/[0.05] hover:text-white"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xl text-white shadow-lg shadow-indigo-500/20">
                +
              </span>
              <span className="text-sm font-medium">New canvas</span>
            </motion.button>

            {isLoading ? (
              <div className="col-span-full py-10 text-center text-sm text-zinc-500">
                Loading your canvases…
              </div>
            ) : (
              <AnimatePresence>
                {canvases.map((canvas) => (
                  <motion.div
                    key={canvas._id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push(`/canvas/${canvas._id}`)}
                    className="group relative flex h-40 cursor-pointer flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-lg shadow-black/20 backdrop-blur-xl transition hover:border-indigo-400/30 hover:bg-white/[0.06]"
                  >
                    <div className="flex h-16 w-full items-center justify-center rounded-lg bg-gradient-to-br from-white/[0.06] to-white/[0.02] text-2xl">
                      🎨
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{canvas.name}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(canvas.updatedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDelete(canvas._id, e)}
                        title="Delete canvas"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          className="h-4 w-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {!isLoading && canvases.length === 0 && (
            <p className="mt-6 text-center text-sm text-zinc-500">
              No canvases yet — click &quot;New canvas&quot; above to create your first one.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}