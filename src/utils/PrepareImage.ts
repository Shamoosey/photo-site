export interface PrepareImageOptions {
  /** Longest side of the output, in px. Smaller images are never upscaled. */
  maxDimension?: number;
  /** JPEG quality, 0-1. */
  quality?: number;
  /** Watermark text tiled across the image. */
  watermarkText?: string;
}

const DEFAULTS: Required<PrepareImageOptions> = {
  maxDimension: 1600,
  quality: 0.82,
  watermarkText: "Shamus Osler",
};

function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number, text: string) {
  const fontSize = Math.max(14, Math.round(Math.min(w, h) * 0.035));
  const margin = Math.round(Math.min(w, h) * 0.03);

  ctx.save();
  ctx.font = `500 ${fontSize}px sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = fontSize * 0.3;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = fontSize * 0.05;

  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillText(text, w - margin, h - margin);

  ctx.restore();
}

/**
 * Downsizes an image, tiles a watermark across it, and re-encodes as JPEG.
 * Re-encoding via canvas also strips EXIF metadata (including GPS location).
 */
export async function prepareImageForUpload(file: File, options: PrepareImageOptions = {}): Promise<File> {
  const { maxDimension, quality, watermarkText } = { ...DEFAULTS, ...options };

  // "from-image" applies EXIF rotation so phone photos aren't sideways.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Could not process image: canvas is unavailable.");

    ctx.imageSmoothingQuality = "high";
    // JPEG has no alpha; fill first so transparent PNGs don't turn black.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);

    drawWatermark(ctx, w, h, watermarkText);

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode image."))), "image/jpeg", quality),
    );

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";

    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}
