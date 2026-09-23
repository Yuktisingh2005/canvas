import { api } from "@/lib/api";
import type { User } from "@/types";

interface AuthResponse {
  token: string;
  user: User;
}

export async function registerUser(name: string, email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/register", { name, email, password });
  return data;
}

export async function loginUser(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}