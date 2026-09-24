import { TbPencil, TbTrash } from "react-icons/tb";
import { useAlbums } from "../../hooks/useAlbums";
import { Button } from "../../components/UI";
import { useNavigate } from "react-router";
import { useDeleteAlbum } from "../../hooks/useAlbumMutations";

function Admin() {
  const { albums } = useAlbums();
  const navigate = useNavigate();

  const deleteAlbum = useDeleteAlbum();

  const deleteAlbumClick = (id: string) => {
    if (confirm("Are you sure you would like to delete this album?")) {
      deleteAlbum.mutate(id);
    }
  };

  return (
    <section className="mt-8 px-4 md:mt-20 md:px-0">
      <h1 className="mb-4 text-xl font-semibold">Albums</h1>

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
