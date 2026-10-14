import { getToken } from "@clerk/react";
import type { BaseResponse } from "../types/BaseResponse";

export interface UploadedImage {
  url: string;
  publicId: string; // now the Spaces object key
  width: number;
  height: number;
}

export interface UploadSignature {
  uploadUrl: string;
  key: string;
  url: string;
  headers: Record<string, string>;
}

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export async function getUploadSignature(file: File) {
  const sessionToken = await getToken();

  const res: Response = await fetch(`${BASE_URL}/uploads/sign`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contentType: file.type, size: file.size }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message ?? "Failed to get upload signature");
  }

  const json: BaseResponse<UploadSignature> = await res.json();
  return json.data;
}

async function getImageDimensions(file: File) {
  const bitmap = await createImageBitmap(file);
  const dimensions = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return dimensions;
}

export async function uploadImage(file: File) {
  const [sig, dimensions] = await Promise.all([getUploadSignature(file), getImageDimensions(file)]);

  // The headers returned by the API are part of the signature,
  // so they must be sent exactly as given.
  const res: Response = await fetch(sig.uploadUrl, {
    method: "PUT",
    headers: sig.headers,
    body: file,
  });

  if (!res.ok) {
    throw new Error("Failed to upload image");
  }

  const uploaded: UploadedImage = {
    url: sig.url,
    publicId: sig.key,
    width: dimensions.width,
    height: dimensions.height,
  };

  return uploaded;
}
