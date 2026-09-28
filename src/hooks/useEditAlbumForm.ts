import { useState, type ChangeEvent, type FormEvent } from "react";
import type { Album } from "../types/Album";
import type { EditAlbum } from "../types/EditAlbum";
import { useImageResize } from "./useImageResize";
import { useUpdateAlbum } from "./useAlbumMutations";

const MAX_INPUT_BYTES = 25 * 1024 * 1024; // reject originals over 25MB

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Couldn't read that image."));

    reader.readAsDataURL(file);
  });
};

interface UseEditAlbumFormOptions {
  onSaved?: () => void;
}

export function useEditAlbumForm(album: Album, { onSaved }: UseEditAlbumFormOptions = {}) {
  const updateAlbum = useUpdateAlbum(album.id);
  const { resizeImage } = useImageResize();

  const [form, setForm] = useState({
    name: album.name,
    description: album.description ?? "",
  });

  const [coverPreview, setCoverPreview] = useState<string | null>(album.coverImageUrl ?? null);
  const [coverImageBase64, setCoverImageBase64] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [isProcessingCover, setIsProcessingCover] = useState(false);
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCoverChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    setCoverError(null);

    if (!file.type.startsWith("image/")) {
      setCoverError("Only image files are allowed");
      input.value = "";
      return;
    }

    if (file.size > MAX_INPUT_BYTES) {
      setCoverError("Image must be less than 25MB");
      input.value = "";
      return;
    }

    setIsProcessingCover(true);

    try {
      const resizedFile = await resizeImage(file);

      const dataUrl = await readFileAsBase64(resizedFile);

      setCoverPreview(dataUrl);
      setCoverImageBase64(dataUrl.split(",")[1]);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : "Couldn't process that image. Try a different file.");

      input.value = "";
    } finally {
      setIsProcessingCover(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (updateAlbum.isPending || isProcessingCover) {
      return;
    }

    const payload: EditAlbum = {
      name: form.name.trim(),
      description: form.description,
      coverImageBase64: coverImageBase64 ?? undefined,
      images: [],
    };

    updateAlbum.mutate(payload, {
      onSuccess: onSaved,
    });
  };

  const saveError = updateAlbum.error
    ? updateAlbum.error instanceof Error
      ? updateAlbum.error.message
      : "Couldn't save your changes. Try again."
    : null;

  return {
    form,
    coverPreview,
    isSaving: updateAlbum.isPending,
    isProcessingCover,
    error: coverError ?? saveError,
    handleChange,
    handleCoverChange,
    handleSubmit,
  };
}
