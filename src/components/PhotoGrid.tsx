import { useState } from "react";

import P1 from "../assets/photo (1).jpg";
import P2 from "../assets/photo (2).jpg";
import P3 from "../assets/photo (3).jpg";
import P4 from "../assets/photo (4).jpg";
import P5 from "../assets/photo (5).jpg";
import P6 from "../assets/photo (6).jpg";
import P7 from "../assets/photo (7).jpg";
import P8 from "../assets/photo (8).jpg";
import P9 from "../assets/photo (9).jpg";
import P10 from "../assets/photo (10).jpg";
import P11 from "../assets/photo (11).jpg";
import P12 from "../assets/photo (12).jpg";
import type { LightboxImage } from "./Lightbox";
import Lightbox from "./Lightbox";

const INITIAL_IMAGES: LightboxImage[] = [
  { src: P1, caption: "Golden hour", meta: "Canon EOS R5 · f/1.8 · 1/1000s · ISO 100" },
  { src: P2 },
  { src: P3, caption: "Downtown reflections" },
  { src: P4 },
  { src: P5, meta: "Shot on iPhone 15 Pro" },
  { src: P6 },
  { src: P7, caption: "Morning fog", meta: "Sony A7IV · f/2.8 · 1/500s · ISO 200" },
  { src: P8 },
  { src: P9, caption: "Street life" },
  { src: P10 },
  { src: P11 },
  { src: P12, caption: "Last light", meta: "Fujifilm X-T5 · f/4 · 1/250s · ISO 400" },
];

export default function PhotoGrid() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  const goNext = () => setSelectedIndex((i) => (i === null ? null : (i + 1) % INITIAL_IMAGES.length));
  const goPrev = () => setSelectedIndex((i) => (i === null ? null : (i - 1 + INITIAL_IMAGES.length) % INITIAL_IMAGES.length));

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1">
        {INITIAL_IMAGES.map((image, i) => (
          <div key={i} className="w-full aspect-square overflow-hidden cursor-pointer" onClick={() => openLightbox(i)}>
            <img src={image.src} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
          </div>
        ))}
      </section>

      <Lightbox images={INITIAL_IMAGES} selectedIndex={selectedIndex} onClose={closeLightbox} onNext={goNext} onPrev={goPrev} />
    </>
  );
}
