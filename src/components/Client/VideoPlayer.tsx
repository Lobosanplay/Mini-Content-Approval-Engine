"use client";

import { useState, useEffect } from "react";
import ReactPlayer from "react-player";

interface Props {
  url: string;
}

function transformUrl(url: string): string {
  if (url.includes("youtube.com/watch")) {
    const videoId = url.split("v=")[1]?.split("&")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  if (url.includes("youtube.com/shorts/")) {
    const videoId = url.split("/shorts/")[1]?.split("?")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  if (url.includes("vimeo.com/") && !url.includes("player.vimeo.com")) {
    const videoId = url.split("/").pop()?.split("?")[0];
    if (videoId) return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
}

export default function VideoPlayer({ url }: Props) {
  const [hasError, setHasError] = useState(false);
  const [transformedUrl, setTransformedUrl] = useState(url);

  useEffect(() => {
    setTransformedUrl(transformUrl(url));
  }, [url]);

  if (hasError) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Unable to load video.{" "}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent)" }}
          >
            Open directly
          </a>
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden bg-black"
      style={{ aspectRatio: "16/9" }}
    >
      <ReactPlayer
        url={transformedUrl}
        width="100%"
        height="100%"
        controls
        playing={false}
        onError={() => setHasError(true)}
        config={{
          youtube: {
            playerVars: {
              modestbranding: 1,
              rel: 0,
              origin: window.location.origin,
            },
          },
          vimeo: {
            playerOptions: {
              byline: false,
              portrait: false,
              title: false,
              transparent: false,
            },
          },
        }}
      />
    </div>
  );
}
