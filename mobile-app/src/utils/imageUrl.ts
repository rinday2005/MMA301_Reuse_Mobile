import { API_BASE_URL } from '../services/api';

/**
 * Normalizes image URLs for React Native Mobile App.
 * Handles Cloudinary URLs, web URLs, relative paths, and backend upload paths.
 */
export function normalizeImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // If already a full web URL (http:// or https://) or base64 data URL
  if (/^(https?:\/\/|data:image\/|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  // Get server root host from API_BASE_URL (strip trailing /api)
  const serverHost = API_BASE_URL.replace(/\/api\/?$/, '');

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
