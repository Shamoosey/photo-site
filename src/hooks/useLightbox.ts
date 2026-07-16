import { useState } from "react";
import type { Image } from "../types/Image";

export default function useLightbox(images: Image[]) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const goNext = () => setSelectedIndex((i) => (i === null ? null : (i + 1) % images.length));

  const goPrev = () => setSelectedIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));

  return {
    selectedIndex,
    openLightbox,
    closeLightbox,
    goNext,
    goPrev,
  };
}
