import type { Image } from "./Image";

export interface ImageCollection {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  images: Image[];
}
