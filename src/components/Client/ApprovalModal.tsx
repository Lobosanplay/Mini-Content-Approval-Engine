"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  X,
  User,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  MessageSquare,
  Film,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import type { ContentPiece, UserProfile } from "@/types";
import { statusBg, statusLabel, formatDate } from "@/lib/utils";
import {
  clientUpdateContent,
  adminUpdateContent,
  fetchMyProfile,
} from "@/lib/api/content";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const VideoPlayer = dynamic(() => import("./VideoPlayer"), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-xl overflow-hidden w-full bg-black flex items-center justify-center"
      style={{ aspectRatio: "16/9" }}
    >
      <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
    </div>
  ),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  content: ContentPiece;
  isClientView?: boolean;
  onStatusChange?: (status: "approved" | "rejected", feedback?: string) => void;
  isAdminView?: boolean;
  onAdminAction?: () => void;
}

type Step = "idle" | "rejecting" | "submitting" | "done";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  return formatDate(iso);
}

export default function ApprovalModal({
  isOpen,
  onClose,
  content,
  isClientView = false,
  onStatusChange,
  isAdminView = false,
  onAdminAction,
}: Props) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [step, setStep] = useState<Step>(
    content.status !== "pending" ? "done" : "idle",
  );
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentContent, setCurrentContent] = useState(content);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  const videoUrls =
    currentContent.video_urls?.length > 0
      ? currentContent.video_urls
      : [currentContent.video_url].filter(Boolean);

  const isAssignedReviewer =
    currentContent.assignees?.some((a) => a.user_id === userProfile?.user_id) ??
    false;

  const hasResponded =
    currentContent.assignees?.some(
      (a) => a.user_id === userProfile?.user_id && a.has_responded,
    ) ?? false;

  useEffect(() => {
    fetchMyProfile().then(setUserProfile);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft")
        setCurrentVideoIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight")
        setCurrentVideoIndex((i) => Math.min(videoUrls.length - 1, i + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, videoUrls.length]);

  const handleClose = () => {
    onClose();
    if (!isClientView) {
      router.refresh();
    }
  };

  const handleApprove = useCallback(async () => {
    setLoading(true);
    try {
      if (isAdminView) {
        await adminUpdateContent(currentContent.id, { status: "approved" });
        onAdminAction?.();
      } else {
        await clientUpdateContent(currentContent.client_token, {
          status: "approved",
        });
      }
      setCurrentContent((prev) => ({ ...prev, status: "approved" }));
      setStep("done");
      toast.success("Approved! 🎉");
      onStatusChange?.("approved");

      if (isClientView) {
        setTimeout(() => handleClose(), 2000);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [
    currentContent.id,
    currentContent.client_token,
    onStatusChange,
    isClientView,
    isAdminView,
    onAdminAction,
  ]);

  const handleRejectSubmit = useCallback(async () => {
    if (!feedback.trim()) return;
    setLoading(true);
    try {
      if (isAdminView) {
        await adminUpdateContent(currentContent.id, {
          status: "rejected",
          feedback: feedback.trim(),
        });
        onAdminAction?.();
      } else {
        await clientUpdateContent(currentContent.client_token, {
          status: "rejected",
          feedback: feedback.trim(),
        });
      }
      setCurrentContent((prev) => ({
        ...prev,
        status: "rejected",
        feedback: feedback.trim(),
      }));
      setStep("done");
      toast.success("Feedback sent.");
      onStatusChange?.("rejected", feedback.trim());

      if (isClientView) {
        setTimeout(() => handleClose(), 2000);
      }
    } catch {
      toast.error("Something went wrong");
      setStep("rejecting");
    } finally {
      setLoading(false);
    }
  }, [
    currentContent.id,
    currentContent.client_token,
    feedback,
    onStatusChange,
    isClientView,
    isAdminView,
    onAdminAction,
  ]);

  if (!isOpen) return null;

  const showActions = isClientView
    ? currentContent.status === "pending"
    : isAdminView &&
      currentContent.status === "pending" &&
      isAssignedReviewer &&
      !hasResponded;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="w-full max-w-6xl rounded-2xl flex flex-col lg:flex-row animate-scale-in"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        <div
          className="lg:w-2/3 flex flex-col"
          style={{ background: "#000", borderRight: "1px solid var(--border)" }}
        >
          <div
            className="lg:hidden flex items-center justify-between p-4 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#818cf8)",
                }}
              >
                <Zap size={12} className="text-white" />
              </div>
              <span
                className="font-bold text-sm"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Frameloop
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
              {videoUrls.length > 1 && (
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Film size={13} style={{ color: "var(--text-muted)" }} />
                    <span
                      className="text-xs"
                      style={{
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Video {currentVideoIndex + 1} of {videoUrls.length}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {videoUrls.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentVideoIndex(i)}
                        className="rounded-full transition-all"
                        style={{
                          width: i === currentVideoIndex ? "20px" : "8px",
                          height: "8px",
                          background:
                            i === currentVideoIndex
                              ? "var(--accent)"
                              : "var(--border)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div
                className="relative rounded-xl overflow-hidden"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
              >
                <VideoPlayer url={videoUrls[currentVideoIndex]} />

                {videoUrls.length > 1 && (
                  <>
                    {currentVideoIndex > 0 && (
                      <button
                        onClick={() => setCurrentVideoIndex((i) => i - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
                        style={{
                          background: "rgba(0,0,0,0.7)",
                          color: "white",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <ChevronLeft size={20} />
                      </button>
                    )}
                    {currentVideoIndex < videoUrls.length - 1 && (
                      <button
                        onClick={() => setCurrentVideoIndex((i) => i + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
                        style={{
                          background: "rgba(0,0,0,0.7)",
                          color: "white",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <ChevronRight size={20} />
                      </button>
                    )}
                  </>
                )}
              </div>

              {videoUrls.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {videoUrls.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentVideoIndex(i)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={{
                        background:
                          i === currentVideoIndex
                            ? "rgba(99,102,241,0.2)"
                            : "var(--bg-elevated)",
                        border: `1px solid ${i === currentVideoIndex ? "rgba(99,102,241,0.4)" : "var(--border)"}`,
                        color:
                          i === currentVideoIndex
                            ? "var(--accent-hover)"
                            : "var(--text-muted)",
                      }}
                    >
                      <Film size={10} />
                      Video {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:w-1/3 flex flex-col overflow-y-auto">
          <div
            className="hidden lg:flex items-center justify-between p-5 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#818cf8)",
                }}
              >
                <Zap size={14} className="text-white" />
              </div>
              <span
                className="font-bold text-sm"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Frameloop
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 p-5 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${statusBg(currentContent.status)}`}
                >
                  {statusLabel(currentContent.status)}
                </span>
                {isClientView && currentContent.status === "pending" && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(251,191,36,0.15)",
                      color: "#fbbf24",
                    }}
                  >
                    Awaiting your review
                  </span>
                )}
                {isAdminView &&
                  currentContent.status === "pending" &&
                  isAssignedReviewer &&
                  !hasResponded && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(99,102,241,0.15)",
                        color: "var(--accent-hover)",
                      }}
                    >
                      Pending your review
                    </span>
                  )}
              </div>
              <h2
                className="text-xl font-bold mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {currentContent.title}
              </h2>
              {currentContent.description && (
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {currentContent.description}
                </p>
              )}
            </div>

            {currentContent.creator && (
              <div
                className="rounded-xl p-4"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <User size={13} style={{ color: "var(--text-muted)" }} />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    CREATOR
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                    style={{
                      background: "rgba(99,102,241,0.2)",
                      color: "var(--accent-hover)",
                    }}
                  >
                    {(currentContent.creator.full_name ?? "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {currentContent.creator.full_name ?? "Unknown"}
                    </p>
                    {currentContent.creator.email && (
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {currentContent.creator.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div
                className="flex items-center gap-4 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{formatDate(currentContent.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{timeAgo(currentContent.created_at)}</span>
                </div>
              </div>

              {currentContent.assignees &&
                currentContent.assignees.length > 0 && (
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Users size={13} style={{ color: "var(--text-muted)" }} />
                      <span
                        className="text-xs font-medium"
                        style={{ color: "var(--text-muted)" }}
                      >
                        REVIEWERS
                      </span>
                    </div>
                    <div className="space-y-2">
                      {currentContent.assignees.map((assignee) => (
                        <div
                          key={assignee.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{
                                background: "rgba(99,102,241,0.15)",
                                color: "var(--accent-hover)",
                              }}
                            >
                              {(assignee.profile?.full_name ?? "A")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <span className="text-sm">
                              {assignee.profile?.full_name ?? "Admin"}
                            </span>
                          </div>
                          {assignee.has_responded && (
                            <CheckCircle2
                              size={14}
                              className="text-emerald-400"
                            />
                          )}
                          {isAdminView &&
                            assignee.user_id === userProfile?.user_id &&
                            !assignee.has_responded &&
                            currentContent.status === "pending" && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  background: "rgba(99,102,241,0.15)",
                                  color: "var(--accent-hover)",
                                }}
                              >
                                You
                              </span>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {currentContent.feedback &&
              currentContent.status === "rejected" && (
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(248,113,113,0.08)",
                    border: "1px solid rgba(248,113,113,0.2)",
                  }}
                >
                  <div className="flex gap-3">
                    <MessageSquare
                      size={14}
                      className="shrink-0 mt-0.5 text-rose-400"
                    />
                    <div>
                      <p className="text-xs font-medium mb-1 text-rose-400">
                        FEEDBACK
                      </p>
                      <p className="text-sm text-rose-300">
                        {currentContent.feedback}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {showActions && (
              <div className="pt-2">
                {step === "idle" && (
                  <div className="space-y-3">
                    <button
                      onClick={handleApprove}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                      style={{
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "white",
                      }}
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => setStep("rejecting")}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                      style={{
                        background: "rgba(248,113,113,0.15)",
                        color: "#f87171",
                        border: "1px solid rgba(248,113,113,0.3)",
                      }}
                    >
                      <XCircle size={16} />
                      Request Changes
                    </button>
                  </div>
                )}

                {step === "rejecting" && (
                  <div className="space-y-3">
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="What needs to change?"
                      rows={4}
                      autoFocus
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setStep("idle");
                          setFeedback("");
                        }}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRejectSubmit}
                        disabled={!feedback.trim() || loading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                        style={{
                          background: !feedback.trim()
                            ? "rgba(248,113,113,0.3)"
                            : "#f87171",
                          color: "white",
                        }}
                      >
                        {loading ? (
                          <Loader2 size={14} className="animate-spin mx-auto" />
                        ) : (
                          "Send Feedback"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {step === "done" && (
                  <div className="text-center py-6">
                    <div
                      className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          currentContent.status === "approved"
                            ? "rgba(52,211,153,0.15)"
                            : "rgba(248,113,113,0.15)",
                      }}
                    >
                      {currentContent.status === "approved" ? (
                        <CheckCircle2 size={24} className="text-emerald-400" />
                      ) : (
                        <XCircle size={24} className="text-rose-400" />
                      )}
                    </div>
                    <p className="font-semibold">
                      {currentContent.status === "approved"
                        ? "Content Approved!"
                        : "Feedback Submitted"}
                    </p>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {currentContent.status === "approved"
                        ? "Thank you for your review."
                        : "Your feedback has been sent to the creator."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {isAdminView &&
              isAssignedReviewer &&
              hasResponded &&
              currentContent.status === "pending" && (
                <div className="text-center py-6">
                  <div
                    className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(251,191,36,0.15)" }}
                  >
                    <CheckCircle2 size={24} className="text-emerald-400" />
                  </div>
                  <p className="font-semibold">Already Reviewed</p>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    You have already submitted your review for this content.
                  </p>
                </div>
              )}

            {isAdminView &&
              !isAssignedReviewer &&
              currentContent.status === "pending" && (
                <div className="text-center py-6">
                  <div
                    className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(99,102,241,0.1)" }}
                  >
                    <Users size={24} className="text-accent" />
                  </div>
                  <p className="font-semibold">Not Assigned as Reviewer</p>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    You are not assigned to review this content. Only assigned
                    reviewers can approve or reject.
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
