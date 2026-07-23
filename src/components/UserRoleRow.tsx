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
    <tr className="border-t border-slate-100">
      <td className="px-3 py-2 font-medium text-slate-900">
        {profile.full_name}
        {isSelf && <span className="ml-1 text-xs text-slate-400">(kamu)</span>}
      </td>
      <td className="px-3 py-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as TeamRole)}
          className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
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
            className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {pending ? "..." : "Simpan"}
          </button>
          {saved && !pending && <span className="text-xs text-emerald-600">✓</span>}
        </div>
      </td>
    </tr>
  );
}
