import { useMemo, useState } from "react";
import { LoadingSpinner } from "../components/UI";
import { useAlbums } from "../hooks/useAlbums";
import type { Album } from "../types/Album";
import { cn } from "../utils/cn";
import { useNavigate } from "react-router";

export default function AlbumGrid() {
  const navigate = useNavigate();
  const { albums, isLoading } = useAlbums();
  const defaultAlbum = useMemo(() => albums?.find((x) => x.defaultAlbum), [albums]);
  const [hoveringAlbum, setIsHovering] = useState<Album | null>(null);

  const handleMouseEnter = (a: Album) => {
    setIsHovering(a);
  };

  const handleMouseLeave = () => {
    setIsHovering(null);
  };

  const isHoveringAlbum = (album: Album) => {
    let hovering = false;
    if (album == hoveringAlbum) {
      hovering = true;
    }
    return hovering;
  };

  return (
    <div className="flex flex-col">
      {!isLoading ? (
        <div className="flex flex-col">
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 p-1">
            {albums?.map((album, i) => (
              <div
                key={i}
                onClick={() => navigate(`/albums/${album.id}`)}
                className="w-full relative aspect-square overflow-hidden cursor-pointer bg-black"
                onMouseEnter={() => handleMouseEnter(album)}
                onMouseLeave={() => handleMouseLeave()}>
                <img
                  src={album.coverImageUrl}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-500 ease-in-out hover:scale-105",
                    isHoveringAlbum(album) ? "opacity-40" : "opacity-100",
                  )}
                />
                <div
                  className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white transition-opacity duration-500 ease-in-out",
                    isHoveringAlbum(album) ? "opacity-100" : "opacity-0 pointer-events-none",
                  )}>
                  <div>{album.name}</div>
                  <div>{album.description}</div>
                </div>
              </div>
            ))}
          </section>
        </div>
      ) : (
        <div className="flex justify-center mt-80">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
