import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { Album } from "../types/Album";
import type { EditAlbum } from "../types/EditAlbum";
import { useUpdateAlbum } from "./useAlbumMutations";
import { useUploadImage } from "./useUploadImage";

const MAX_INPUT_BYTES = 10 * 1024 * 1024; // match your Cloudinary plan's per-image limit

interface UseEditAlbumFormOptions {
  onSaved?: () => void;
}

export function useEditAlbumForm(album: Album, { onSaved }: UseEditAlbumFormOptions = {}) {
  const updateAlbum = useUpdateAlbum(album.id);
  const uploadCover = useUploadImage();

  const [form, setForm] = useState({
    name: album.name,
    description: album.description ?? "",
  });

  const [coverPreview, setCoverPreview] = useState<string | null>(album.coverImageUrl ?? null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  // Revoke the current blob preview when the component unmounts.
  const previewRef = useRef(coverPreview);
  previewRef.current = coverPreview;

  useEffect(() => {
    return () => {
      if (previewRef.current?.startsWith("blob:")) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      setCoverError(`Image must be less than ${MAX_INPUT_BYTES / (1024 * 1024)}MB`);
      input.value = "";
      return;
    }

    // Only revoke blob URLs we created, not the album's existing remote cover URL.
    if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);

    uploadCover.reset(); // a new file means any earlier upload result is stale
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (updateAlbum.isPending || uploadCover.isPending) return;

    setCoverError(null);

    let cover: Pick<EditAlbum, "coverImageId" | "coverImageUrl"> | undefined;

    if (coverFile) {
      try {
        // If an earlier attempt uploaded this file but saving failed, reuse that result.
        const uploaded = uploadCover.data ?? (await uploadCover.mutateAsync(coverFile));

        cover = { coverImageUrl: uploaded.url, coverImageId: uploaded.publicId };
      } catch (err) {
        setCoverError(err instanceof Error ? err.message : "Couldn't upload that image. Try a different file.");
        return;
      }
    }

    const payload: EditAlbum = {
      name: form.name.trim(),
      description: form.description,
      ...cover,
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
    isSaving: updateAlbum.isPending || uploadCover.isPending,
    isUploadingCover: uploadCover.isPending,
    error: coverError ?? saveError,
    handleChange,
    handleCoverChange,
    handleSubmit,
  };
}
