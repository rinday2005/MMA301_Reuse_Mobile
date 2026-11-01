import { getServerHost } from '../services/api';

const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80';

/**
 * Normalizes image URLs for React Native Mobile App.
 * Handles Cloudinary URLs, web URLs, relative paths, and backend static image paths.
 */
export function normalizeImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return DEFAULT_FALLBACK_IMAGE;
  const trimmed = url.trim();
  if (!trimmed) return DEFAULT_FALLBACK_IMAGE;

  // If already a full web URL (http:// or https://) or base64 data URL
  if (/^(https?:\/\/|data:image\/|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  // Get server root host dynamically (matches current working emulator or physical phone host)
  const serverHost = getServerHost();

  // If path contains src/assets/images/ (e.g. ./src/assets/images/foo.jpg or /src/assets/images/foo.jpg)
  if (trimmed.includes('src/assets/images/')) {
    const filename = trimmed.split('src/assets/images/').pop() || '';
    return `${serverHost}/images/${filename.replace(/^\/+/, '')}`;
  }

  // If path starts with ./ or ../
  if (trimmed.startsWith('./')) {
    return `${serverHost}/${trimmed.slice(2)}`;
  }
  if (trimmed.startsWith('../')) {
    return `${serverHost}/${trimmed.replace(/^(\.\.\/)+/, '')}`;
  }

  // Root-relative path (e.g. /uploads/... or /images/...)
  if (trimmed.startsWith('/')) {
    return `${serverHost}${trimmed}`;
  }

  return `${serverHost}/${trimmed}`;
}

export default normalizeImageUrl;
