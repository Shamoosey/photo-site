import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as PhotoService from "../services/photo.service";
import { uploadImage, type UploadedImage } from "../services/upload.service";
import { prepareImageForUpload } from "../utils/prepareImage";

export interface PendingImage {
  id: string;
  file: File;
  preview: string; // object URL
  caption: string;
  metaData: string;
  sortOrder: number;
  /** Set once the file is on Cloudinary, so a retry doesn't upload it again. */
  uploaded?: UploadedImage;
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

/** How many files to upload to Cloudinary at once. */
const UPLOAD_CONCURRENCY = 3;

const reindex = (images: PendingImage[]): PendingImage[] => images.map((img, idx) => ({ ...img, sortOrder: idx }));

/** Runs fn over items with at most `limit` in flight. Never rejects; returns per-item results. */
async function settleWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;

      try {
        results[i] = { status: "fulfilled", value: await fn(items[i]) };
      } catch (reason) {
        results[i] = { status: "rejected", reason };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));

  return results;
}

/**
 * Owns all state and logic for selecting, previewing, editing and
 * submitting a batch of images for an album. Files upload straight to
 * Cloudinary from the browser; the API only ever receives the resulting
 * URLs, so there's no request-size limit to work around here.
 */
export function useBulkPhotoUpload(albumId: string, options: UseBulkPhotoUploadOptions = {}) {
  const { onUploaded, startingSortOrder = 0 } = options;
  const queryClient = useQueryClient();

  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Revoke any remaining object URLs when the component unmounts.
  const latestImagesRef = useRef<PendingImage[]>([]);
  latestImagesRef.current = pendingImages;

  useEffect(() => {
    return () => latestImagesRef.current.forEach((img) => URL.revokeObjectURL(img.preview));
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newImages = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map(
        (file, index): PendingImage => ({
          id: `${file.name}-${file.lastModified}-${Date.now()}-${index}`,
          file,
          preview: URL.createObjectURL(file),
          caption: "",
          metaData: "",
          sortOrder: 0,
        }),
      );

    if (newImages.length === 0) return;

    setError(null);
    setPendingImages((prev) => reindex([...prev, ...newImages]));
  }, []);

  const removeImage = useCallback((id: string) => {
    setPendingImages((prev) => {
      prev.filter((img) => img.id === id).forEach((img) => URL.revokeObjectURL(img.preview));

      return reindex(prev.filter((img) => img.id !== id));
    });
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

      return reindex(next);
    });
  }, []);

  const clearAll = useCallback(() => {
    setPendingImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.preview));

      return [];
    });
    setError(null);
  }, []);

  const reorderImages = useCallback((fromId: string, toId: string) => {
    setPendingImages((prev) => {
      const from = prev.findIndex((img) => img.id === fromId);
      const to = prev.findIndex((img) => img.id === toId);

      if (from === -1 || to === -1 || from === to) return prev;

      const next = [...prev];
      const [moved] = next.splice(from, 1);

      next.splice(to, 0, moved);

      return reindex(next);
    });
  }, []);

  const uploadAll = useCallback(async () => {
    if (pendingImages.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      // 1) Upload anything not already on Cloudinary, a few files at a time.
      const toUpload = pendingImages.filter((img) => !img.uploaded);
      let completed = 0;

      setUploadProgress({ current: 0, total: toUpload.length });

      const results = await settleWithConcurrency(toUpload, UPLOAD_CONCURRENCY, async (img) => {
        const processed = await prepareImageForUpload(img.file);
        const uploaded = await uploadImage(processed);

        setUploadProgress({ current: ++completed, total: toUpload.length });

        return uploaded;
      });

      const uploadedById = new Map<string, UploadedImage>();
      let firstError: unknown = null;

      results.forEach((result, i) => {
        if (result.status === "fulfilled") uploadedById.set(toUpload[i].id, result.value);
        else firstError ??= result.reason;
      });

      // Cache successes on the pending items so a retry after a partial
      // failure only re-uploads the ones that actually failed.
      const withUploads = pendingImages.map((img) => ({
        ...img,
        uploaded: img.uploaded ?? uploadedById.get(img.id),
      }));

      setPendingImages((prev) => prev.map((img) => ({ ...img, uploaded: img.uploaded ?? uploadedById.get(img.id) })));

      // 2) Register the uploaded photos with the API in one small JSON request.
      const ready = withUploads.filter((img) => img.uploaded);

      if (ready.length > 0) {
        await PhotoService.uploadBulkImages(
          ready.map((img) => ({
            albumId,
            imageUrl: img.uploaded!.url,
            imageId: img.uploaded!.publicId,
            caption: img.caption,
            metaData: img.metaData,
            sortOrder: startingSortOrder + img.sortOrder,
          })),
        );

        // Drop what succeeded and keep the failures in the list so they can be retried.
        const readyIds = new Set(ready.map((img) => img.id));

        setPendingImages((prev) => {
          prev.filter((img) => readyIds.has(img.id)).forEach((img) => URL.revokeObjectURL(img.preview));

          return reindex(prev.filter((img) => !readyIds.has(img.id)));
        });

        // Mark the album's image list as stale and wait for the refetch so the
        // new photos show up as soon as the upload state resets.
        await queryClient.invalidateQueries({ queryKey: ["albumImages", albumId] });

        onUploaded?.();
      }

      if (firstError) {
        const failedCount = toUpload.length - uploadedById.size;
        const message = firstError instanceof Error ? firstError.message : "Something went wrong while uploading.";

        setError(
          ready.length > 0
            ? `Uploaded ${ready.length} of ${pendingImages.length} photos. ${failedCount} failed: ${message} The remaining photos are still in the list so you can try again.`
            : `Upload failed: ${message}`,
        );
      }
    } catch (err) {
      // Registering with the API failed. The files are already on Cloudinary
      // and cached on the pending items, so retrying only re-sends the JSON.
      setError(err instanceof Error ? err.message : "Something went wrong while saving the photos.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, [albumId, pendingImages, startingSortOrder, onUploaded, queryClient]);

  return {
    pendingImages,
    isUploading,
    uploadProgress,
    error,
    addFiles,
    reorderImages,
    removeImage,
    updateImageField,
    moveImage,
    clearAll,
    uploadAll,
  };
}
