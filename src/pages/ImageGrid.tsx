import { useNavigate, useParams } from "react-router";
import { useAlbum } from "../hooks/useAlbum";
import { useAlbumImages } from "../hooks/useAlbumImages";
import useLightbox from "../hooks/useLightbox";
import Lightbox from "../components/Lightbox";
import { LoadingSpinner } from "../components/UI";
import { Suspense } from "react";

export function ImageGrid() {
  const { id } = useParams();
  const navigate = useNavigate();
  if (!id) {
    navigate("/");
  }
  const { data: albumData } = useAlbum(id!);
  const { albumImages, sortedImages, isLoading } = useAlbumImages(id);
  const { openLightbox, closeLightbox, goNext, goPrev, selectedIndex } = useLightbox(albumImages!);
  return (
    <div className="flex flex-col p-1 md:pr-4 pt-2 bg-cream">
      <header className="relative h-72 sm:h-96 md:h-115 w-full overflow-hidden">
        <img src={albumData?.coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 ">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow text-cream">{albumData?.name}</h1>
          {albumData?.description && (
            <p className="mt-2 max-w-2xl text-cream-darker md:text-lg">{albumData.description}</p>
          )}
        </div>
      </header>
      {!isLoading && sortedImages ? (
        <Suspense fallback={<LoadingSpinner />}>
          <div className="flex flex-col">
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 py-2">
              {sortedImages.map((image, i) => (
                <div
                  key={i}
                  className="w-full aspect-square overflow-hidden cursor-pointer"
                  onClick={() => openLightbox(i)}>
                  <img
                    loading="lazy"
                    src={image.imageUrl}
                    onContextMenu={(e) => {
                      e.preventDefault();
                    }}
                    className="w-full h-full object-cover scale-[1.055] transition-transform duration-300 hover:scale-[1.106]"
                  />
                </div>
              ))}
            </section>

            <Lightbox
              images={sortedImages}
              selectedIndex={selectedIndex}
              onClose={closeLightbox}
              onNext={goNext}
              onPrev={goPrev}
            />
          </div>
        </Suspense>
      ) : (
        <div className="flex justify-center mt-80 ">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
