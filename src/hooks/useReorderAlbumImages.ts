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

  return {
    orderedImages,
    moveImage,
    isReordering,
    error,
  };
}
