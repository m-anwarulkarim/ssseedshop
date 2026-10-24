/**
 * Client-side High-Performance Image Compression to WebP Format for Ss Seed Shop.
 * Uses modern Canvas API to convert any raster image (JPEG, PNG, BMP, etc.)
 * into lightweight, crystal-clear WebP files before uploading, ensuring
 * ultra-fast website loading speeds and minimal storage consumption.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0 (default: 0.82)
  forceWebP?: boolean; // default: true
}

export const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 1440,
  maxHeight: 1440,
  quality: 0.82,
  forceWebP: true,
};

/**
 * Standardize filename to end with .webp
 */
export function ensureWebPExtension(fileName: string): string {
  if (!fileName) return `image_${Date.now()}.webp`;
  const clean = fileName.replace(/\.[^.]+$/, "");
  return `${clean}.webp`;
}

/**
 * Compress and convert an image File to modern WebP format.
 * Returns a new File with .webp extension and drastically reduced byte size.
 */
export async function compressImageToWebP(
  file: File,
  options?: CompressOptions
): Promise<File> {
  // If not an image, return as is (e.g. video, document)
  if (!file || !file.type || !file.type.startsWith("image/")) {
    return file;
  }

  // Preserve vector SVGs as-is (they are already tiny and infinitely scalable)
  if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
    return file;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const targetQuality = Math.max(0.1, Math.min(1.0, opts.quality ?? 0.82));

  return new Promise((resolve) => {
    let objectUrl = "";
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      resolve(file);
      return;
    }

    const img = new Image();

    const cleanup = () => {
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {}
      }
    };

    img.onload = () => {
      try {
        let { width, height } = img;

        if (width === 0 || height === 0) {
          cleanup();
          resolve(file);
          return;
        }

        // Calculate proportional scale down if exceeds max dimensions
        const maxWidth = opts.maxWidth || 1440;
        const maxHeight = opts.maxHeight || 1440;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) {
          cleanup();
          resolve(file);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to WebP blob
        canvas.toBlob(
          (blob) => {
            cleanup();

            if (!blob) {
              resolve(file);
              return;
            }

            // If original was already WebP AND smaller, keep original
            const isOriginalWebP = file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp");
            if (isOriginalWebP && blob.size >= file.size && width === img.width && height === img.height) {
              resolve(file);
              return;
            }

            // Create new File with .webp extension and mime type image/webp
            const webpName = ensureWebPExtension(file.name);
            const webpFile = new File([blob], webpName, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            resolve(webpFile);
          },
          "image/webp",
          targetQuality
        );
      } catch (err) {
        console.warn("Image WebP compression error:", err);
        cleanup();
        resolve(file);
      }
    };

    img.onerror = () => {
      console.warn("Failed to load image for WebP compression, using original");
      cleanup();
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Compress an image file directly to a Base64 WebP Data URL string.
 */
export async function compressImageToWebPDataUrl(
  file: File,
  options?: CompressOptions
): Promise<string> {
  const webpFile = await compressImageToWebP(file, options);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image as data URL"));
    reader.readAsDataURL(webpFile);
  });
}

/**
 * Product image preset: 1200px max, quality 0.82 (crystal clear sharpness, ~40-80KB)
 */
export async function compressProductImage(file: File): Promise<File> {
  return compressImageToWebP(file, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.82,
  });
}

/**
 * User / Admin Profile Avatar preset: 512px max, quality 0.80 (ultra-light ~20-35KB)
 */
export async function compressAvatarImage(file: File): Promise<File> {
  return compressImageToWebP(file, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.80,
  });
}

/**
 * Full-width Banner / Hero image preset: 1600px max, quality 0.84
 */
export async function compressBannerImage(file: File): Promise<File> {
  return compressImageToWebP(file, {
    maxWidth: 1600,
    maxHeight: 1000,
    quality: 0.84,
  });
}

/**
 * Compress multiple image files to WebP.
 */
export async function compressImagesToWebP(
  files: File[],
  options?: CompressOptions
): Promise<File[]> {
  return Promise.all(files.map((f) => compressImageToWebP(f, options)));
}

/**
 * Generate a unique storage-friendly filename with .webp extension.
 */
export function generateWebPFileName(originalName?: string): string {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  const base = originalName ? originalName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "") : "img";
  return `${base || "img"}_${timestamp}_${rand}.webp`;
}
