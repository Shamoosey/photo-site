import { useState } from "react";
import { deleteImage as deleteImageService } from "../services/photo.service";

export function useDeleteImage(onSuccess?: () => void) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteImage = async (imageId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this image?");
    if (!confirmed) return;

    setDeletingId(imageId);
    await deleteImageService(imageId);
    setDeletingId(null);
    onSuccess?.();
  };

  return { deletingId, deleteImage };
}
