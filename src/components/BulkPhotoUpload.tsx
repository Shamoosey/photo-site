import { useRef } from "react";
import { FaArrowDown, FaArrowUp, FaTrash } from "react-icons/fa6";
import { useBulkPhotoUpload } from "../hooks/useBulkPhotoUpload";
import { Button, Input } from "./UI";

const fieldClass = "rounded border border-gray-300 px-3 py-2 text-base dark:border-gray-600";

interface BulkPhotoUploadProps {
  albumId: string;
  startingSortOrder?: number;
  onUploaded?: () => void;
}

export function BulkPhotoUpload({ albumId, startingSortOrder, onUploaded }: BulkPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    pendingImages,
    isUploading,
    uploadProgress,
    error,
    addFiles,
    removeImage,
    updateImageField,
    moveImage,
    clearAll,
    uploadAll,
  } = useBulkPhotoUpload(albumId, { onUploaded, startingSortOrder });

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const uploadButtonLabel = isUploading
    ? uploadProgress && uploadProgress.total > 1
      ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}...`
      : "Uploading..."
    : `Upload ${pendingImages.length || ""} photo${pendingImages.length === 1 ? "" : "s"}`;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-300 p-4 dark:border-gray-600">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Bulk upload photos</h3>
        <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          {isUploading ? "Processing..." : "Select images"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {pendingImages.length > 0 && (
        <div className="flex flex-col gap-3">
          {pendingImages.map((img, index) => (
            <div
              key={img.id}
              className="flex flex-col gap-2 rounded border border-gray-200 p-3 sm:flex-row sm:items-start dark:border-gray-700">
              <img src={img.preview} alt="" className="h-24 w-24 shrink-0 rounded object-cover" />

              <div className="flex flex-1 flex-col gap-2">
                <label className="flex flex-col gap-1 text-sm">
                  Caption
                  <Input
                    value={img.caption}
                    onChange={(e) => updateImageField(img.id, "caption", e.target.value)}
                    className={fieldClass}
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                  Meta data
                  <Input
                    value={img.metaData}
                    onChange={(e) => updateImageField(img.id, "metaData", e.target.value)}
                    className={fieldClass}
                  />
                </label>
              </div>

              <div className="flex shrink-0 gap-1 sm:flex-col">
                <Button
                  type="button"
                  variant="icon"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => moveImage(img.id, "up")}>
                  <FaArrowUp />
                </Button>
                <Button
                  type="button"
                  variant="icon"
                  aria-label="Move down"
                  disabled={index === pendingImages.length - 1}
                  onClick={() => moveImage(img.id, "down")}>
                  <FaArrowDown />
                </Button>
                <Button type="button" variant="icon" aria-label="Remove image" onClick={() => removeImage(img.id)}>
                  <FaTrash />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          onClick={clearAll}
          disabled={pendingImages.length === 0 || isUploading}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
          Clear
        </Button>
        <Button
          type="button"
          onClick={uploadAll}
          disabled={pendingImages.length === 0 || isUploading}
          className="rounded bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600">
          {uploadButtonLabel}
        </Button>
      </div>
    </div>
  );
}
