// Cloud Storage utility for project files
// Uses Lovable Cloud Storage bucket: project-files

const SUPABASE_URL = "https://woqjbwotxaaczkptnjfd.supabase.co";
const BUCKET_NAME = "project-files";

/**
 * Get the public URL for a file in Cloud Storage
 */
export function getCloudStorageUrl(filePath: string): string {
  // Remove leading slash if present
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${cleanPath}`;
}

/**
 * Check if a URL is a Cloud Storage URL
 */
export function isCloudStorageUrl(url: string): boolean {
  return url.includes(SUPABASE_URL) && url.includes('/storage/');
}

/**
 * Get file extension from path
 */
export function getFileExtension(path: string): string {
  const match = path.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
}

/**
 * Determine if file can be previewed in browser
 */
export function canPreviewFile(path: string): boolean {
  const ext = getFileExtension(path);
  const previewableExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
  return previewableExtensions.includes(ext);
}
