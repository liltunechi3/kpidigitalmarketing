import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";

export default async function DashboardIndexPage() {
  const { profile } = await requireProfile();

  if (profile.role === "head_digital_marketing") {
    redirect("/dashboard/admin/team");
  }

  redirect("/dashboard/todo");
}
