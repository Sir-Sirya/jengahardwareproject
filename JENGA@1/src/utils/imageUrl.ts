/**
 * Normalizes an image or media URL for consistent resolution across
 * localhost, Vite development proxies, and public tunnel endpoints (Dev Tunnels / ngrok).
 *
 * @param url The raw image URL or relative path from the database
 * @returns A safe, browsable image URL
 */
export function getMediaUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return '/placeholder.png';
  }

  const trimmed = url.trim();

  // 1. External HTTPS URLs (Cloudinary, Unsplash, S3, etc.) remain untouched
  if (trimmed.startsWith('https://') && !trimmed.includes('localhost')) {
    return trimmed;
  }

  // 2. Strip hardcoded localhost:8080 to convert it into a relative path
  if (trimmed.includes('localhost:8080')) {
    return trimmed.replace(/^https?:\/\/localhost:8080/, '');
  }

  // 3. Strip other local backend host bindings if present
  if (trimmed.includes('127.0.0.1:8080')) {
    return trimmed.replace(/^https?:\/\/127\.0\.0\.1:8080/, '');
  }

  // 4. Ensure local uploads begin with a leading slash for proxy resolution
  if (!trimmed.startsWith('/') && !trimmed.startsWith('http')) {
    return `/${trimmed}`;
  }

  return trimmed;
}

export default getMediaUrl;