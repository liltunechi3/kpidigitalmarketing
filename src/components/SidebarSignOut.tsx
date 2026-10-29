"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconLogOut } from "@/components/icons";

export function SidebarSignOut() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="group relative">
      <button
        onClick={handleSignOut}
        aria-label="Keluar"
        className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-cream-100 hover:text-neutral-900"
      >
        <IconLogOut className="h-4 w-4" />
      </button>
      <span className="pointer-events-none absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        Keluar
      </span>
    </div>
  );
}
