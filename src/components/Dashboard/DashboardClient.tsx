"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useContent } from "@/hooks/useContent";
import ContentCard from "./ContentCard";
import CreateContentModal from "./CreateContentModal";
import EditContentModal from "./EditContentModal";
import Filters from "./Filters";
import ApprovalModal from "@/components/Client/ApprovalModal";
import type {
  ContentPiece,
  ContentStatus,
  UserProfile,
  ViewMode,
} from "@/types";
import {
  Plus,
  LogOut,
  Zap,
  LayoutGrid,
  List,
  Loader2,
  Grid3x3,
} from "lucide-react";
import toast from "react-hot-toast";
import { fetchMyProfile } from "@/lib/api/content";

interface Props {
  user: User;
}

export default function DashboardClient({ user }: Props) {
  const { items, loading, create, update, remove } = useContent();
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">(
    "all",
  );
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<ContentPiece | null>(null);
  const [modalTarget, setModalTarget] = useState<ContentPiece | null>(null);
  const router = useRouter();

  const filtered =
    statusFilter === "all"
      ? items
      : items.filter((i) => i.status === statusFilter);

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  };

  useEffect(() => {
    fetchMyProfile().then(setUserProfile);
  }, []);

  const handleCreate = async (
    title: string,
    description: string,
    videoUrls: string[],
    assigneeIds: string[],
  ) => {
    try {
      await create({
        title,
        description,
        video_url: videoUrls[0] ?? "",
        video_urls: videoUrls,
        assignee_ids: assigneeIds,
      });
      toast.success("Content piece created!");
      setShowCreate(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    }
  };

  const handleUpdate = async (
    id: string,
    title: string,
    description: string,
    videoUrls: string[],
  ) => {
    try {
      await update(id, {
        title,
        description,
        video_urls: videoUrls,
        video_url: videoUrls[0],
      });
      toast.success("Updated!");
      setEditTarget(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content piece?")) return;
    try {
      await remove(id);
      toast.success("Deleted.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute top-[-15%] right-[20%] w-[500px] h-[500px] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-15%] left-[10%] w-[400px] h-[400px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
          }}
        />
      </div>

      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "rgba(10,10,15,0.8)",
          backdropFilter: "blur(16px)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)" }}
            >
              <Zap size={14} className="text-white" />
            </div>
            <span
              className="font-bold text-base tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Frameloop
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="hidden sm:block text-xs"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-3xl font-bold mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Content Library
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {items.length} total ·{" "}
              {items.filter((i) => i.status === "pending").length} pending
              review
            </p>
          </div>

          <div className="flex gap-3">
            <div
              className="flex rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--border)" }}
            >
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-all ${viewMode === "grid" ? "bg-accent text-white" : ""}`}
                style={{
                  background:
                    viewMode === "grid"
                      ? "var(--accent)"
                      : "var(--bg-elevated)",
                  color: viewMode === "grid" ? "white" : "var(--text-muted)",
                }}
              >
                <Grid3x3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-all ${viewMode === "list" ? "bg-accent text-white" : ""}`}
                style={{
                  background:
                    viewMode === "list"
                      ? "var(--accent)"
                      : "var(--bg-elevated)",
                  color: viewMode === "list" ? "white" : "var(--text-muted)",
                }}
              >
                <List size={16} />
              </button>
            </div>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: "var(--accent)", color: "white" }}
            >
              <Plus size={16} />
              New content
            </button>
          </div>
        </div>

        <Filters
          current={statusFilter}
          onChange={setStatusFilter}
          items={items}
        />

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2
              size={28}
              className="animate-spin"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
            >
              <LayoutGrid size={28} style={{ color: "var(--text-muted)" }} />
            </div>
            <div>
              <p className="font-semibold mb-1">No content pieces found</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {statusFilter === "all"
                  ? "Create your first piece to get started"
                  : `No ${statusFilter} content pieces`}
              </p>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {filtered.map((item, i) => (
              <div
                key={item.id}
                className="animate-slide-up"
                style={{
                  animationDelay: `${i * 50}ms`,
                  animationFillMode: "both",
                  opacity: 0,
                }}
              >
                <ContentCard
                  item={item}
                  viewMode="grid"
                  onEdit={() => setEditTarget(item)}
                  onDelete={() => handleDelete(item.id)}
                  onOpenModal={() => setModalTarget(item)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {filtered.map((item, i) => (
              <div
                key={item.id}
                className="animate-slide-up"
                style={{
                  animationDelay: `${i * 50}ms`,
                  animationFillMode: "both",
                  opacity: 0,
                }}
              >
                <ContentCard
                  item={item}
                  viewMode="list"
                  onEdit={() => setEditTarget(item)}
                  onDelete={() => handleDelete(item.id)}
                  onOpenModal={() => setModalTarget(item)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateContentModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {editTarget && (
        <EditContentModal
          item={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdate={handleUpdate}
        />
      )}

      {modalTarget && (
        <ApprovalModal
          isOpen={!!modalTarget}
          onClose={() => setModalTarget(null)}
          content={modalTarget}
          isClientView={false}
          isAdminView={true}
          onAdminAction={() => {
            setModalTarget(null);
          }}
        />
      )}
    </div>
  );
}
