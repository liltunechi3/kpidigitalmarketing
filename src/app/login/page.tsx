"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cream-50 via-cream-50 to-cream-200 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl">
            <img src="/brand-mark.png" alt="KPI Digital Marketing" className="h-full w-full object-cover" />
          </span>
        </div>
        <div className="rounded-2xl border border-black/[0.06] bg-white p-8 shadow-[0_1px_2px_rgba(16,15,10,0.04),0_16px_40px_-20px_rgba(16,15,10,0.35)]">
        <h1 className="mb-1 text-xl font-semibold text-neutral-900">KPI Digital Marketing</h1>
        <p className="mb-6 text-sm text-neutral-500">Masuk untuk mengisi to-do list & lihat skor KPI kamu.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5"
            />
          </div>

          {error && <p className="text-sm text-[#a8503f]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 transition disabled:opacity-50"
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Belum punya akun?{" "}
          <Link href="/signup" className="font-medium text-neutral-900 underline">
            Daftar
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
