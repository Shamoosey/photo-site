import { useRef, useState } from "react";
import { FaArrowDown, FaArrowUp, FaGripVertical, FaTrash } from "react-icons/fa6";
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
    reorderImages,
    clearAll,
    uploadAll,
  } = useBulkPhotoUpload(albumId, { onUploaded, startingSortOrder });

  // ---- Dropping files from the OS onto the component ----
  const [isDragging, setIsDragging] = useState(false);
  // dragenter/dragleave also fire when crossing child elements, so count them
  // instead of toggling a boolean, otherwise the highlight flickers.
  const dragDepth = useRef(0);

  // Internal reorder drags don't carry "Files", so they never trigger this.
  const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer.types).includes("Files");

  const handleDragEnter = (e: React.DragEvent) => {
    if (isUploading || !hasFiles(e)) return;

    e.preventDefault();
    dragDepth.current++;
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isUploading || !hasFiles(e)) return;

    e.preventDefault(); // required, or the browser won't allow a drop
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;

    dragDepth.current = Math.max(0, dragDepth.current - 1);

    if (dragDepth.current === 0) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!hasFiles(e)) return;

    e.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);

    if (isUploading) return;

    addFiles(e.dataTransfer.files);
  };

  // ---- Reordering the pending list by dragging the grip handle ----
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const endReorder = () => {
    setDraggingId(null);
    setOverId(null);
  };

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
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex flex-col gap-4 rounded-lg border-2 p-4 transition-colors ${
        isDragging
          ? "border-dashed border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
          : "border-gray-300 dark:border-gray-600"
      }`}>
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-emerald-500/10">
          <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">Drop images to add them</p>
        </div>
      )}

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

      {pendingImages.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Drag and drop images here, or use “Select images”.</p>
      )}

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
              data-card
              onDragOver={(e) => {
                if (!draggingId) return;

                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setOverId(img.id);
              }}
              onDrop={(e) => {
                if (!draggingId) return;

                e.preventDefault();
                e.stopPropagation();
                reorderImages(draggingId, img.id);
                endReorder();
              }}
              className={`flex flex-col gap-2 rounded border p-3 transition sm:flex-row sm:items-start ${
                overId === img.id && draggingId !== img.id
                  ? "border-emerald-500 ring-2 ring-emerald-300"
                  : "border-gray-200 dark:border-gray-700"
              } ${draggingId === img.id ? "opacity-40" : ""}`}>
              <span
                draggable={!isUploading}
                title="Drag to reorder"
                aria-hidden="true"
                onDragStart={(e) => {
                  const card = e.currentTarget.closest("[data-card]");

                  if (card) e.dataTransfer.setDragImage(card, 0, 0);

                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", img.id); // Firefox needs data set to start a drag
                  setDraggingId(img.id);
                }}
                onDragEnd={endReorder}
                className="flex shrink-0 cursor-grab items-center self-center px-1 text-gray-400 hover:text-gray-600 active:cursor-grabbing sm:self-start sm:pt-8">
                <FaGripVertical />
              </span>

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
          className="rounded bg-red-500 px-4 py-2 text-cream hover:bg-red-600">
          Clear
        </Button>
        <Button
          type="button"
          onClick={uploadAll}
          disabled={pendingImages.length === 0 || isUploading}
          className="rounded bg-emerald-500 px-4 py-2 text-cream hover:bg-emerald-600">
          {uploadButtonLabel}
        </Button>
      </div>
    </div>
  );
}
