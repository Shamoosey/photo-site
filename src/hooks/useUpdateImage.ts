import { useState } from "react";
import type { Image } from "../types/Image";
import { editImageData } from "../services/photo.service";

export function useUpdateImage(refetch: () => void) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [metaData, setMetaData] = useState<string>("");
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);

  const isEditing = (imageId: string) => editingId === imageId;

  const startEdit = (image: Image) => {
    setEditingId(image.id);
    setCaption(image.caption);
    setMetaData(image.metaData);
    setErrors(new Map());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCaption("");
    setMetaData("");
    setErrors(new Map());
  };

  const validate = () => {
    const newErrors = new Map<string, string>();
    if (!caption?.trim()) newErrors.set("caption", "Caption is required");
    if (!metaData?.trim()) newErrors.set("metaData", "MetaData is required");
    setErrors(newErrors);
    return newErrors.size === 0;
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!validate()) return;

    setLoading(true);
    try {
      await editImageData(editingId, { caption, metaData });
      refetch();
      cancelEdit();
    } catch (err) {
      setErrors(new Map([["submit", err instanceof Error ? err.message : "Failed to update image"]]));
    } finally {
      setLoading(false);
    }
  };

  return {
    editingId,
    caption,
    metaData,
    errors,
    loading,
    isEditing,
    setCaptionValue: setCaption,
    setMetaDataValue: setMetaData,
    startEdit,
    cancelEdit,
    saveEdit,
  };
}
