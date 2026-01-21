/**
 * API utility functions for handling basePath
 */

// Get basePath from Next.js config
const basePath = '/repair'

/**
 * Get the full API URL with basePath
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${basePath}/${cleanPath}`
}

/**
 * Fetch wrapper that automatically adds basePath
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(path)
  return fetch(url, options)
}
