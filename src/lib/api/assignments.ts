import { createClient } from "@/lib/supabase/client";
import { resolveAssignees } from "./content";
import type { ContentAssignee } from "@/types";

export async function updateAssignees(
  contentId: string,
  selectedUserIds: string[],
): Promise<ContentAssignee[]> {
  const supabase = createClient();

  const finalIds = await resolveAssignees(selectedUserIds, 3);

  await supabase.from("content_assignees").delete().eq("content_id", contentId);

  const rows = finalIds.map((uid) => ({ content_id: contentId, user_id: uid }));
  const { error } = await supabase.from("content_assignees").insert(rows);
  if (error) throw new Error(error.message);

  const { data } = await supabase
    .from("content_assignees")
    .select("*")
    .eq("content_id", contentId);

  const enriched = await Promise.all(
    (data ?? []).map(async (row) => {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", row.user_id)
        .single();
      return { ...row, profile: profile ?? null };
    }),
  );

  return enriched as ContentAssignee[];
}
