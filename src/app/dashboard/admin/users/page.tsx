import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { UserRoleRow } from "@/components/UserRoleRow";
import type { Profile } from "@/lib/supabase/types";

export default async function UsersPage() {
  const { userId } = await requireAdmin();
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Kelola Anggota Tim</h1>
        <p className="text-sm text-slate-500">
          Anggota baru mendaftar sendiri lewat halaman{" "}
          <a href="/signup" className="underline">
            Daftar
          </a>
          . Di sini kamu bisa mengatur role dan hak admin mereka.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Admin?</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {((profiles as Profile[]) ?? []).map((p) => (
              <UserRoleRow key={p.id} profile={p} isSelf={p.id === userId} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
