"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLE_OPTIONS } from "@/lib/roles";
import type { TeamRole } from "@/lib/supabase/types";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<TeamRole>("content_creator");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setInfo("Akun dibuat! Cek email kamu untuk konfirmasi, lalu login.");
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cream-50 via-cream-50 to-cream-200 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl">
            <img src="/brand-mark.png" alt="KPI Digital Marketing" className="h-full w-full object-cover" />
          </span>
        </div>
        <div className="rounded-2xl border border-black/[0.06] bg-white p-8 shadow-[0_1px_2px_rgba(16,15,10,0.04),0_16px_40px_-20px_rgba(16,15,10,0.35)]">
        <h1 className="mb-1 text-xl font-semibold text-neutral-900">Daftar Akun Tim</h1>
        <p className="mb-6 text-sm text-neutral-500">
          Akun pertama yang daftar otomatis jadi Admin / Head of Digital Marketing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-neutral-700">Nama Lengkap</label>
            <input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
            />
          </div>
          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium text-neutral-700">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as TeamRole)}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-neutral-700">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
            />
          </div>

          {error && <p className="text-sm text-[#131c2e]">{error}</p>}
          {info && <p className="text-sm text-[#3d5278]">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 transition disabled:opacity-50"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-neutral-900 underline">
            Masuk
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
