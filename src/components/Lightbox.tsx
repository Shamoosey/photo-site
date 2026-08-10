import { useEffect } from "react";
import type { Image } from "../types/Image";
import { Button } from "./UI/Button";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaX } from "react-icons/fa6";

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

  useEffect(() => {
    if (selectedIndex === null) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedIndex]);

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
        <FaX />
      </Button>

      <div className="flex flex-col items-center gap-3 max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <img src={current.imageUrl} className="max-h-[78vh] max-w-[90vw] object-contain rounded shadow-2xl" />

        {(current.caption || current.metaData) && (
          <div className="w-full max-w-[90vw] min-w-0 text-center text-white px-4">
            {current.caption && <p className="text-sm font-medium wrap-break-word">{current.caption}</p>}
            {current.metaData && (
              <p className="text-xs text-white/50 mt-0.5 whitespace-pre-wrap wrap-break-word">{current.metaData}</p>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-4 flex items-center gap-4 text-white" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="icon"
          className="text-xl leading-none hover:text-gray-300 transition-colors p-2"
          onClick={onPrev}>
          <FaChevronLeft />
        </Button>

        <span className="text-sm opacity-70">
          {selectedIndex + 1} / {images.length}
        </span>

        <Button
          variant="icon"
          className="text-xl leading-none hover:text-gray-300 transition-colors p-2"
          onClick={onNext}>
          <FaChevronRight />
        </Button>
      </div>
    </div>
  );
}
