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

  const videoCount = currentItem.video_urls?.length || 1;

  const isCreator = userProfile?.user_id === currentItem.user_id;
  const isAdmin = userProfile?.role === "admin";
  const canEditDelete = isCreator || isAdmin;

  const isAssignedReviewer =
    currentItem.assignees?.some(
      (assignee) =>
        assignee.user_id === userProfile?.user_id && !assignee.has_responded,
    ) ?? false;

  const canApproveReject =
    isAdmin && isAssignedReviewer && currentItem.status === "pending";

  const copyLink = async () => {
    await navigator.clipboard.writeText(clientUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (viewMode === "list") {
    return (
      <div
        className="rounded-xl p-4 transition-all hover:translate-x-1"
        style={{
          background: "var(--bg-card)",
          border: `1px solid var(--border)`,
        }}
      >
        <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap">
          <div
            className="w-20 h-20 rounded-lg flex items-center justify-center cursor-pointer shrink-0"
            style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
            onClick={onOpenModal}
          >
            <Film size={24} style={{ color: "var(--accent-hover)" }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h3
                className="font-semibold text-base cursor-pointer hover:underline decoration-dotted"
                style={{ fontFamily: "var(--font-display)" }}
                onClick={onOpenModal}
              >
                {currentItem.title}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${statusBg(currentItem.status)}`}
                >
                  {statusLabel(currentItem.status)}
                </span>
                {currentItem.assignees && currentItem.assignees.length > 0 && (
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <Users size={11} />
                    {currentItem.assignees.length}
                  </span>
                )}
              </div>
            </div>

            <div
              className="flex items-center gap-4 mt-2 text-xs flex-wrap"
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
                className="mt-2 rounded-lg p-2 flex gap-2"
                style={{
                  background: "rgba(244,63,94,0.06)",
                  border: "1px solid rgba(244,63,94,0.15)",
                }}
              >
                <MessageSquare
                  size={12}
                  className="shrink-0 mt-0.5 text-rose-400"
                />
                <p className="text-xs text-rose-300 line-clamp-1">
                  {currentItem.feedback}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canApproveReject && (
              <>
                <button
                  onClick={onApprove}
                  className="p-2 rounded-lg transition-all"
                  style={{
                    background: "rgba(52,211,153,0.1)",
                    border: "1px solid rgba(52,211,153,0.2)",
                    color: "#34d399",
                  }}
                  title="Approve"
                >
                  <CheckCircle2 size={14} />
                </button>
                <button
                  onClick={onReject}
                  className="p-2 rounded-lg transition-all"
                  style={{
                    background: "rgba(248,113,113,0.1)",
                    border: "1px solid rgba(248,113,113,0.2)",
                    color: "#f87171",
                  }}
                  title="Reject"
                >
                  <XCircle size={14} />
                </button>
              </>
            )}

            <button
              onClick={copyLink}
              className="p-2 rounded-lg transition-colors"
              style={{ border: "1px solid var(--border)" }}
              title="Copy link"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>

            <RegenerateLinkButton
              contentId={currentItem.id}
              onRegenerated={(newToken) =>
                setCurrentItem((prev) => ({
                  ...prev,
                  client_token: newToken,
                }))
              }
            />

            {canEditDelete && (
              <>
                <button
                  onClick={onEdit}
                  className="p-2 rounded-lg transition-colors"
                  style={{ border: "1px solid var(--border)" }}
                  title="Edit"
                >
                  <Pencil size={13} />
                </button>

                <button
                  onClick={onDelete}
                  className="p-2 rounded-lg transition-colors"
                  style={{ border: "1px solid var(--border)" }}
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-all"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className="font-semibold text-base leading-snug line-clamp-2 flex-1 cursor-pointer hover:underline decoration-dotted"
          style={{ fontFamily: "var(--font-display)" }}
          onClick={onOpenModal}
        >
          {currentItem.title}
        </h3>
        <span
          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${statusBg(currentItem.status)}`}
        >
          {statusLabel(currentItem.status)}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onOpenModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
          style={{
            background: "rgba(99,102,241,0.1)",
            color: "var(--accent-hover)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <Film size={11} />
          {videoCount} video{videoCount !== 1 ? "s" : ""}
        </button>
        {currentItem.assignees && currentItem.assignees.length > 0 && (
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            <Users size={11} />
            {currentItem.assignees.length} reviewer
            {currentItem.assignees.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {currentItem.feedback && currentItem.status === "rejected" && (
        <div
          className="rounded-xl p-3 flex gap-2"
          style={{
            background: "rgba(244,63,94,0.06)",
            border: "1px solid rgba(244,63,94,0.15)",
          }}
        >
          <MessageSquare size={13} className="shrink-0 mt-0.5 text-rose-400" />
          <p className="text-xs leading-relaxed text-rose-300">
            {currentItem.feedback}
          </p>
        </div>
      )}

      <p
        className="text-xs"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
      >
        Created {formatDate(currentItem.created_at)}
      </p>

      <div
        className="flex items-center gap-2 pt-1 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors flex-1 justify-center"
          style={{
            background: "var(--bg-elevated)",
            color: copied ? "#34d399" : "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy link"}
        </button>

        <RegenerateLinkButton
          contentId={currentItem.id}
          onRegenerated={(newToken) =>
            setCurrentItem((prev) => ({
              ...prev,
              client_token: newToken,
            }))
          }
        />

        {canEditDelete && (
          <>
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
              title="Edit"
            >
              <Pencil size={13} />
            </button>

            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
