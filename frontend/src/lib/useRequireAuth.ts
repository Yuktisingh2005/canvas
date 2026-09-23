"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

// Redirects to /login if there's no token — but only after localStorage has
// actually been read, so a page reload doesn't bounce a logged-in user out
// during the brief window before the persisted token loads.
export function useRequireAuth() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace("/login");
    }
  }, [hasHydrated, token, router]);

  return hasHydrated ? token : undefined; // undefined = "still checking"
}