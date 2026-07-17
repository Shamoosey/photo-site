import Lightbox from "../components/Lightbox";
import useLightbox from "../hooks/useLightbox";
import { usePhotoCollection } from "../hooks/usePhotos";

export default function Home() {
  const { photoCollection, isLoading, error } = usePhotoCollection("home", undefined);
  const { selectedIndex, closeLightbox, goNext, openLightbox, goPrev } = useLightbox(photoCollection?.images ?? []);

  return (
    <div className="flex flex-col">
      {!isLoading && photoCollection ? (
        <div className="flex flex-col">
          <section className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1">
            {photoCollection.images.map((image, i) => (
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
            images={photoCollection.images}
            selectedIndex={selectedIndex}
            onClose={closeLightbox}
            onNext={goNext}
            onPrev={goPrev}
          />
        </div>
      ) : (
        <div>
          <div>LOADING</div>
          <div>{error}</div>
        </div>
      )}
    </div>
  );
}
