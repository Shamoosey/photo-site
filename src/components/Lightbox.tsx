import { useEffect, useRef } from "react";
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

const SWIPE_THRESHOLD = 50; // min horizontal px distance to count as a swipe
const SWIPE_RESTRAINT = 75; // max vertical px drift allowed (avoids hijacking vertical scroll)

export default function Lightbox({ images, selectedIndex, onClose, onNext, onPrev }: LightboxProps) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    if (!start) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    touchStartRef.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    if (Math.abs(deltaY) > SWIPE_RESTRAINT) return;

    if (deltaX < 0) {
      onNext();
    } else {
      onPrev();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}>
      <Button
        className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white text-2xl sm:text-3xl leading-none hover:text-gray-300 transition-colors"
        onClick={onClose}>
        <FaX />
      </Button>

      <div
        className="flex flex-col items-center gap-2 sm:gap-3 w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] 2xl:max-w-[70vw] h-full max-h-[80vh] sm:max-h-[85vh] min-h-0"
        onClick={(e) => e.stopPropagation()}>
        <img
          src={current.imageUrl}
          className="flex-1 min-h-0 w-full max-w-full object-contain rounded drop-shadow-2xl"
        />

        {(current.caption || current.metaData) && (
          <div className="flex-shrink-0 w-full min-w-0 text-center text-white px-2 sm:px-4">
            {current.caption && (
              <p className="text-xs sm:text-sm md:text-base 2xl:text-lg font-medium wrap-break-word">
                {current.caption}
              </p>
            )}
            {current.metaData && (
              <p className="text-[10px] sm:text-xs md:text-sm 2xl:text-base text-white/50 mt-0.5 whitespace-pre-wrap wrap-break-word line-clamp-4">
                {current.metaData}
              </p>
            )}
          </div>
        )}
      </div>

      <div
        className="absolute bottom-3 sm:bottom-4 flex items-center gap-3 sm:gap-4 text-white"
        onClick={(e) => e.stopPropagation()}>
        <Button
          variant="icon"
          className="text-lg sm:text-xl md:text-2xl leading-none hover:text-gray-300 transition-colors p-1.5 sm:p-2"
          onClick={onPrev}>
          <FaChevronLeft />
        </Button>

        <span className="text-xs sm:text-sm md:text-base opacity-70">
          {selectedIndex + 1} / {images.length}
        </span>

        <Button
          variant="icon"
          className="text-lg sm:text-xl md:text-2xl leading-none hover:text-gray-300 transition-colors p-1.5 sm:p-2"
          onClick={onNext}>
          <FaChevronRight />
        </Button>
      </div>
    </div>
  );
}
