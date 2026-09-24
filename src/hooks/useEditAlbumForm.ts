import { useState, type ChangeEvent, type FormEvent } from "react";
import type { Album } from "../types/Album";
import type { EditAlbum } from "../types/EditAlbum";
import { useUpdateAlbum } from "./useAlbumMutations";

const MAX_INPUT_BYTES = 25 * 1024 * 1024; // reject originals over 25MB
const MAX_OUTPUT_BYTES = 10 * 1024 * 1024; // max 10MB after resizing
const MAX_DIMENSION = 1200;
const MAX_ATTEMPTS = 10;

const getByteSize = (dataUrl: string) => {
  const base64Length = dataUrl.split(",")[1]?.length || 0;
  return base64Length * 0.75; // base64 -> raw byte approximation
};

/** Resizes an image file to fit within MAX_DIMENSION and MAX_OUTPUT_BYTES. Returns a JPEG data URL. */
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }

        let width = img.width;
        let height = img.height;
        let quality = 0.85;

        // Scale down so the longest side is at most MAX_DIMENSION
        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }

        const render = (): string => {
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          // JPEG has no alpha channel; fill white so transparent PNGs don't turn black
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL("image/jpeg", quality);
        };

        let result = render();
        let attempts = 0;

        // Lower quality first, then shrink dimensions until under the size cap
        while (getByteSize(result) > MAX_OUTPUT_BYTES && attempts < MAX_ATTEMPTS) {
          if (quality > 0.4) {
            quality -= 0.1;
          } else {
            width *= 0.8;
            height *= 0.8;
          }
          result = render();
          attempts++;
        }

        if (getByteSize(result) > MAX_OUTPUT_BYTES) {
          reject(new Error("Unable to compress image below the required size"));
          return;
        }

        resolve(result);
      };

      img.onerror = () => reject(new Error("Couldn't read that image. Try a different file."));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Couldn't read that image. Try a different file."));
    reader.readAsDataURL(file);
  });
}

interface UseEditAlbumFormOptions {
  onSaved?: () => void;
}

export function useEditAlbumForm(album: Album, { onSaved }: UseEditAlbumFormOptions = {}) {
  const updateAlbum = useUpdateAlbum(album.id);

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
    setForm((prev) => ({ ...prev, [name]: value }));
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
      const dataUrl = await resizeImage(file);
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
    if (updateAlbum.isPending || isProcessingCover) return;

    const payload: EditAlbum = {
      name: form.name.trim(),
      description: form.description,
      coverImageBase64: coverImageBase64 ?? undefined,
      images: [],
    };

    updateAlbum.mutate(payload, { onSuccess: onSaved });
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
