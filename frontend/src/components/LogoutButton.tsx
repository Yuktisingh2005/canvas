"use client";

import { useAuthStore } from "@/store/authStore";

export function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <button
      onClick={logout}
      title="Log out"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="h-4.5 w-4.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l5-5-5-5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12H9" />
      </svg>
    </button>
  );
}