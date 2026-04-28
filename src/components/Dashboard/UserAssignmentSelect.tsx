"use client";

import { useEffect, useState } from "react";
import { fetchAllUsers } from "@/lib/api/content";
import type { UserProfile } from "@/types";
import { Shuffle, UserCheck, X, Loader2, Users, Info } from "lucide-react";

interface Props {
  value: string[];
  onChange: (userIds: string[]) => void;
}

export default function UserAssignmentSelect({ value, onChange }: Props) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (uid: string) => {
    if (value.includes(uid)) {
      onChange(value.filter((id) => id !== uid));
    } else {
      onChange([...value, uid]);
    }
  };

  const pickRandom = () => {
    if (users.length === 0) return;
    const unselected = users.filter((a) => !value.includes(a.user_id));
    if (unselected.length === 0) return;
    const pick = unselected[Math.floor(Math.random() * unselected.length)];
    onChange([...value, pick.user_id]);
  };

  const clearAll = () => onChange([]);

  const selectedUsers = users.filter((a) => value.includes(a.user_id));
  const unselectedUsers = users.filter((a) => !value.includes(a.user_id));

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label
          className="text-xs font-medium"
          style={{
            color: "var(--text-secondary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          ASSIGN TO REVIEWERS
        </label>
        {value.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            <X size={10} />
            Clear
          </button>
        )}
      </div>

      <div
        className="flex items-start gap-2 rounded-xl px-3 py-2 mb-3"
        style={{
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.15)",
        }}
      >
        <Info
          size={12}
          className="mt-0.5 shrink-0"
          style={{ color: "var(--accent)" }}
        />
        <p
          className="text-xs leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Select reviewers for this content. They will be able to approve or
          reject it.
        </p>
      </div>

      {loading ? (
        <div
          className="flex items-center gap-2 py-3 px-4 rounded-xl text-sm"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          <Loader2 size={13} className="animate-spin" />
          Loading users…
        </div>
      ) : users.length === 0 ? (
        <div
          className="py-3 px-4 rounded-xl text-sm"
          style={{
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.2)",
            color: "#fbbf24",
          }}
        >
          No users found.
        </div>
      ) : (
        <>
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedUsers.map((user) => (
                <button
                  key={user.user_id}
                  type="button"
                  onClick={() => toggle(user.user_id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: "rgba(99,102,241,0.15)",
                    color: "var(--accent-hover)",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(99,102,241,0.25)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(99,102,241,0.15)")
                  }
                >
                  <UserCheck size={11} />
                  {user.full_name ?? user.email?.split("@")[0] ?? "User"}
                  <X size={10} />
                </button>
              ))}
            </div>
          )}

          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            {users.map((user, i) => {
              const selected = value.includes(user.user_id);
              return (
                <button
                  key={user.user_id}
                  type="button"
                  onClick={() => toggle(user.user_id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                  style={{
                    background: selected
                      ? "rgba(99,102,241,0.10)"
                      : i % 2 === 0
                        ? "var(--bg-elevated)"
                        : "transparent",
                    borderTop: i > 0 ? "1px solid var(--border)" : "none",
                    color: selected
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    if (!selected)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "rgba(255,255,255,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (!selected)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        i % 2 === 0 ? "var(--bg-elevated)" : "transparent";
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: selected
                        ? "rgba(99,102,241,0.3)"
                        : "rgba(255,255,255,0.05)",
                      color: selected
                        ? "var(--accent-hover)"
                        : "var(--text-muted)",
                    }}
                  >
                    {(user.full_name ?? "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {user.full_name ?? user.email?.split("@")[0] ?? "User"}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {user.role}
                    </p>
                  </div>
                  {selected && (
                    <UserCheck
                      size={13}
                      style={{ color: "var(--accent)", flexShrink: 0 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={pickRandom}
            disabled={unselectedUsers.length === 0}
            className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color:
                unselectedUsers.length === 0
                  ? "var(--text-muted)"
                  : "var(--text-secondary)",
              cursor: unselectedUsers.length === 0 ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (unselectedUsers.length > 0)
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "var(--accent)";
            }}
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.borderColor =
                "var(--border)")
            }
          >
            <Shuffle size={12} />
            Add random reviewer
          </button>

          <div className="flex items-center gap-2 mt-2">
            <Users
              size={12}
              style={{
                color: value.length >= 1 ? "#34d399" : "var(--text-muted)",
              }}
            />
            <span
              className="text-xs"
              style={{
                color: value.length >= 1 ? "#34d399" : "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {value.length} reviewer{value.length !== 1 ? "s" : ""} selected
            </span>
          </div>
        </>
      )}
    </div>
  );
}
