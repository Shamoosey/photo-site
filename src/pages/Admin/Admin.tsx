import { useState } from "react";
import { TbPencil, TbPlus, TbTrash, TbX } from "react-icons/tb";
import { useAlbums } from "../../hooks/useAlbums";
import { Button, Input } from "../../components/UI";
import { useNavigate } from "react-router";
import { useCreateAlbum, useDeleteAlbum } from "../../hooks/useAlbumMutations";
import { useUploadImage } from "../../hooks/useUploadImage";
import { Textarea } from "../../components/UI/TextArea";

const MAX_INPUT_BYTES = 10 * 1024 * 1024; // match your Cloudinary plan's per-image limit

const emptyForm = { name: "", description: "" };

function Admin() {
  const { albums } = useAlbums();
  const navigate = useNavigate();

  const deleteAlbum = useDeleteAlbum();
  const createAlbum = useCreateAlbum();
  const uploadCover = useUploadImage();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");

  const isSubmitting = uploadCover.isPending || createAlbum.isPending;

  const deleteAlbumClick = (id: string) => {
    if (confirm("Are you sure you would like to delete this album?")) {
      deleteAlbum.mutate(id);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearCover = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview(null);
    uploadCover.reset(); // forget any previous upload result
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please choose an image file.");
      input.value = "";
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setImageError(`Image must be smaller than ${MAX_INPUT_BYTES / (1024 * 1024)}MB.`);
      input.value = "";
      return;
    }

    clearCover(); // revoke the previous preview URL and reset the upload result
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setImageError("");
  };

  const closeForm = () => {
    clearCover();
    setShowForm(false);
    setForm(emptyForm);
    setImageError("");
    createAlbum.reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!coverFile) {
      setImageError("Please choose a cover image.");
      return;
    }

    let uploaded;
    try {
      // If a previous attempt uploaded this file but creating the album failed,
      // reuse that result instead of uploading again.
      uploaded = uploadCover.data ?? (await uploadCover.mutateAsync(coverFile));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Couldn't upload that image.");
      return;
    }

    createAlbum.mutate(
      {
        name: form.name.trim(),
        description: form.description.trim(),
        coverImageUrl: uploaded.url,
        coverImageId: uploaded.publicId,
      },
      { onSuccess: closeForm },
    );
  };

  return (
    <section className="mt-8 px-4 md:mt-20 md:px-0">
      <div className="mb-4 flex items-center justify-between pr-4">
        <h1 className="text-xl font-semibold">Albums</h1>
        {!showForm && (
          <div className="flex justify-center cursor-pointer" onClick={() => setShowForm(true)}>
            <TbPlus className="mr-1 h-5 w-5" />
            <span>New album</span>
          </div>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 max-w-xl space-y-4 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Create album</h2>
            <Button variant="icon" type="button" aria-label="Cancel" onClick={closeForm}>
              <TbX className="h-5 w-5" />
            </Button>
          </div>

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Name
            </label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <Textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} />
          </div>

          <div>
            <label htmlFor="coverImage" className="mb-1 block text-sm font-medium">
              Cover image
            </label>
            <Input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-gray-200 file:px-3 file:py-2 file:text-sm"
            />
            {imageError && <p className="mt-1 text-sm text-red-600">{imageError}</p>}
            {coverPreview && (
              <img src={coverPreview} alt="Cover preview" className="mt-2 aspect-[2/1] w-full rounded object-cover" />
            )}
          </div>

          {createAlbum.isError && <p className="text-sm text-red-600">Couldn't create the album. Please try again.</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {uploadCover.isPending ? "Uploading image..." : createAlbum.isPending ? "Creating..." : "Create album"}
            </Button>
            <Button type="button" onClick={closeForm} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-6 pr-4">
        {albums?.map((album) => (
          <article key={album.id} className="group">
            <div className="relative aspect-[2/1] overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
              <img src={album.coverImageUrl} alt={album.name} className="h-full w-full object-cover " />

              <div className="absolute right-2 top-2 bg-white rounded">
                <Button variant="icon" aria-label={`Delete ${album.name}`} onClick={() => deleteAlbumClick(album.id)}>
                  <TbTrash className="h-5 w-5" />
                </Button>
              </div>
              <div className="absolute left-2 top-2 bg-white rounded">
                <Button
                  variant="icon"
                  aria-label={`Edit ${album.name}`}
                  onClick={() => navigate(`/admin/editAlbum/${album.id}`)}>
                  <TbPencil className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <h2 className="mt-2 truncate text-2xl">{album.name}</h2>
            <h3 className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{album.description}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Admin;
