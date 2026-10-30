"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "@/app/dashboard/admin/users/actions";
import { ROLE_OPTIONS } from "@/lib/roles";
import type { Profile, TeamRole } from "@/lib/supabase/types";

export function UserRoleRow({ profile, isSelf }: { profile: Profile; isSelf: boolean }) {
  const [role, setRole] = useState<TeamRole>(profile.role);
  const [isAdmin, setIsAdmin] = useState(profile.is_admin);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await updateUserRole({ id: profile.id, role, is_admin: isAdmin });
      setSaved(true);
    });
  }

  return (
    <tr className="border-t border-black/[0.045]">
      <td className="px-3 py-2 font-medium text-neutral-900">
        {profile.full_name}
        {isSelf && <span className="ml-1 text-xs text-neutral-400">(kamu)</span>}
      </td>
      <td className="px-3 py-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as TeamRole)}
          className="rounded-xl border border-black/10 bg-white px-2 py-1 text-sm"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <input
          type="checkbox"
          checked={isAdmin}
          onChange={(e) => setIsAdmin(e.target.checked)}
          className="h-4 w-4"
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition disabled:opacity-50"
          >
            {pending ? "..." : "Simpan"}
          </button>
          {saved && !pending && <span className="text-xs text-[#3d5278]">✓</span>}
        </div>
      </td>
    </tr>
  );
}
