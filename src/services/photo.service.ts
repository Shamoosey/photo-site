import { getToken } from "@clerk/react";
import type { BaseResponse } from "../types/BaseResponse";
import type { Image } from "../types/Image";
import type { UploadImagePayload } from "../types/UploadImagePayload";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export async function getAllPhotos() {
  const res: Response = await fetch(`${BASE_URL}/photo`);

  if (!res.ok) {
    throw new Error("Failed to fetch images");
  }

  const json: BaseResponse<Image[]> = await res.json();
  return json.data;
}

export async function uploadImage(payload: UploadImagePayload) {
  const sessionToken = await getToken();
  if (!sessionToken) throw new Error("Unauthorized");

  const res: Response = await fetch(`${BASE_URL}/photo`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to upload image");
  }

  const json: BaseResponse<Image> = await res.json();
  return json.data;
}

export async function editImageData(imageId: string, payload: { caption: string; metaData: string }) {
  const sessionToken = await getToken();
  if (!sessionToken) throw new Error("Unauthorized");

  const res: Response = await fetch(`${BASE_URL}/photo/${imageId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to edit image data");
  }

  const json: BaseResponse<Image> = await res.json();
  return json.data;
}

export async function deleteImage(imageId: string) {
  const sessionToken = await getToken();
  if (!sessionToken) throw new Error("Unauthorized");

  const res: Response = await fetch(`${BASE_URL}/photo/${imageId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${sessionToken}` },
  });

  if (!res.ok) {
    throw new Error("Failed to delete image");
  }
}
