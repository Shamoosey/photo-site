import { Button, Input, LoadingSpinner } from "../components/UI";
import { usePhotos } from "../hooks/usePhotos";
import { useImageUpload } from "../hooks/useImageUpload";
import { useDeleteImage } from "../hooks/useDeleteImage";
import { useUpdateImage } from "../hooks/useUpdateImage";
import { TbTrash, TbPencil } from "react-icons/tb";

function Admin() {
  const { images, refetch } = usePhotos(undefined);
  const {
    fileInputRef,
    imagePreview,
    caption,
    metaData,
    errors,
    loading,
    imageUploading,
    setCaptionValue,
    setMetaDataValue,
    handleImageChange,
    submit,
  } = useImageUpload(refetch);
  const { deleteImage } = useDeleteImage(refetch);
  const {
    editingId,
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

  const formatDate = (dateString: string, style: "medium" | "full" | "long" | "short" | undefined) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      dateStyle: style,
      timeStyle: style,
    });
  };

  return (
    <div className="flex mt-8 md:mt-20 px-4 md:px-0">
      <form className="flex flex-col w-full max-w-3xl mx-auto md:mx-0">
        <h1 className="text-xl">Images</h1>
        <div className="flex flex-col gap-2 mb-8 border p-4 rounded">
          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <h2>Upload New Image</h2>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                className="p-2 w-full"
              />
              {imageUploading ? <LoadingSpinner /> : <></>}
              {errors.has("image") && <span className="text-red-500 font-semibold text-sm">{errors.get("image")}</span>}
              {imagePreview && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Image Preview"
                    className="object-cover rounded shadow-md border w-32 h-32 sm:w-48 sm:h-48"
                  />
                  <Button
                    type="button"
                    variant="icon"
                    onClick={() => handleImageChange(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                    ✕
                  </Button>
                </div>
              )}
              <Input
                type="text"
                placeholder="Caption"
                required
                value={caption}
                onChange={(e) => setCaptionValue(e.target.value)}
                className="border rounded p-2 w-full"
              />
              {errors.has("caption") && (
                <span className="text-red-500 font-semibold text-sm">{errors.get("caption")}</span>
              )}
              <Input
                type="text"
                placeholder="MetaData"
                required
                value={metaData}
                onChange={(e) => setMetaDataValue(e.target.value)}
                className="border rounded p-2 w-full"
              />
              {errors.has("metaData") && (
                <span className="text-red-500 font-semibold text-sm">{errors.get("metaData")}</span>
              )}
              <Button
                type="button"
                onClick={submit}
                disabled={imageUploading}
                className="bg-emerald-200 border rounded p-2 w-full sm:w-auto">
                Add Image
              </Button>
            </>
          )}
        </div>
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
      </form>
    </div>
  );
}

export default Admin;
