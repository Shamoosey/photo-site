import type { BaseResponse } from "../types/BaseResponse";
import type { Image } from "../types/Image";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export async function getAllPhotos() {
  const res: Response = await fetch(`${BASE_URL}/photo`);
  console.log(res);

  if (!res.ok) {
    throw new Error("Failed to fetch images");
  }

  const json: BaseResponse<Image[]> = await res.json();
  return json.data;
}

interface UploadImagePayload {
  imageBase64: string;
  caption: string;
  metaData: string;
}

export async function uploadImage(payload: UploadImagePayload) {
  const res: Response = await fetch(`${BASE_URL}/photo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to upload image");
  }

  const json: BaseResponse<Image> = await res.json();
  return json.data;
}

export async function deleteImage(imageId: string) {
  const res: Response = await fetch(`${BASE_URL}/photo/${imageId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete image");
  }
}
