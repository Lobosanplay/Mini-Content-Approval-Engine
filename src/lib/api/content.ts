import { createClient } from "@/lib/supabase/client";
import type {
  ContentPiece,
  ContentAssignee,
  CreateContentPayload,
  UpdateContentPayload,
  ClientUpdatePayload,
  AdminApprovalPayload,
  UserProfile,
} from "@/types";

export async function fetchMyProfile(): Promise<UserProfile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();
  return data as UserProfile | null;
}

export async function fetchAllAdmins(): Promise<UserProfile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("role", "admin")
    .order("full_name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as UserProfile[];
}

export async function fetchAllUsers(): Promise<UserProfile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .order("full_name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as UserProfile[];
}

export async function upsertProfile(
  userId: string,
  email: string,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_profiles")
    .upsert(
      { user_id: userId, role: "creator", full_name: email.split("@")[0] },
      { onConflict: "user_id", ignoreDuplicates: true },
    );
  if (error) console.error("upsertProfile error:", error.message);
}

export async function resolveAssignees(
  selectedUserIds: string[],
  minCount = 1,
): Promise<string[]> {
  const allUsers = await fetchAllUsers();
  const allUserIds = allUsers.map((user) => user.user_id);

  let assignees = [...new Set(selectedUserIds)];

  while (assignees.length < minCount) {
    const remaining = allUserIds.filter((id) => !assignees.includes(id));
    if (remaining.length === 0) break;
    const random = remaining[Math.floor(Math.random() * remaining.length)];
    assignees.push(random);
  }

  return assignees.slice(0, Math.max(minCount, selectedUserIds.length));
}

function normalizeContent(item: Record<string, unknown>): ContentPiece {
  let video_urls: string[] = [];

  if (Array.isArray(item.video_urls) && item.video_urls.length > 0) {
    video_urls = item.video_urls as string[];
  } else if (typeof item.video_url === "string" && item.video_url) {
    video_urls = [item.video_url as string];
  }

  const { view_count, max_views, expires_at, ...cleanItem } = item;

  return {
    id: cleanItem.id as string,
    user_id: cleanItem.user_id as string,
    title: cleanItem.title as string,
    description: (cleanItem.description as string) ?? null,
    video_url: (cleanItem.video_url as string) ?? video_urls[0] ?? "",
    video_urls,
    status:
      (cleanItem.status as "pending" | "approved" | "rejected") ?? "pending",
    feedback: (cleanItem.feedback as string) ?? null,
    client_token: cleanItem.client_token as string,
    assigned_to: (cleanItem.assigned_to as string) ?? null,
    assigned_by: (cleanItem.assigned_by as string) ?? null,
    assigned_at: (cleanItem.assigned_at as string) ?? null,
    created_at: cleanItem.created_at as string,
    updated_at: cleanItem.updated_at as string,
  } as ContentPiece;
}

export async function fetchContentAssignees(
  contentId: string,
): Promise<ContentAssignee[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("content_assignees")
    .select("*")
    .eq("content_id", contentId);

  if (error) return [];

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

export async function fetchUserContent(): Promise<ContentPiece[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const contentWithAssignees = await Promise.all(
    (data ?? []).map(async (item) => {
      const assignees = await fetchContentAssignees(item.id);
      return { ...normalizeContent(item), assignees };
    }),
  );

  return contentWithAssignees;
}

export async function fetchAssignedContent(): Promise<ContentPiece[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: assigneeRows, error: aErr } = await supabase
    .from("content_assignees")
    .select("content_id")
    .eq("user_id", user.id);

  if (aErr) throw new Error(aErr.message);
  if (!assigneeRows || assigneeRows.length === 0) return [];

  const contentIds = assigneeRows.map((r) => r.content_id);

  const { data, error } = await supabase
    .from("content_pieces")
    .select("*")
    .in("id", contentIds)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const contentWithCreators = await Promise.all(
    (data ?? []).map(async (item) => {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", item.user_id)
        .single();
      const assignees = await fetchContentAssignees(item.id);
      return {
        ...normalizeContent(item),
        assignee: profile ?? null,
        assignees,
      };
    }),
  );

  return contentWithCreators;
}

export async function createContent(
  payload: CreateContentPayload,
): Promise<ContentPiece> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const primaryUrl = payload.video_urls[0] ?? payload.video_url;

  const selectedIds = payload.assignee_ids ?? [];
  const assigneeIds = await resolveAssignees(selectedIds, 1);

  const { data, error } = await supabase
    .from("content_pieces")
    .insert({
      title: payload.title,
      description: payload.description ?? null,
      video_url: primaryUrl,
      video_urls: payload.video_urls,
      user_id: user.id,
      assigned_to: assigneeIds[0] ?? null,
      assigned_by: user.id,
      assigned_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (assigneeIds.length > 0) {
    const rows = assigneeIds.map((uid) => ({
      content_id: data.id,
      user_id: uid,
    }));
    const { error: aErr } = await supabase
      .from("content_assignees")
      .insert(rows);
    if (aErr) console.error("content_assignees insert error:", aErr.message);

    const notifications = assigneeIds.map((uid) => ({
      user_id: uid,
      content_id: data.id,
      type: "assigned" as const,
      message: `You have been assigned to review "${payload.title}"`,
    }));
    await supabase.from("notifications").insert(notifications);
  }

  const assignees = await fetchContentAssignees(data.id);
  return { ...normalizeContent(data), assignees };
}

export async function updateContent(
  id: string,
  payload: UpdateContentPayload,
): Promise<ContentPiece> {
  const supabase = createClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.description !== undefined)
    updateData.description = payload.description;
  if (payload.video_urls !== undefined) {
    updateData.video_urls = payload.video_urls;
    updateData.video_url = payload.video_urls[0] ?? "";
  }
  if (payload.video_url !== undefined) updateData.video_url = payload.video_url;

  const { data, error } = await supabase
    .from("content_pieces")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return normalizeContent(data);
}

