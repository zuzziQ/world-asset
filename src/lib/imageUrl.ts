/**
 * Universal image resolver for World Asset Management.
 * Routes old MinIO images (storage.storymee.com) and expired links through our proxy
 * so that all images from Germany VPS cold archive and Ubuntu VPS load instantly without 404s.
 */

export const FALLBACK_IMAGES = {
  character: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
  location: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
  prop: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
};

export function resolveImageUrl(url?: string | null, entityType?: string): string {
  if (!url || typeof url !== "string" || !url.trim()) {
    if (entityType && FALLBACK_IMAGES[entityType as keyof typeof FALLBACK_IMAGES]) {
      return FALLBACK_IMAGES[entityType as keyof typeof FALLBACK_IMAGES];
    }
    return "";
  }

  const clean = url.trim();

  // If already proxied, return as-is
  if (clean.startsWith("/api/proxy-image")) {
    return clean;
  }

  // Old Germany VPS MinIO images or expired Google Flow links or dev-hub uploads
  if (
    clean.includes("storage.storymee.com") || 
    clean.includes("flow-content.google") ||
    clean.includes("/public/uploads/")
  ) {
    return `/api/proxy-image?url=${encodeURIComponent(clean)}`;
  }

  return clean;
}
