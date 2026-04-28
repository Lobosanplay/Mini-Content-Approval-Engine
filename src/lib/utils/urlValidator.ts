export function isValidVideoUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "youtu.be") return true;
    if (host === "vimeo.com") return true;
    if (u.pathname.match(/\.(mp4|webm|ogg|mov)$/i)) return true;

    if (u.protocol === "https:") return true;
    return false;
  } catch {
    return false;
  }
}

export function getVideoLabel(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "youtu.be") return "YouTube";
    if (host === "vimeo.com") return "Vimeo";
    if (u.pathname.match(/\.(mp4|webm|ogg|mov)$/i)) return "MP4";
    return host;
  } catch {
    return "Video";
  }
}
