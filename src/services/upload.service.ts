import { getToken } from "@clerk/react";
import type { BaseResponse } from "../types/BaseResponse";

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export interface UploadSignature {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
}

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export async function getUploadSignature() {
  const sessionToken = await getToken();

  const res: Response = await fetch(`${BASE_URL}/uploads/sign`, {
    method: "POST",
    headers: { Authorization: `Bearer ${sessionToken}` },
  });

  if (!res.ok) {
    throw new Error("Failed to get upload signature");
  }

  const json: BaseResponse<UploadSignature> = await res.json();
  return json.data;
}

export async function uploadImage(file: File) {
  const sig = await getUploadSignature();

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", sig.apiKey);
  body.append("timestamp", String(sig.timestamp));
  body.append("signature", sig.signature);
  body.append("folder", sig.folder);

  const res: Response = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: "POST",
    body,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error?.message ?? "Failed to upload image");
  }

  const json = await res.json();

  const uploaded: UploadedImage = {
    url: json.secure_url,
    publicId: json.public_id,
    width: json.width,
    height: json.height,
  };

  return uploaded;
}
