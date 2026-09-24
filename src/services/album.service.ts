import { getToken } from "@clerk/react";
import type { BaseResponse } from "../types/BaseResponse";
import type { Album } from "../types/Album";
import type { Image } from "../types/Image";
import type { CreateAlbumPayload } from "../types/CreateAlbumPayload";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export async function getAllAlbums() {
  const res: Response = await fetch(`${BASE_URL}/album`);

  if (!res.ok) {
    throw new Error("Failed to fetch albums");
  }

  const json: BaseResponse<Album[]> = await res.json();
  return json.data;
}

export async function getAlbumById(id: string) {
  const res: Response = await fetch(`${BASE_URL}/album/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch album using id");
  }

  const json: BaseResponse<Album> = await res.json();
  return json.data;
}

export async function createAlbum(payload: CreateAlbumPayload) {
  const sessionToken = await getToken();
  if (!sessionToken) throw new Error("Unauthorized");

  const res: Response = await fetch(`${BASE_URL}/album`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to create album");
  }

  const json: BaseResponse<Album> = await res.json();
  return json.data;
}

export async function editAlbum(albumId: string, payload: { caption: string; metaData: string; sortOrder: number }) {
  const sessionToken = await getToken();
  if (!sessionToken) throw new Error("Unauthorized");

  const res: Response = await fetch(`${BASE_URL}/album/${albumId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to edit album");
  }

  const json: BaseResponse<Album> = await res.json();
  return json.data;
}

export async function deleteAlbum(albumId: string) {
  const sessionToken = await getToken();
  if (!sessionToken) throw new Error("Unauthorized");

  const res: Response = await fetch(`${BASE_URL}/album/${albumId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${sessionToken}` },
  });

  if (!res.ok) {
    throw new Error("Failed to delete album");
  }

  const json: BaseResponse<null> = await res.json();
  return json.data;
}

export async function getAlbumImages(albumId: string) {
  const res: Response = await fetch(`${BASE_URL}/album/${albumId}/images`);

  if (!res.ok) {
    throw new Error("Failed to fetch album images");
  }

  const json: BaseResponse<Image[]> = await res.json();
  return json.data;
}
