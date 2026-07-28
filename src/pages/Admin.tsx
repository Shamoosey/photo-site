import { Button, Input } from "../components/UI";
import { usePhotos } from "../hooks/usePhotos";
import { useImageUpload } from "../hooks/useImageUpload";
import { useDeleteImage } from "../hooks/useDeleteImage";
import { TbTrash } from "react-icons/tb";

function Admin() {
  const { isLoading, images, error, refetch } = usePhotos(undefined);
  const {
    fileInputRef,
    imagePreview,
    caption,
    metaData,
    errors,
    setCaptionValue,
    setMetaDataValue,
    handleImageChange,
    submit,
  } = useImageUpload(refetch);
  const { deleteImage } = useDeleteImage(refetch);

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
    <div className="flex mt-20">
      <form className="flex flex-col">
        <h1 className="text-xl">Images</h1>
        <div className="flex flex-col gap-2 mb-8 border p-4 rounded">
          <h2>Upload New Image</h2>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
            className="p-2 w-full"
          />
          {errors.has("image") && <span className="text-red-500 font-semibold text-sm">{errors.get("image")}</span>}
          {imagePreview && (
            <div className="mt-2 relative inline-block">
              <img src={imagePreview} alt="Image Preview" className="object-cover rounded shadow-md border w-48 h-48" />
              <button
                type="button"
                onClick={() => handleImageChange(null)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                ✕
              </button>
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
          {errors.has("caption") && <span className="text-red-500 font-semibold text-sm">{errors.get("caption")}</span>}
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
          <Button type="button" onClick={submit} className="bg-emerald-200 border rounded p-2">
            Add Image
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {getSortedImages().map((image, i) => (
            <div key={i} className="flex gap-2 border-black border-2 p-2 rounded min-w-200 min-h-50">
              <img src={image.imageUrl} className="w-48 h-48" />
              <div className="flex flex-col">
                <div className="flex flex-col gap-1 w-full">
                  <span className="font-bold">Caption:</span>
                  <span>{image.caption}</span>
                </div>
                <div className="flex flex-col gap-1 pt-4">
                  <span className="font-bold">MetaData:</span>
                  <span>{image.metaData}</span>
                </div>
                <div className="flex flex-col gap-1 pt-4">
                  <span className="font-bold">Updated At:</span>
                  <span>{formatDate(image.updatedAt.toString(), "medium")}</span>
                </div>
              </div>
              <div className="ml-auto">
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
