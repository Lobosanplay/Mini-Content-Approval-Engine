"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchUserContent,
  fetchAssignedContent,
  createContent,
  updateContent,
  deleteContent,
  adminUpdateContent,
  fetchAllContent,
} from "@/lib/api/content";
import type {
  ContentPiece,
  ContentStatus,
  CreateContentPayload,
  UpdateContentPayload,
  AdminApprovalPayload,
} from "@/types";

export function useContent(mode: "creator" | "admin" | "all" = "all") {
  const [items, setItems] = useState<ContentPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<
    ReturnType<typeof createClient>["channel"]
  > | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      if (mode === "all") {
        data = await fetchAllContent();
      } else if (mode === "admin") {
        data = await fetchAssignedContent();
      } else {
        data = await fetchUserContent();
      }
      setItems(data);
      setLoading(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    load();
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;

      const filter =
        mode === "admin"
          ? `assigned_to=eq.${data.user.id}`
          : `user_id=eq.${data.user.id}`;

      const channel = supabase
        .channel(`content_changes_${mode}_${Date.now()}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "content_pieces", filter },
          () => {
            load();
          },
        )
        .subscribe();

      channelRef.current = channel;
    });

    return () => {
      if (channelRef.current) {
        createClient().removeChannel(channelRef.current);
      }
    };
  }, [load, mode]);

  const create = useCallback(async (payload: CreateContentPayload) => {
    const newItem = await createContent(payload);
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  const update = useCallback(
    async (id: string, payload: UpdateContentPayload) => {
      const updated = await updateContent(id, payload);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updated } : i)),
      );
      return updated;
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await deleteContent(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const adminApprove = useCallback(
    async (id: string, payload: AdminApprovalPayload) => {
      await adminUpdateContent(id, payload);
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: payload.status,
                feedback: payload.feedback ?? null,
              }
            : i,
        ),
      );
    },
    [],
  );

  const filterByStatus = useCallback(
    (status: ContentStatus | "all") => {
      if (status === "all") return items;
      return items.filter((i) => i.status === status);
    },
    [items],
  );

  return {
    items,
    loading,
    error,
    create,
    update,
    remove,
    adminApprove,
    filterByStatus,
    reload: load,
  };
}
