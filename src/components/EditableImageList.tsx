import { Button, Input, LoadingSpinner } from "../components/UI";
import { useDeleteImage } from "../hooks/useDeleteImage";
import { useUpdateImage } from "../hooks/useUpdateImage";
import { TbTrash, TbPencil } from "react-icons/tb";
import type { Image } from "../types/Image";
import { formatDate } from "../utils/DateFormatter";

type EditableImageListProps = {
  images: Image[];
  refetch: () => void;
};

export default function EditableImageList({ images, refetch }: EditableImageListProps) {
  const { deleteImage } = useDeleteImage(refetch);
  const {
    caption: editCaption,
    metaData: editMetaData,
    errors: editErrors,
    loading: editLoading,
    isEditing,
    setCaptionValue: setEditCaptionValue,
    setMetaDataValue: setEditMetaDataValue,
    startEdit,
    cancelEdit,
    saveEdit,
  } = useUpdateImage(refetch);

  const getSortedImages = () => {
    return images.sort((a, b) => {
      if (a.updatedAt < b.updatedAt) {
        return 1;
      }

      return 0;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {getSortedImages().map((image, i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row gap-2 border-black border-2 p-2 rounded w-full sm:min-h-[200px]">
          <img src={image.imageUrl} className="w-full h-48 object-cover sm:w-48 sm:h-48 sm:object-cover rounded" />
          <div className="flex flex-col min-w-0 flex-1">
            {isEditing(image.id) ? (
              <>
                <div className="flex flex-col gap-1 w-full">
                  <span className="font-bold">Caption:</span>
                  <Input
                    type="text"
                    placeholder="Caption"
                    required
                    value={editCaption}
                    onChange={(e) => setEditCaptionValue(e.target.value)}
                    className="border rounded p-2 w-full"
                  />
                  {editErrors.has("caption") && (
                    <span className="text-red-500 font-semibold text-sm">{editErrors.get("caption")}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1 pt-4">
                  <span className="font-bold">MetaData:</span>
                  <Input
                    type="text"
                    placeholder="MetaData"
                    required
                    value={editMetaData}
                    onChange={(e) => setEditMetaDataValue(e.target.value)}
                    className="border rounded p-2 w-full"
                  />
                  {editErrors.has("metaData") && (
                    <span className="text-red-500 font-semibold text-sm">{editErrors.get("metaData")}</span>
                  )}
                </div>
                {editErrors.has("submit") && (
                  <span className="text-red-500 font-semibold text-sm pt-2">{editErrors.get("submit")}</span>
                )}
                <div className="flex gap-2 pt-4">
                  {editLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <Button
                        type="button"
                        onClick={saveEdit}
                        className="bg-emerald-200 border rounded p-2 w-full sm:w-auto">
                        Save
                      </Button>
                      <Button type="button" onClick={cancelEdit} className="border rounded p-2 w-full sm:w-auto">
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1 w-full">
                  <span className="font-bold">Caption:</span>
                  <span className="wrap-break-word">{image.caption}</span>
                </div>
                <div className="flex flex-col gap-1 pt-4">
                  <span className="font-bold">MetaData:</span>
                  <span className="wrap-break-word">{image.metaData}</span>
                </div>
                <div className="flex flex-col gap-1 pt-4">
                  <span className="font-bold">Updated At:</span>
                  <span>{formatDate(image.updatedAt.toString(), "medium")}</span>
                </div>
              </>
            )}
          </div>
          <div className="sm:ml-auto flex sm:flex-col justify-end gap-2">
            {!isEditing(image.id) && (
              <button type="button" onClick={() => startEdit(image)}>
                <TbPencil className="w-8 h-8" />
              </button>
            )}
            <button type="button" onClick={() => deleteImage(image.id)}>
              <TbTrash className="w-8 h-8" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
