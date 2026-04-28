"use client";

import { useState } from "react";
import type { ContentPiece } from "@/types";
import { Loader2, X, Link2, Type, Plus, Trash2, FileText } from "lucide-react";
import { isValidVideoUrl } from "@/lib/utils/urlValidator";

interface Props {
  item: ContentPiece;
  onClose: () => void;
  onUpdate: (
    id: string,
    title: string,
    description: string,
    videoUrls: string[],
  ) => Promise<void>;
}

export default function EditContentModal({ item, onClose, onUpdate }: Props) {
  const initialUrls =
    item.video_urls?.length > 0 ? item.video_urls : [item.video_url];
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [videoUrls, setVideoUrls] = useState<string[]>(initialUrls);
  const [loading, setLoading] = useState(false);
  const [urlErrors, setUrlErrors] = useState<Record<number, string>>({});

  const updateUrl = (index: number, val: string) => {
    const next = [...videoUrls];
    next[index] = val;
    setVideoUrls(next);
    if (val && !isValidVideoUrl(val)) {
      setUrlErrors((prev) => ({ ...prev, [index]: "Invalid URL" }));
    } else {
      setUrlErrors((prev) => {
        const e = { ...prev };
        delete e[index];
        return e;
      });
    }
  };

  const addUrl = () => {
    if (videoUrls.length < 5) setVideoUrls([...videoUrls, ""]);
  };

  const removeUrl = (index: number) => {
    if (videoUrls.length === 1) return;
    setVideoUrls(videoUrls.filter((_, i) => i !== index));
  };

  const validUrls = videoUrls.filter(
    (u) => u.trim() && isValidVideoUrl(u.trim()),
  );
  const isDirty =
    title !== item.title ||
    description !== (item.description ?? "") ||
    JSON.stringify(validUrls) !== JSON.stringify(initialUrls);

  const canSubmit =
    title.trim() &&
    validUrls.length > 0 &&
    Object.keys(urlErrors).length === 0 &&
    isDirty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await onUpdate(item.id, title.trim(), description.trim(), validUrls);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl animate-scale-in flex flex-col"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          maxHeight: "90vh",
        }}
      >
        <div
          className="flex items-center justify-between px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Edit content piece
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {item.id.slice(0, 8)}…
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4">
          <form id="edit-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                TITLE
              </label>
              <div className="relative">
                <Type
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border)")
                  }
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                DESCRIPTION
              </label>
              <div className="relative">
                <FileText
                  size={14}
                  className="absolute left-3 top-3"
                  style={{ color: "var(--text-muted)" }}
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description…"
                  rows={2}
                  className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all resize-none"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border)")
                  }
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                VIDEO URLs{" "}
                <span style={{ color: "var(--text-muted)" }}>
                  ({videoUrls.length}/5)
                </span>
              </label>
              <div className="space-y-2">
                {videoUrls.map((url, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Link2
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2"
                          style={{
                            color: urlErrors[i]
                              ? "#f87171"
                              : "var(--text-muted)",
                          }}
                        />
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => updateUrl(i, e.target.value)}
                          placeholder={`URL ${i + 1}`}
                          className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all"
                          style={{
                            background: "var(--bg-elevated)",
                            border: `1px solid ${urlErrors[i] ? "rgba(248,113,113,0.4)" : "var(--border)"}`,
                            color: "var(--text-primary)",
                          }}
                          onFocus={(e) =>
                            (e.currentTarget.style.borderColor = urlErrors[i]
                              ? "rgba(248,113,113,0.6)"
                              : "var(--accent)")
                          }
                          onBlur={(e) =>
                            (e.currentTarget.style.borderColor = urlErrors[i]
                              ? "rgba(248,113,113,0.4)"
                              : "var(--border)")
                          }
                        />
                      </div>
                      {videoUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeUrl(i)}
                          className="p-2.5 rounded-xl transition-colors shrink-0"
                          style={{
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border)",
                            color: "var(--text-muted)",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color =
                              "#f87171";
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.borderColor = "rgba(248,113,113,0.3)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color =
                              "var(--text-muted)";
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.borderColor = "var(--border)";
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    {urlErrors[i] && (
                      <p className="text-xs pl-1" style={{ color: "#f87171" }}>
                        {urlErrors[i]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {videoUrls.length < 5 && (
                <button
                  type="button"
                  onClick={addUrl}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px dashed var(--border)",
                    color: "var(--text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--accent)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--accent-hover)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--border)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--text-muted)";
                  }}
                >
                  <Plus size={13} />
                  Add another URL
                </button>
              )}
            </div>
          </form>
        </div>

        <div
          className="flex gap-3 px-6 py-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
          >
            Cancel
          </button>
          <button
            form="edit-form"
            type="submit"
            disabled={loading || !canSubmit}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background:
                loading || !canSubmit
                  ? "rgba(99,102,241,0.4)"
                  : "var(--accent)",
              color: "white",
              cursor: loading || !canSubmit ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!loading && canSubmit)
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--accent-hover)";
            }}
            onMouseLeave={(e) => {
              if (!loading && canSubmit)
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--accent)";
            }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
