import { useEffect } from "react";
import type { Image } from "../types/Image";
import { Button } from "./UI/Button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface LightboxProps {
  images: Image[];
  selectedIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Lightbox({ images, selectedIndex, onClose, onNext, onPrev }: LightboxProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onNext, onPrev]);

  if (selectedIndex === null) return null;

  const current = images[selectedIndex];

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}>
      <Button
        className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-gray-300 transition-colors"
        onClick={onClose}>
        <X />
      </Button>

      <Button
        variant="icon"
        className="absolute left-4 text-white text-4xl leading-none hover:text-gray-300 transition-colors p-4"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}>
        <ChevronLeft />
      </Button>

      <div className="flex flex-col items-center gap-3 max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <img src={current.imageUrl} className="max-h-[80vh] max-w-[90vw] object-contain rounded shadow-2xl" />

        {(current.caption || current.metaData) && (
          <div className="text-center text-white px-4">
            {current.caption && <p className="text-sm font-medium">{current.caption}</p>}
            {current.metaData && <p className="text-xs text-white/50 mt-0.5">{current.metaData}</p>}
          </div>
        )}
      </div>

      <Button
        variant="icon"
        className="absolute right-4 text-white text-4xl leading-none hover:text-gray-300 transition-colors p-4"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}>
        <ChevronRight />
      </Button>

      <div className="absolute bottom-4 text-white text-sm opacity-70">
        {selectedIndex + 1} / {images.length}
      </div>
    </div>
  );
}
