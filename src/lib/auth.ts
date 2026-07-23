import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export async function requireProfile(): Promise<{ userId: string; profile: Profile }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return { userId: user.id, profile: profile as Profile };
}

export async function requireAdmin(): Promise<{ userId: string; profile: Profile }> {
  const result = await requireProfile();
  if (!result.profile.is_admin) {
    redirect("/dashboard");
  }
  return result;
}
