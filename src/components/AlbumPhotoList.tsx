import { FaArrowDown, FaArrowUp, FaCheck, FaPen, FaTrash, FaXmark } from "react-icons/fa6";
import { Button, Input } from "./UI";
import { useAlbumImages } from "../hooks/useAlbumImages";
import { useUpdateImage } from "../hooks/useUpdateImage";
import { useDeleteImage } from "../hooks/useDeleteImage";
import type { Image } from "../types/Image";
import { useReorderAlbumImages } from "../hooks/useReorderAlbumImages";

const fieldClass = "rounded border border-gray-300 px-3 py-2 text-base dark:border-gray-600";

interface AlbumPhotoListProps {
  albumId: string;
}

export function AlbumPhotoList({ albumId }: AlbumPhotoListProps) {
  const { albumImages, isLoading, error, refetch } = useAlbumImages(albumId);

  const {
    isEditing,
    caption,
    metaData,
    sortOrder,
    errors,
    loading: isSavingEdit,
    setCaptionValue,
    setMetaDataValue,
    setSortOrderValue,
    startEdit,
    cancelEdit,
    saveEdit,
  } = useUpdateImage(refetch);

  const { deletingId, deleteImage } = useDeleteImage(refetch);

  const { orderedImages, moveImage, isReordering, error: reorderError } = useReorderAlbumImages(albumImages, refetch);

  if (isLoading) return <p className="text-sm text-gray-500">Loading photos...</p>;
  if (error) return <p className="text-sm text-red-500">Failed to load photos.</p>;
  if (!albumImages || albumImages.length === 0) {
    return <p className="text-sm text-gray-500">No photos in this album yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Photos in this album</h3>

      {reorderError && (
        <p role="alert" className="text-sm text-red-500">
          {reorderError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {orderedImages.map((image: Image, index: number) =>
          isEditing(image.id) ? (
            <div key={image.id} className="flex flex-col gap-2 rounded border border-gray-200 p-3 dark:border-gray-700">
              <img src={image.imageUrl} alt="" className="h-40 w-full rounded object-cover" />

              <label className="flex flex-col gap-1 text-sm">
                Caption
                <Input value={caption} onChange={(e) => setCaptionValue(e.target.value)} className={fieldClass} />
                {errors.get("caption") && <span className="text-xs text-red-500">{errors.get("caption")}</span>}
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Meta data
                <Input value={metaData} onChange={(e) => setMetaDataValue(e.target.value)} className={fieldClass} />
                {errors.get("metaData") && <span className="text-xs text-red-500">{errors.get("metaData")}</span>}
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Sort order
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrderValue(Number(e.target.value))}
                  className={fieldClass}
                />
                {errors.get("sortOrder") && <span className="text-xs text-red-500">{errors.get("sortOrder")}</span>}
              </label>

              {errors.get("submit") && <span className="text-xs text-red-500">{errors.get("submit")}</span>}

              <div className="mt-1 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="icon"
                  aria-label="Cancel edit"
                  onClick={cancelEdit}
                  disabled={isSavingEdit}>
                  <FaXmark />
                </Button>
                <Button type="button" variant="icon" aria-label="Save edit" onClick={saveEdit} disabled={isSavingEdit}>
                  <FaCheck />
                </Button>
              </div>
            </div>
          ) : (
            <div key={image.id} className="flex flex-col gap-2 rounded border border-gray-200 p-3 dark:border-gray-700">
              <img src={image.imageUrl} alt={image.caption} className="h-40 w-full rounded object-cover" />

              <p className="truncate text-sm font-medium">{image.caption || "No caption"}</p>
              <p className="truncate text-xs text-gray-500">{image.metaData || "No meta data"}</p>

              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="icon"
                    aria-label="Move photo earlier"
                    onClick={() => moveImage(image.id, "up")}
                    disabled={index === 0 || isReordering(image.id)}>
                    <FaArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="icon"
                    aria-label="Move photo later"
                    onClick={() => moveImage(image.id, "down")}
                    disabled={index === orderedImages.length - 1 || isReordering(image.id)}>
                    <FaArrowDown />
                  </Button>
                </div>

                <div className="flex gap-1">
                  <Button type="button" variant="icon" aria-label="Edit photo" onClick={() => startEdit(image)}>
                    <FaPen />
                  </Button>
                  <Button
                    type="button"
                    variant="icon"
                    aria-label="Delete photo"
                    onClick={() => deleteImage(image.id)}
                    disabled={deletingId === image.id}>
                    <FaTrash />
                  </Button>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
