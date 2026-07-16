import type { BaseResponse } from "../types/BaseResponse";
import type { ImageCollection } from "../types/ImageCollection";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export async function getPhotosByCollectionName(name: string) {
  console.log(name);

  const res: Response = await fetch(`${BASE_URL}/photo-collection/${name}`);
  console.log(res);

  if (!res.ok) {
    throw new Error("Failed to fetch photo collection");
  }

  const json: BaseResponse<ImageCollection> = await res.json();
  return json.data;
}
