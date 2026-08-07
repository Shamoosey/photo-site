import Lightbox from "../components/Lightbox";
import { LoadingSpinner } from "../components/UI";
import useLightbox from "../hooks/useLightbox";
import { usePhotos } from "../hooks/usePhotos";

export default function Home() {
  const { images, sortedImages, isLoading } = usePhotos(undefined);
  const { selectedIndex, closeLightbox, goNext, openLightbox, goPrev } = useLightbox(images ?? []);

  return (
    <div className="flex flex-col">
      {!isLoading && images ? (
        <div className="flex flex-col">
          <section className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1">
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
            images={images}
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
