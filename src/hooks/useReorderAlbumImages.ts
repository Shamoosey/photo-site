import { useEffect, useState } from "react";
import { editImageData } from "../services/photo.service";
import type { Image } from "../types/Image";

export function useReorderAlbumImages(images: Image[] | undefined, refetch: () => void) {
  const [orderedImages, setOrderedImages] = useState<Image[]>([]);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (images) {
      setOrderedImages([...images].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }, [images]);

  const isReordering = (imageId: string) => reorderingId === imageId;

  const persistSwap = async (current: Image, target: Image) => {
    await Promise.all([
      editImageData(current.id, {
        caption: current.caption,
        metaData: current.metaData,
        sortOrder: target.sortOrder,
      }),
      editImageData(target.id, {
        caption: target.caption,
        metaData: target.metaData,
        sortOrder: current.sortOrder,
      }),
    ]);
  };

  const moveImage = async (imageId: string, direction: "up" | "down") => {
    const index = orderedImages.findIndex((img) => img.id === imageId);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderedImages.length) return;

    const current = orderedImages[index];
    const target = orderedImages[targetIndex];

    const optimisticNext = [...orderedImages];
    [optimisticNext[index], optimisticNext[targetIndex]] = [optimisticNext[targetIndex], optimisticNext[index]];

    const previous = orderedImages;
    setOrderedImages(optimisticNext);
    setReorderingId(imageId);
    setError(null);

    try {
      await persistSwap(current, target);
      refetch();
    } catch (err) {
      setOrderedImages(previous);
      setError(err instanceof Error ? err.message : "Failed to reorder images");
    } finally {
      setReorderingId(null);
    }
  };

  // NEW: move an image to an arbitrary position (used by drag and drop)
  const moveImageTo = async (imageId: string, targetIndex: number) => {
    // Ignore new drags while a save is in flight
    if (reorderingId) return;

    const fromIndex = orderedImages.findIndex((img) => img.id === imageId);
    if (fromIndex === -1) return;
    if (targetIndex < 0 || targetIndex >= orderedImages.length || targetIndex === fromIndex) return;

    // Reorder the array: remove the dragged item and insert it at the target position
    const reordered = [...orderedImages];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    // Reuse the existing sortOrder values as "slots" so we don't change the numbering scheme.
    // If they aren't strictly increasing (duplicates), fall back to 0..n-1.
    const existing = orderedImages.map((img) => img.sortOrder);
    const isStrictlyIncreasing = existing.every((value, i) => i === 0 || value > existing[i - 1]);
    const slots = isStrictlyIncreasing ? existing : existing.map((_, i) => i);

    const next = reordered.map((img, i) => ({ ...img, sortOrder: slots[i] }));

    // Only persist images whose sortOrder actually changed
    const changed = next.filter((img) => {
      const before = orderedImages.find((o) => o.id === img.id);
      return before && before.sortOrder !== img.sortOrder;
    });

    const previous = orderedImages;
    setOrderedImages(next);
    setReorderingId(imageId);
    setError(null);

    try {
      await Promise.all(
        changed.map((img) =>
          editImageData(img.id, {
            caption: img.caption,
            metaData: img.metaData,
            sortOrder: img.sortOrder,
          }),
        ),
      );
      refetch();
    } catch (err) {
      setOrderedImages(previous);
      setError(err instanceof Error ? err.message : "Failed to reorder images");
    } finally {
      setReorderingId(null);
    }
  };

  return {
    orderedImages,
    moveImage,
    moveImageTo,
    isReordering,
    error,
  };
}
