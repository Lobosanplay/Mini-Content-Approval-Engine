"use client";

import { useState, useEffect } from "react";
import type { ContentPiece, UserProfile } from "@/types";
import { statusBg, statusLabel, getClientUrl, formatDate } from "@/lib/utils";
import {
  Copy,
  Pencil,
  Trash2,
  MessageSquare,
  Check,
  Film,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import RegenerateLinkButton from "./RegenerateLinkButton";
import { fetchMyProfile } from "@/lib/api/content";

interface Props {
  item: ContentPiece;
  viewMode: "grid" | "list";
  onEdit: () => void;
  onDelete: () => void;
  onOpenModal: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

/** Maps status to the new badge utility classes */
function badgeClass(status: ContentPiece["status"]) {
  switch (status) {
    case "approved":
      return "badge-approved";
    case "rejected":
      return "badge-rejected";
    default:
      return "badge-pending";
  }
}

export default function ContentCard({
  item,
  viewMode,
  onEdit,
  onDelete,
  onOpenModal,
  onApprove,
  onReject,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [currentItem, setCurrentItem] = useState(item);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const clientUrl = getClientUrl(currentItem.client_token);

  useEffect(() => {
    fetchMyProfile().then(setUserProfile);
  }, []);
  // Keep in sync when parent refreshes
  useEffect(() => {
    setCurrentItem(item);
  }, [item]);

  const videoCount = currentItem.video_urls?.length || 1;
  const isCreator = userProfile?.user_id === currentItem.user_id;
  const isAdmin = userProfile?.role === "admin";
  const canEditDelete = isCreator || isAdmin;
  const isAssignedReviewer =
    currentItem.assignees?.some(
      (a) => a.user_id === userProfile?.user_id && !a.has_responded,
    ) ?? false;
  const canApproveReject =
    isAdmin && isAssignedReviewer && currentItem.status === "pending";

  const copyLink = async () => {
    await navigator.clipboard.writeText(clientUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── LIST ─────────────────────────────────────────────── */
  if (viewMode === "list") {
    return (
      <div
        className="card-hover rounded-xl p-4 transition-all"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap">
          {/* Thumbnail */}
          <button
            onClick={onOpenModal}
            className="w-20 h-16 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-105"
            style={{
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.18)",
            }}
          >
            <Film size={22} style={{ color: "var(--accent-hover)" }} />
          </button>

          {/* Meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h3
                className="font-semibold text-base cursor-pointer hover:text-white transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
                onClick={onOpenModal}
              >
                {currentItem.title}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass(currentItem.status)}`}
                >
                  {statusLabel(currentItem.status)}
                </span>
                {currentItem.assignees && currentItem.assignees.length > 0 && (
                  <span
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Users size={10} />
                    {currentItem.assignees.length}
                  </span>
                )}
              </div>
            </div>

            <div
              className="flex items-center gap-4 mt-1.5 text-xs"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              <span>
                {videoCount} video{videoCount !== 1 ? "s" : ""}
              </span>
              <span>Created {formatDate(currentItem.created_at)}</span>
            </div>

            {currentItem.feedback && currentItem.status === "rejected" && (
              <div
                className="mt-2 rounded-lg p-2.5 flex gap-2"
                style={{
                  background: "rgba(248,113,113,0.06)",
                  border: "1px solid rgba(248,113,113,0.15)",
                }}
              >
                <MessageSquare
                  size={12}
                  className="shrink-0 mt-0.5"
                  style={{ color: "var(--red)" }}
                />
                <p
                  className="text-xs line-clamp-1"
                  style={{ color: "#fca5a5" }}
                >
                  {currentItem.feedback}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {canApproveReject && (
              <>
                <ActionBtn onClick={onApprove} title="Approve" color="green">
                  <CheckCircle2 size={13} />
                </ActionBtn>
                <ActionBtn onClick={onReject} title="Reject" color="red">
                  <XCircle size={13} />
                </ActionBtn>
              </>
            )}
            <ActionBtn onClick={copyLink} title="Copy link">
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </ActionBtn>
            <RegenerateLinkButton
              contentId={currentItem.id}
              onRegenerated={(t) =>
                setCurrentItem((p) => ({ ...p, client_token: t }))
              }
            />
            {canEditDelete && (
              <>
                <ActionBtn onClick={onEdit} title="Edit">
                  <Pencil size={13} />
                </ActionBtn>
                <ActionBtn onClick={onDelete} title="Delete">
                  <Trash2 size={13} />
                </ActionBtn>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── GRID ─────────────────────────────────────────────── */
  return (
    <div
      className="card-hover group rounded-2xl flex flex-col gap-0 overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Card top – clickable thumbnail area */}
      <button
        onClick={onOpenModal}
        className="relative w-full h-32 flex items-center justify-center transition-all"
        style={{
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 100%)",
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
          style={{
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.22)",
          }}
        >
          <Film size={26} style={{ color: "var(--accent-hover)" }} />
        </div>
        {/* Status badge overlay */}
        <span
          className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass(currentItem.status)}`}
        >
          {statusLabel(currentItem.status)}
        </span>
      </button>

      {/* Card body */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        {/* Title */}
        <h3
          className="font-semibold text-base leading-snug line-clamp-2 cursor-pointer hover:text-white transition-colors"
          style={{ fontFamily: "var(--font-display)" }}
          onClick={onOpenModal}
        >
          {currentItem.title}
        </h3>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{
              background: "rgba(99,102,241,0.1)",
              color: "var(--accent-hover)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <Film size={10} />
            {videoCount} video{videoCount !== 1 ? "s" : ""}
          </span>
          {currentItem.assignees && currentItem.assignees.length > 0 && (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
              style={{
                background: "var(--bg-elevated)",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              <Users size={10} />
              {currentItem.assignees.length} reviewer
              {currentItem.assignees.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Feedback */}
        {currentItem.feedback && currentItem.status === "rejected" && (
          <div
            className="rounded-xl p-3 flex gap-2"
            style={{
              background: "rgba(248,113,113,0.06)",
              border: "1px solid rgba(248,113,113,0.15)",
            }}
          >
            <MessageSquare
              size={12}
              className="shrink-0 mt-0.5"
              style={{ color: "var(--red)" }}
            />
            <p className="text-xs leading-relaxed" style={{ color: "#fca5a5" }}>
              {currentItem.feedback}
            </p>
          </div>
        )}

        {/* Date */}
        <p
          className="text-xs mt-auto"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
        >
          {formatDate(currentItem.created_at)}
        </p>

        {/* Action bar */}
        <div
          className="flex items-center gap-1.5 pt-3 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs flex-1 justify-center transition-all hover:scale-105"
            style={{
              background: copied
                ? "rgba(52,211,153,0.12)"
                : "var(--bg-elevated)",
              color: copied ? "var(--green)" : "var(--text-secondary)",
              border: `1px solid ${copied ? "rgba(52,211,153,0.25)" : "var(--border)"}`,
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy link"}
          </button>

          <RegenerateLinkButton
            contentId={currentItem.id}
            onRegenerated={(t) =>
              setCurrentItem((p) => ({ ...p, client_token: t }))
            }
          />

          {canEditDelete && (
            <>
              <ActionBtn onClick={onEdit} title="Edit">
                <Pencil size={13} />
              </ActionBtn>
              <ActionBtn onClick={onDelete} title="Delete">
                <Trash2 size={13} />
              </ActionBtn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Shared icon button ──────────────────────────────────── */
function ActionBtn({
  onClick,
  title,
  children,
  color,
}: {
  onClick?: () => void;
  title?: string;
  children: React.ReactNode;
  color?: "green" | "red";
}) {
  const colorMap = {
    green: {
      bg: "rgba(52,211,153,0.1)",
      border: "rgba(52,211,153,0.2)",
      text: "#34d399",
    },
    red: {
      bg: "rgba(248,113,113,0.1)",
      border: "rgba(248,113,113,0.2)",
      text: "#f87171",
    },
  };
  const c = color ? colorMap[color] : null;

  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 rounded-lg transition-all hover:scale-110"
      style={{
        background: c ? c.bg : "var(--bg-elevated)",
        border: `1px solid ${c ? c.border : "var(--border)"}`,
        color: c ? c.text : "var(--text-muted)",
      }}
    >
      {children}
    </button>
  );
}
