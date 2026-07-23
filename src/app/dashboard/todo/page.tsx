import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/date";
import { DateSelector } from "@/components/DateSelector";
import { ContentCreatorForm } from "@/components/forms/ContentCreatorForm";
import { GraphicDesignerForm } from "@/components/forms/GraphicDesignerForm";
import { HostLiveForm } from "@/components/forms/HostLiveForm";
import type {
  LogContentCreator,
  LogGraphicDesigner,
  LogHostLive,
} from "@/lib/supabase/types";

export default async function TodoPage({
  searchParams,
}: {
  searchParams: Promise<{ tanggal?: string }>;
}) {
  const { userId, profile } = await requireProfile();
  const { tanggal: tanggalParam } = await searchParams;
  const tanggal = tanggalParam || todayISO();
  const supabase = await createClient();

  let body: React.ReactNode = null;

  if (profile.role === "content_creator") {
    const { data } = await supabase
      .from("log_content_creator")
      .select("*")
      .eq("user_id", userId)
      .eq("tanggal", tanggal)
      .maybeSingle();
    body = <ContentCreatorForm tanggal={tanggal} existing={data as LogContentCreator | null} />;
  } else if (profile.role === "graphic_designer") {
    const { data } = await supabase
      .from("log_graphic_designer")
      .select("*")
      .eq("user_id", userId)
      .eq("tanggal", tanggal)
      .maybeSingle();
    body = <GraphicDesignerForm tanggal={tanggal} existing={data as LogGraphicDesigner | null} />;
  } else if (profile.role === "host_live") {
    const { data } = await supabase
      .from("log_host_live")
      .select("*")
      .eq("user_id", userId)
      .eq("tanggal", tanggal)
      .order("created_at", { ascending: true });
    body = <HostLiveForm tanggal={tanggal} sessions={(data as LogHostLive[] | null) ?? []} />;
  } else {
    body = (
      <p className="text-sm text-slate-500">
        Head of Digital Marketing tidak mengisi to-do harian. Lihat{" "}
        <Link href="/dashboard/admin/team" className="underline">
          Ringkasan Tim
        </Link>{" "}
        atau isi{" "}
        <Link href="/dashboard/admin/monthly-input" className="underline">
          Input Bulanan
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">To-Do List Harian</h1>
        <DateSelector tanggal={tanggal} />
      </div>
      {body}
    </div>
  );
}
