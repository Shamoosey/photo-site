import { Navigate, useNavigate, useParams } from "react-router";
import { FaAngleLeft } from "react-icons/fa6";
import { Button, Input } from "../../components/UI";
import { useAlbum } from "../../hooks/useAlbum";
import { useAlbumImages } from "../../hooks/useAlbumImages";
import type { Album } from "../../types/Album";
import { useEditAlbumForm } from "../../hooks/useEditAlbumForm";
import { BulkPhotoUpload } from "../../components/BulkPhotoUpload";
import { AlbumPhotoList } from "../../components/AlbumPhotoList";

const fieldClass = "rounded border border-gray-300 px-3 py-2 text-base dark:border-gray-600";

export default function EditAlbumPage() {
  const { id } = useParams();

  if (!id) return <Navigate to="/" replace />;

  return <EditAlbumLoader id={id} />;
}

function EditAlbumLoader({ id }: { id: string }) {
  const album = useAlbum(id);

  if (!album.data) {
    return <div>{album.isLoading ? "Loading album data..." : "Album not found."}</div>;
  }

  return <EditAlbumForm key={album.data.id} album={album.data} />;
}

function EditAlbumForm({ album }: { album: Album }) {
  const navigate = useNavigate();
  const goBack = () => navigate("/admin");

  const { form, coverPreview, isSaving, isUploadingCover, error, handleChange, handleCoverChange, handleSubmit } =
    useEditAlbumForm(album, {});

  const { albumImages } = useAlbumImages(album.id);

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
        <div className="flex">
          <Button type="button" variant="icon" onClick={goBack} aria-label="Back to admin">
            <FaAngleLeft />
          </Button>
          <h2 className="text-xl font-semibold">Edit album</h2>
        </div>

        <div className="aspect-[2/1] overflow-hidden rounded-lg bg-gray-200">
          {coverPreview && <img src={coverPreview} alt="" className="h-full w-full object-cover" />}
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Name
          <Input name="name" value={form.name} onChange={handleChange} required className={fieldClass} />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Sort Order
          <Input
            name="sortOrder"
            value={form.sortOrder}
            type="number"
            onChange={handleChange}
            required
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Cover image
          <Input type="file" accept="image/*" onChange={handleCoverChange} className={fieldClass} />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button
            type="button"
            onClick={goBack}
            disabled={isSaving}
            className="rounded bg-red-500 px-4 py-2 text-cream hover:bg-red-600">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving || isUploadingCover}
            className="rounded bg-emerald-500 px-4 py-2 text-cream hover:bg-emerald-600">
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-6 px-6 pb-6">
        <BulkPhotoUpload albumId={album.id} startingSortOrder={albumImages?.length ?? 0} />
        <AlbumPhotoList albumId={album.id} />
      </div>
    </div>
  );
}
