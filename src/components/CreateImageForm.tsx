import { BiTrash } from "react-icons/bi";
import { Button, Input, LoadingSpinner } from "../components/UI";
import { useImageUpload } from "../hooks/useImageUpload";

type CreateImageFormProps = {
  refetch: () => void;
};

export default function CreateImageForm({ refetch }: CreateImageFormProps) {
  const {
    fileInputRef,
    imagePreview,
    caption,
    metaData,
    sortOrder,
    errors,
    loading,
    imageUploading,
    setCaptionValue,
    setMetaDataValue,
    setSortOrderValue,
    handleImageChange,
    submit,
  } = useImageUpload(refetch);

  return (
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
            className="p-2 w-full border cursor-pointer"
          />
          {imageUploading ? <LoadingSpinner /> : <></>}
          {errors.has("image") && <span className="text-red-500 font-semibold text-sm">{errors.get("image")}</span>}
          {imagePreview && (
            <div className="mt-2 flex">
              <img
                src={imagePreview}
                alt="Image Preview"
                className="object-cover rounded shadow-md border w-32 h-32 sm:w-48 sm:h-48"
              />
              <Button
                type="button"
                variant="icon"
                onClick={() => handleImageChange(null)}
                className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                <BiTrash />
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
          {errors.has("caption") && <span className="text-red-500 font-semibold text-sm">{errors.get("caption")}</span>}
          <textarea
            placeholder="MetaData"
            required
            value={metaData}
            onChange={(e) => setMetaDataValue(e.target.value)}
            className="border rounded p-2 w-full"
          />
          {errors.has("metaData") && (
            <span className="text-red-500 font-semibold text-sm">{errors.get("metaData")}</span>
          )}
          <Input
            type="number"
            placeholder="SortOrder"
            required
            value={sortOrder}
            onChange={(e) => setSortOrderValue(Number.parseInt(e.target.value))}
            className="border rounded p-2 w-full"
          />
          {errors.has("sortOrder") && (
            <span className="text-red-500 font-semibold text-sm">{errors.get("sortOrder")}</span>
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
  );
}
