export function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export function hasReachedViewLimit(
  viewCount: number,
  maxViews: number,
): boolean {
  return viewCount >= maxViews;
}

export function getExpiryDescription(
  expiresAt: string | null,
  viewCount: number,
  maxViews: number,
): string | null {
  if (!expiresAt) return null;
  if (isExpired(expiresAt)) return "This link has expired";
  if (hasReachedViewLimit(viewCount, maxViews)) return "View limit reached";

  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (days > 1) return `Expires in ${days} days`;
  if (hours > 1) return `Expires in ${hours} hours`;
  return "Expires soon";
}

export function getRemainingViews(viewCount: number, maxViews: number): number {
  return Math.max(0, maxViews - viewCount);
}
