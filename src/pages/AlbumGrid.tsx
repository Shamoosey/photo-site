import { LoadingSpinner } from "../components/UI";
import { useAlbums } from "../hooks/useAlbums";
import type { Album } from "../types/Album";
import { Link } from "react-router";

function AlbumCard({ album }: { album: Album }) {
  return (
    <Link
      to={`/albums/${album.id}`}
      className="group relative block w-full h-50 md:h-100 aspect-square overflow-hidden bg-black">
      <img
        src={album.coverImageUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-colors duration-500 group-hover:from-black/90 group-hover:via-black/50" />

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight drop-shadow">{album.name}</h2>
        {album.description && (
          <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-500 ease-in-out group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-visible:grid-rows-[1fr] group-focus-visible:opacity-100">
            <p className="overflow-hidden mt-1 text-sm md:text-base text-white/80 line-clamp-3">{album.description}</p>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function AlbumGrid() {
  const { albums, isLoading } = useAlbums();

  if (isLoading) {
    return (
      <div className="flex justify-center mt-80">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-1.5 p-1 md:pr-4 pt-2">
      {albums?.map((album) => (
        <AlbumCard key={album.id} album={album} />
      ))}
    </section>
  );
}
