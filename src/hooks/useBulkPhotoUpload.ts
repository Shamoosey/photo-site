import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { UploadImagePayload } from "../types/UploadImagePayload";
import * as PhotoService from "../services/photo.service";
import { useImageResize } from "./useImageResize";

export interface PendingImage {
  id: string;
  file: File;
  preview: string;
  base64: string;
  caption: string;
  metaData: string;
  sortOrder: number;
}

type EditablePendingField = "caption" | "metaData" | "sortOrder";

export interface UseBulkPhotoUploadOptions {
  onUploaded?: () => void;
  /** Offset applied to each new image's sortOrder so uploads append after existing photos. */
  startingSortOrder?: number;
}

export interface UploadProgress {
  current: number;
  total: number;
}

/**
 * The API rejects requests over 15 MB. Stay comfortably under that to leave
 * room for JSON/HTTP overhead.
 */
const MAX_REQUEST_BYTES = 10 * 1024 * 1024;

/** Rough per-image overhead for JSON keys, albumId, sortOrder, etc. */
const PAYLOAD_OVERHEAD_BYTES = 512;

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));

    reader.readAsDataURL(file);
  });
}

/** Base64 data URLs are ASCII, so string length is a good proxy for bytes on the wire. */
function estimateImageBytes(img: PendingImage): number {
  return img.base64.length + img.caption.length + img.metaData.length + PAYLOAD_OVERHEAD_BYTES;
}

function formatMegabytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

/** Splits images into batches whose estimated request size stays under the limit. */
function chunkImagesBySize(images: PendingImage[], maxBytes: number): PendingImage[][] {
  const batches: PendingImage[][] = [];
  let current: PendingImage[] = [];
  let currentBytes = 0;

  for (const img of images) {
    const size = estimateImageBytes(img);

    if (current.length > 0 && currentBytes + size > maxBytes) {
      batches.push(current);
      current = [];
      currentBytes = 0;
    }

    current.push(img);
    currentBytes += size;
  }

  if (current.length > 0) batches.push(current);

  return batches;
}

/**
 * When a request is rejected for being too large, the server's response often
 * has no CORS headers, so the browser surfaces it as a generic network
 * TypeError ("Failed to fetch") instead of a readable HTTP error.
 */
function describeUploadError(err: unknown): string {
  if (err instanceof TypeError) {
    return "The server couldn't be reached or the request was blocked. The upload may have been too large, or your connection dropped.";
  }

  if (err instanceof Error && err.message) return err.message;

  return "Something went wrong while uploading.";
}

/**
 * Owns all state and logic for selecting, previewing, editing and
 * submitting a batch of images for an album.
 */
export function useBulkPhotoUpload(albumId: string, options: UseBulkPhotoUploadOptions = {}) {
  const { onUploaded, startingSortOrder = 0 } = options;
  const { resizeImage } = useImageResize();
  const queryClient = useQueryClient();

  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((file) => file.type.startsWith("image/"));

      if (fileArray.length === 0) return;

      setIsProcessingFiles(true);
      setError(null);

      try {
        const newImages = await Promise.all(
          fileArray.map(async (file, index) => {
            // Resize before converting to Base64.
            const resizedFile = await resizeImage(file);

            const base64 = await readFileAsBase64(resizedFile);

            const pending: PendingImage = {
              id: `${file.name}-${file.lastModified}-${Date.now()}-${index}`,
              file: resizedFile,
              preview: base64,
              base64,
              caption: "",
              metaData: "",
              sortOrder: 0,
            };

            return pending;
          }),
        );

        setPendingImages((prev) => {
          const combined = [...prev, ...newImages];

          return combined.map((img, idx) => ({
            ...img,
            sortOrder: idx,
          }));
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to read selected files");
      } finally {
        setIsProcessingFiles(false);
      }
    },
    [resizeImage],
  );

  const removeImage = useCallback((id: string) => {
    setPendingImages((prev) =>
      prev
        .filter((img) => img.id !== id)
        .map((img, idx) => ({
          ...img,
          sortOrder: idx,
        })),
    );
  }, []);

  const updateImageField = useCallback((id: string, field: EditablePendingField, value: string | number) => {
    setPendingImages((prev) => prev.map((img) => (img.id === id ? { ...img, [field]: value } : img)));
  }, []);

  const moveImage = useCallback((id: string, direction: "up" | "down") => {
    setPendingImages((prev) => {
      const index = prev.findIndex((img) => img.id === id);

      if (index === -1) return prev;

      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }

      const next = [...prev];

      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

      return next.map((img, idx) => ({
        ...img,
        sortOrder: idx,
      }));
    });
  }, []);

  const clearAll = useCallback(() => {
    setPendingImages([]);
    setError(null);
  }, []);

  const uploadAll = useCallback(async () => {
    if (pendingImages.length === 0) return;

    // A single image that can't fit in one request can never be uploaded, so
    // tell the user which one instead of letting the request fail.
    const oversized = pendingImages.find((img) => estimateImageBytes(img) > MAX_REQUEST_BYTES);

    if (oversized) {
      setError(
        `"${oversized.file.name}" is too large to upload (${formatMegabytes(estimateImageBytes(oversized))} MB after resizing, limit is ${formatMegabytes(MAX_REQUEST_BYTES)} MB). Remove it or choose a smaller image.`,
      );
      return;
    }

    const batches = chunkImagesBySize(pendingImages, MAX_REQUEST_BYTES);
    const uploadedIds = new Set<string>();
    let failureMessage: string | null = null;

    setIsUploading(true);
    setError(null);

    try {
      for (let i = 0; i < batches.length; i++) {
        setUploadProgress({ current: i + 1, total: batches.length });

        const payloads: UploadImagePayload[] = batches[i].map((img) => ({
          albumId,
          imageBase64: img.base64,
          caption: img.caption,
          metaData: img.metaData,
          sortOrder: startingSortOrder + img.sortOrder,
        }));

        try {
          await PhotoService.uploadBulkImages(payloads);
          batches[i].forEach((img) => uploadedIds.add(img.id));
        } catch (err) {
          failureMessage = describeUploadError(err);
          break;
        }
      }

      if (uploadedIds.size > 0) {
        // Drop what succeeded and keep the failures in the list so they can be retried.
        setPendingImages((prev) =>
          prev
            .filter((img) => !uploadedIds.has(img.id))
            .map((img, idx) => ({
              ...img,
              sortOrder: idx,
            })),
        );

        // Mark the album's image list as stale and wait for the refetch so the
        // new photos show up as soon as the upload state resets.
        await queryClient.invalidateQueries({ queryKey: ["albumImages", albumId] });

        onUploaded?.();
      }

      if (failureMessage) {
        const total = pendingImages.length;
        const failedCount = total - uploadedIds.size;

        setError(
          uploadedIds.size > 0
            ? `Uploaded ${uploadedIds.size} of ${total} photos. ${failedCount} failed: ${failureMessage} The remaining photos are still in the list so you can try again.`
            : `Upload failed: ${failureMessage}`,
        );
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [albumId, pendingImages, startingSortOrder, onUploaded, queryClient]);

  return {
    pendingImages,
    isProcessingFiles,
    isUploading,
    uploadProgress,
    error,
    addFiles,
    removeImage,
    updateImageField,
    moveImage,
    clearAll,
    uploadAll,
  };
}
