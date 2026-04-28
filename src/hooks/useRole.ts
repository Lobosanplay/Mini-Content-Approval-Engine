"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchMyProfile, upsertProfile } from "@/lib/api/content";
import type { UserProfile, UserRole } from "@/types";
import type { User } from "@supabase/supabase-js";

export function useRole() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    await upsertProfile(user.id, user.email ?? "");

    const p = await fetchMyProfile();
    setProfile(p);
    setRole(p?.role ?? "creator");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    profile,
    role,
    loading,
    isAdmin: role === "admin",
    isCreator: role === "creator",
  };
}
