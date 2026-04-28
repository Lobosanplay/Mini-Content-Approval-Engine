"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import ApprovalModal from "./ApprovalModal";
import type { ContentPiece } from "@/types";

interface Props {
  content: ContentPiece;
}

export default function ClientView({ content: initialContent }: Props) {
  const [content, setContent] = useState<ContentPiece>(initialContent);
  const [modalOpen, setModalOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setModalOpen(false);
    router.push("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.10) 0%, transparent 70%)",
          }}
        />
      </div>

      <div
        className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center px-6 border-b"
        style={{
          background: "rgba(10,10,15,0.8)",
          backdropFilter: "blur(16px)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)" }}
          >
            <Zap size={14} className="text-white" />
          </div>
          <span
            className="font-bold text-sm tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Frameloop
          </span>
        </div>
      </div>

      <ApprovalModal
        isOpen={modalOpen}
        onClose={handleClose}
        content={content}
        isClientView={true}
        onStatusChange={(status, feedback) => {
          setContent((prev) => ({
            ...prev,
            status,
            feedback: feedback ?? null,
          }));
        }}
      />

      <p
        className="fixed bottom-4 text-xs z-10"
        style={{ color: "var(--text-muted)" }}
      >
        Powered by{" "}
        <span style={{ fontFamily: "var(--font-display)" }}>Frameloop</span>
      </p>
    </div>
  );
}
