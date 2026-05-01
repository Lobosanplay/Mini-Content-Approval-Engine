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
import AnimatedBackground from "@/components/AnimatedBackground";
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
  List,
  Grid3x3,
  Film,
  ChevronDown,
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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

  /* Stats for header */
  const pendingCount = items.filter((i) => i.status === "pending").length;
  const approvedCount = items.filter((i) => i.status === "approved").length;
  const rejectedCount = items.filter((i) => i.status === "rejected").length;

  const userInitials = (userProfile?.full_name || user.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="min-h-screen page-enter"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Animated background */}
      <AnimatedBackground variant="dashboard" />

      {/* ── Header ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "rgba(7,7,13,0.82)",
          backdropFilter: "blur(20px) saturate(150%)",
          WebkitBackdropFilter: "blur(20px) saturate(150%)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#6366f1,#818cf8)",
                boxShadow: "0 0 16px rgba(99,102,241,0.4)",
              }}
            >
              <Zap size={15} className="text-white" />
            </div>
            <span
              className="font-bold text-base tracking-tight text-gradient"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Frameloop
            </span>

            {/* Breadcrumb divider */}
            <span
              style={{ color: "var(--border-hover)" }}
              className="hidden sm:block text-lg font-light ml-1"
            >
              /
            </span>
            <span
              className="hidden sm:block text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Content Library
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Quick stats pill */}
            <div
              className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    background: "var(--amber)",
                    boxShadow: "0 0 6px var(--amber)",
                  }}
                />
                <span
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {pendingCount} pending
                </span>
              </span>
              <span
                className="w-px h-3"
                style={{ background: "var(--border)" }}
              />
              <span className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--green)" }}
                />
                <span
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {approvedCount} approved
                </span>
              </span>
            </div>

            {/* User avatar + dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-colors"
                style={{
                  border: "1px solid var(--border)",
                  background: userMenuOpen
                    ? "var(--bg-elevated)"
                    : "transparent",
                }}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#818cf8)",
                    color: "white",
                    fontSize: "10px",
                  }}
                >
                  {userInitials}
                </div>
                <span
                  className="hidden sm:block text-xs"
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {user.email}
                </span>
                <ChevronDown
                  size={12}
                  style={{ color: "var(--text-muted)" }}
                  className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-44 rounded-xl overflow-hidden animate-scale-in"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  <div
                    className="px-3 py-2.5 border-b"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {userProfile?.full_name || "User"}
                    </p>
                    <p
                      className="text-xs mt-0.5 truncate"
                      style={{
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {userProfile?.role || "creator"}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors hover:bg-white/5 text-left"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <LogOut size={13} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div
            className="animate-slide-right"
            style={{ animationFillMode: "both" }}
          >
            <h1
              className="text-4xl font-bold mb-1.5 text-gradient"
              style={{ fontFamily: "var(--font-display)", lineHeight: 1.1 }}
            >
              Content Library
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--text-primary)" }}>
                {items.length}
              </span>{" "}
              total ·{" "}
              <span style={{ color: "var(--amber)" }}>{pendingCount}</span>{" "}
              pending ·{" "}
              <span style={{ color: "var(--green)" }}>{approvedCount}</span>{" "}
              approved
              {rejectedCount > 0 && (
                <>
                  {" "}
                  · <span style={{ color: "var(--red)" }}>
                    {rejectedCount}
                  </span>{" "}
                  rejected
                </>
              )}
            </p>
          </div>

          <div
            className="flex gap-2 animate-slide-up"
            style={{ animationFillMode: "both", animationDelay: "80ms" }}
          >
            {/* View toggle */}
            <div
              className="flex rounded-xl overflow-hidden p-0.5 gap-0.5"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
            >
              <button
                onClick={() => setViewMode("grid")}
                className="p-2 rounded-lg transition-all"
                style={{
                  background:
                    viewMode === "grid" ? "var(--accent)" : "transparent",
                  color: viewMode === "grid" ? "white" : "var(--text-muted)",
                  boxShadow:
                    viewMode === "grid"
                      ? "0 2px 8px rgba(99,102,241,0.3)"
                      : "none",
                }}
                title="Grid view"
              >
                <Grid3x3 size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className="p-2 rounded-lg transition-all"
                style={{
                  background:
                    viewMode === "list" ? "var(--accent)" : "transparent",
                  color: viewMode === "list" ? "white" : "var(--text-muted)",
                  boxShadow:
                    viewMode === "list"
                      ? "0 2px 8px rgba(99,102,241,0.3)"
                      : "none",
                }}
                title="List view"
              >
                <List size={15} />
              </button>
            </div>

            {/* New content */}
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            >
              <Plus size={16} />
              <span>New content</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div
          className="animate-slide-up"
          style={{ animationFillMode: "both", animationDelay: "120ms" }}
        >
          <Filters
            current={statusFilter}
            onChange={setStatusFilter}
            items={items}
          />
        </div>

        {/* Content area */}
        {loading ? (
          /* Skeleton loaders */
          <div
            className={`mt-6 ${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}`}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="skeleton rounded-2xl"
                style={{
                  height: viewMode === "grid" ? "200px" : "90px",
                  opacity: 1 - i * 0.12,
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5 text-center animate-fade-in">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
              }}
            >
              <Film size={32} style={{ color: "var(--text-muted)" }} />
            </div>
            <div>
              <p
                className="font-semibold text-lg mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                No content pieces found
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {statusFilter === "all"
                  ? "Create your first piece to get started"
                  : `No ${statusFilter} content pieces`}
              </p>
            </div>
            {statusFilter === "all" && (
              <button
                onClick={() => setShowCreate(true)}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white mt-2"
              >
                <Plus size={16} /> Create content
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
            {filtered.map((item, i) => (
              <div
                key={item.id}
                className="animate-slide-up"
                style={{
                  animationDelay: `${i * 45}ms`,
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
          <div className="space-y-3 mt-6">
            {filtered.map((item, i) => (
              <div
                key={item.id}
                className="animate-slide-up"
                style={{
                  animationDelay: `${i * 40}ms`,
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

      {/* Click-outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setUserMenuOpen(false)}
        />
      )}

      {/* Modals */}
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
          onAdminAction={() => setModalTarget(null)}
        />
      )}
    </div>
  );
}
