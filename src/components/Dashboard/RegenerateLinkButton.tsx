"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { regenerateClientLink } from "@/lib/api/content";
import toast from "react-hot-toast";

interface Props {
  contentId: string;
  onRegenerated: (newToken: string) => void;
}

export default function RegenerateLinkButton({
  contentId,
  onRegenerated,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleRegenerate = async () => {
    if (!confirm("Regenerate link? The current link will stop working."))
      return;
    setLoading(true);
    try {
      const newToken = await regenerateClientLink(contentId);
      onRegenerated(newToken);
      toast.success("Link regenerated!");
    } catch {
      toast.error("Failed to regenerate link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRegenerate}
      disabled={loading}
      title="Regenerate link"
      className="p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs"
      style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "#fbbf24";
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "rgba(251,191,36,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color =
          "var(--text-muted)";
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "var(--border)";
      }}
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <RefreshCw size={12} />
      )}
    </button>
  );
}
