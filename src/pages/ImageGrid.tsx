import { useNavigate, useParams } from "react-router";
import { useAlbum } from "../hooks/useAlbum";
import { useAlbumImages } from "../hooks/useAlbumImages";
import useLightbox from "../hooks/useLightbox";
import Lightbox from "../components/Lightbox";
import { LoadingSpinner } from "../components/UI";

export function ImageGrid() {
  const { id } = useParams();
  const navigate = useNavigate();
  if (!id) {
    navigate("/");
  }

  const { data: albumData } = useAlbum(id!);
  const { albumImages, isLoading, sortedImages } = useAlbumImages(albumData!);
  const { selectedIndex, closeLightbox, goNext, openLightbox, goPrev } = useLightbox(albumImages!);

  return (
    <div className="flex flex-col">
      <header className="p-1 relative h-64 md:h-96 w-full overflow-hidden">
        {sortedImages?.[0] && (
          <img src={albumData?.coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow">{albumData?.name}</h1>
          {albumData?.description && <p className="mt-2 max-w-2xl text-white/80 md:text-lg">{albumData.description}</p>}
        </div>
      </header>
      {!isLoading && sortedImages ? (
        <div className="flex flex-col">
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 py-2">
            {sortedImages.map((image, i) => (
              <div
                key={i}
                className="w-full aspect-square overflow-hidden cursor-pointer"
                onClick={() => openLightbox(i)}>
                <img
                  src={image.imageUrl}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
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
      ) : (
        <div className="flex justify-center mt-80 ">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
