import { api } from "@/lib/api";
import type { CanvasDoc, CanvasSummary } from "@/types";

export async function fetchCanvases(): Promise<CanvasSummary[]> {
  const { data } = await api.get<CanvasSummary[]>("/canvases");
  return data;
}

export async function fetchCanvas(id: string): Promise<CanvasDoc> {
  const { data } = await api.get<CanvasDoc>(`/canvases/${id}`);
  return data;
}

export async function createCanvasApi(name: string): Promise<CanvasDoc> {
  const { data } = await api.post<CanvasDoc>("/canvases", { name, elements: [] });
  return data;
}

export async function updateCanvasApi(
  id: string,
  payload: { name?: string; elements?: CanvasDoc["elements"] }
): Promise<CanvasDoc> {
  const { data } = await api.put<CanvasDoc>(`/canvases/${id}`, payload);
  return data;
}

export async function deleteCanvasApi(id: string): Promise<void> {
  await api.delete(`/canvases/${id}`);
}