export async function deleteContent(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("content_pieces").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function fetchContentByToken(
  token: string,
): Promise<ContentPiece | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("client_token", token)
    .single();

  if (error || !data) return null;

  const { data: creatorProfile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", data.user_id)
    .single();

  const assignees = await fetchContentAssignees(data.id);

  return {
    ...normalizeContent(data),
    creator: creatorProfile ?? null,
    assignees,
  };
}

export async function clientUpdateContent(
  token: string,
  payload: ClientUpdatePayload,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("content_pieces")
    .update({
      status: payload.status,
      feedback: payload.feedback ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("client_token", token);

  if (error) throw new Error(error.message);
}

export async function regenerateClientLink(id: string): Promise<string> {
  const supabase = createClient();
  const newToken = crypto.randomUUID();
  const { data, error } = await supabase
    .from("content_pieces")
    .update({
      client_token: newToken,
    })
    .eq("id", id)
    .select("client_token")
    .single();

  if (error) throw new Error(error.message);
  return data.client_token;
}

export async function fetchMyNotifications() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
}

export async function fetchAllContent(): Promise<ContentPiece[]> {
  const supabase = createClient();

  const { data: contentData, error: contentError } = await supabase
    .from("content_pieces")
    .select("*")
    .order("created_at", { ascending: false });

  if (contentError) throw new Error(contentError.message);
  if (!contentData || contentData.length === 0) return [];

  const userIds = [...new Set(contentData.map((piece) => piece.user_id))];

  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("*")
    .in("user_id", userIds);

  if (profilesError) throw new Error(profilesError.message);

  const profileMap = new Map();
  profiles?.forEach((profile) => {
    profileMap.set(profile.user_id, profile);
  });

  const contentIds = contentData.map((piece) => piece.id);

  const { data: assigneesData, error: assigneesError } = await supabase
    .from("content_assignees")
    .select("*")
    .in("content_id", contentIds);

  if (assigneesError) throw new Error(assigneesError.message);

  const assigneeUserIds = [
    ...new Set(assigneesData?.map((a) => a.user_id) || []),
  ];

  const { data: assigneeProfiles, error: assigneeProfilesError } =
    await supabase
      .from("user_profiles")
      .select("*")
      .in("user_id", assigneeUserIds);

  if (assigneeProfilesError) throw new Error(assigneeProfilesError.message);

  const assigneeProfileMap = new Map();
  assigneeProfiles?.forEach((profile) => {
    assigneeProfileMap.set(profile.user_id, profile);
  });

  const enrichedAssignees =
    assigneesData?.map((assignee) => ({
      ...assignee,
      profile: assigneeProfileMap.get(assignee.user_id) || null,
    })) || [];

  const assigneesMap = new Map();
  enrichedAssignees.forEach((assignee) => {
    if (!assigneesMap.has(assignee.content_id)) {
      assigneesMap.set(assignee.content_id, []);
    }
    assigneesMap.get(assignee.content_id).push(assignee);
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return contentData.map((piece) => {
    const normalized = normalizeContent(piece);
    return {
      ...normalized,
      creator: profileMap.get(piece.user_id) || null,
      assignees: assigneesMap.get(piece.id) || [],
      isCurrentUserAssigned:
        assigneesMap
          .get(piece.id)
          ?.some((a: ContentAssignee) => a.user_id === user?.id) ?? false,
      isCurrentUserCreator: piece.user_id === user?.id,
    };
  }) as ContentPiece[];
}

export async function adminUpdateContent(
  id: string,
  payload: AdminApprovalPayload,
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: currentContent } = await supabase
    .from("content_pieces")
    .select("status")
    .eq("id", id)
    .single();

  if (currentContent?.status !== "pending") {
    throw new Error(`Content is already ${currentContent?.status}`);
  }

  const { error } = await supabase
    .from("content_pieces")
    .update({
      status: payload.status,
      feedback: payload.feedback ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await supabase
    .from("content_assignees")
    .update({
      has_responded: true,
      responded_at: new Date().toISOString(),
      response: payload.status,
    })
    .eq("content_id", id)
    .eq("user_id", user.id);

  const { data: content } = await supabase
    .from("content_pieces")
    .select("title, user_id")
    .eq("id", id)
    .single();

  if (content) {
    await supabase.from("notifications").insert({
      user_id: content.user_id,
      content_id: id,
      type: payload.status,
      message: `Your content "${content.title}" was ${payload.status}${payload.feedback ? " with feedback" : ""}`,
    });

    const { data: otherAssignees } = await supabase
      .from("content_assignees")
      .select("user_id")
      .eq("content_id", id)
      .neq("user_id", user.id);

    if (otherAssignees && otherAssignees.length > 0) {
      const notifications = otherAssignees.map((a) => ({
        user_id: a.user_id,
        content_id: id,
        type: payload.status,
        message: `"${content.title}" has been ${payload.status} by ${user.email}`,
      }));
      await supabase.from("notifications").insert(notifications);
    }
  }
}
