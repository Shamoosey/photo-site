import { useRef, useState } from "react";
import { FaArrowDown, FaArrowUp, FaGripVertical, FaTrash } from "react-icons/fa6";
import { useBulkPhotoUpload } from "../hooks/useBulkPhotoUpload";
import { Button, Input } from "./UI";

const fieldClass = "rounded border border-gray-300 px-3 py-2 text-base dark:border-gray-600";

const AUTOSCROLL_EDGE = 90;
const AUTOSCROLL_SPEED = 14;

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

  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);
  const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer.types).includes("Files");

  const handleDragEnter = (e: React.DragEvent) => {
    if (isUploading || !hasFiles(e)) return;

    e.preventDefault();
    dragDepth.current++;
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isUploading || !hasFiles(e)) return;

    e.preventDefault();
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

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const endReorder = () => {
    setDraggingId(null);
    setOverId(null);
  };

  const draggingIndex = draggingId ? pendingImages.findIndex((img) => img.id === draggingId) : -1;

  const autoScroll = (e: React.DragEvent) => {
    if (e.clientY < AUTOSCROLL_EDGE) {
      window.scrollBy(0, -AUTOSCROLL_SPEED);
    } else if (window.innerHeight - e.clientY < AUTOSCROLL_EDGE) {
      window.scrollBy(0, AUTOSCROLL_SPEED);
    }
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const index = pendingImages.findIndex((img) => img.id === id);
    const newPosition = direction === "up" ? index : index + 2; // 1-based

    moveImage(id, direction);
    setAnnouncement(`Photo moved ${direction} to position ${newPosition} of ${pendingImages.length}`);
  };

  const handleReorderDrop = (targetId: string) => {
    if (!draggingId) return;

    const targetIndex = pendingImages.findIndex((img) => img.id === targetId);

    reorderImages(draggingId, targetId);
    if (draggingId !== targetId) {
      setAnnouncement(`Photo moved to position ${targetIndex + 1} of ${pendingImages.length}`);
    }
    endReorder();
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

      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Bulk upload photos</h3>
        <div className="flex items-center gap-2">
          {pendingImages.length > 1 && (
            <Button type="button" onClick={() => setCompact((c) => !c)} aria-pressed={compact}>
              {compact ? "Show details" : "Compact view"}
            </Button>
          )}
          <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? "Processing..." : "Select images"}
          </Button>
        </div>
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

      {pendingImages.length > 1 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Drag the grip or use the arrows to set the order. Photos upload in the order shown.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {pendingImages.length > 0 && (
        <div
          className={`flex flex-col ${compact ? "gap-2" : "gap-3"}`}
          onDragOver={(e) => {
            if (!draggingId) return;

            e.preventDefault();
            autoScroll(e);
          }}
          onDragLeave={(e) => {
            if (draggingId && !e.currentTarget.contains(e.relatedTarget as Node | null)) setOverId(null);
          }}>
          {pendingImages.map((img, index) => {
            const isTarget = overId === img.id && draggingId !== img.id;
            const dropAfter = draggingIndex !== -1 && draggingIndex < index;

            return (
              <div
                key={img.id}
                data-card
                onDragOver={(e) => {
                  if (!draggingId) return;

                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (overId !== img.id) setOverId(img.id);
                }}
                onDrop={(e) => {
                  if (!draggingId) return;

                  e.preventDefault();
                  e.stopPropagation();
                  handleReorderDrop(img.id);
                }}
                className={`relative flex rounded border transition ${
                  compact ? "items-center gap-2 p-2" : "flex-col gap-2 p-3 sm:flex-row sm:items-start"
                } border-gray-200 dark:border-gray-700 ${draggingId === img.id ? "opacity-40" : ""}`}>
                {isTarget && (
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-x-0 z-10 h-1 rounded bg-emerald-500 ${
                      dropAfter ? "-bottom-2" : "-top-2"
                    }`}
                  />
                )}

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
                  className={`flex shrink-0 cursor-grab items-center rounded px-2 py-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing dark:hover:bg-gray-800 ${
                    compact ? "" : "self-center sm:self-start sm:pt-8"
                  }`}>
                  <FaGripVertical />
                </span>

                <div className="relative shrink-0">
                  <img
                    src={img.preview}
                    alt=""
                    className={`rounded object-cover ${compact ? "h-14 w-14" : "h-24 w-24"}`}
                  />
                  <span
                    aria-label={`Position ${index + 1} of ${pendingImages.length}`}
                    className="absolute left-1 top-1 min-w-5 rounded bg-black/70 px-1.5 text-center text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                </div>

                {compact ? (
                  <p className="min-w-0 flex-1 truncate text-sm text-gray-600 dark:text-gray-300">
                    {img.caption || <span className="italic text-gray-400">No caption</span>}
                  </p>
                ) : (
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
                )}

                <div className={`flex shrink-0 gap-1 ${compact ? "" : "sm:flex-col"}`}>
                  <Button
                    type="button"
                    variant="icon"
                    aria-label={`Move photo ${index + 1} up`}
                    disabled={index === 0 || isUploading}
                    onClick={() => handleMove(img.id, "up")}>
                    <FaArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="icon"
                    aria-label={`Move photo ${index + 1} down`}
                    disabled={index === pendingImages.length - 1 || isUploading}
                    onClick={() => handleMove(img.id, "down")}>
                    <FaArrowDown />
                  </Button>
                  <Button
                    type="button"
                    variant="icon"
                    aria-label={`Remove photo ${index + 1}`}
                    onClick={() => removeImage(img.id)}>
                    <FaTrash />
                  </Button>
                </div>
              </div>
            );
          })}
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
