import type { TeamRole } from "@/lib/supabase/types";

export const ROLE_LABELS: Record<TeamRole, string> = {
  content_creator: "Content Creator",
  graphic_designer: "Graphic Designer",
  host_live: "Host Live & Talent",
  head_digital_marketing: "Head of Digital Marketing",
};

export const ROLE_OPTIONS: { value: TeamRole; label: string }[] = [
  { value: "content_creator", label: ROLE_LABELS.content_creator },
  { value: "graphic_designer", label: ROLE_LABELS.graphic_designer },
  { value: "host_live", label: ROLE_LABELS.host_live },
  { value: "head_digital_marketing", label: ROLE_LABELS.head_digital_marketing },
];
