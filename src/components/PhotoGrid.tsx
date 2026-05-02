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

const INITIAL_IMAGES = [P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12];

export default function PhotoGrid() {
  const [images] = useState<string[]>(INITIAL_IMAGES);

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1">
      {images.map((src, i) => (
        <div key={i} className="w-full aspect-square overflow-hidden">
          <img src={src} className="w-full h-full object-cover" />
        </div>
      ))}
    </section>
  );
}
