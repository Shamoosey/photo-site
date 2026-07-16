import Lightbox from "./Lightbox";
import useLightbox from "../hooks/useLightbox";
import type { ImageCollection } from "../types/ImageCollection";

interface PhotoGridProps {
  collection: ImageCollection;
}

export default function PhotoGrid(data: PhotoGridProps) {
  const { selectedIndex, closeLightbox, goNext, openLightbox, goPrev } = useLightbox(data.collection.images);

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1">
        {data.collection.images.map((image, i) => (
          <div key={i} className="w-full aspect-square overflow-hidden cursor-pointer" onClick={() => openLightbox(i)}>
            <img
              src={image.imageUrl}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        ))}
      </section>

      <Lightbox
        images={data.collection.images}
        selectedIndex={selectedIndex}
        onClose={closeLightbox}
        onNext={goNext}
        onPrev={goPrev}
      />
    </>
  );
}
