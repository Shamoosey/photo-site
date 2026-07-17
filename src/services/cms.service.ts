import type { BaseResponse } from "../types/BaseResponse";
import type { Image } from "../types/Image";
import type { ImageCollection } from "../types/ImageCollection";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API request failed: ${res.status} ${res.statusText} ${body}`);
  }

  const json: BaseResponse<T> = await res.json();
  return json.data;
}

export interface CreatePhotoCollectionPayload {
  name: string;
  description: string;
}

export interface CreateImagePayload {
  imageBase64: string;
  caption?: string;
  metaData?: string;
}

export async function getPhotoCollections(): Promise<ImageCollection[]> {
  const res: Response = await fetch(`${BASE_URL}/photo-collection`);
  return handleResponse<ImageCollection[]>(res);
}

export async function createPhotoCollection(payload: CreatePhotoCollectionPayload): Promise<ImageCollection> {
  const res: Response = await fetch(`${BASE_URL}/photo-collection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      description: payload.description,
      photoIds: [],
    }),
  });

  return handleResponse<ImageCollection>(res);
}

export async function createImage(collectionId: string, payload: CreateImagePayload): Promise<Image> {
  // First, create the image
  const createImageRes: Response = await fetch(`${BASE_URL}/photo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: payload.imageBase64,
      caption: payload.caption,
      metaData: payload.metaData,
    }),
  });

  const image = await handleResponse<Image>(createImageRes);

  // Then, update the collection to include this image
  await updateCollectionWithImage(collectionId, image.id);

  return image;
}

async function updateCollectionWithImage(collectionId: string, imageId: string): Promise<void> {
  // Fetch the current collection to get its images
  const res: Response = await fetch(`${BASE_URL}/photo-collection`);
  const collections = await handleResponse<ImageCollection[]>(res);
  const collection = collections.find((c) => c.id === collectionId);

  if (!collection) {
    throw new Error("Collection not found");
  }

  // Update the collection with the new image
  const updateRes: Response = await fetch(`${BASE_URL}/photo-collection`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      collectionId,
      name: collection.name,
      description: collection.description,
      photoIds: [...collection.images.map((img) => img.id), imageId],
    }),
  });

  if (!updateRes.ok) {
    throw new Error("Failed to update collection with new image");
  }
}

export async function deleteImage(collectionId: string, imageId: string): Promise<void> {
  // Fetch the current collection to update it
  const res: Response = await fetch(`${BASE_URL}/photo-collection`);
  const collections = await handleResponse<ImageCollection[]>(res);
  const collection = collections.find((c) => c.id === collectionId);

  if (!collection) {
    throw new Error("Collection not found");
  }

  // Update collection to remove the image
  const updateRes: Response = await fetch(`${BASE_URL}/photo-collection`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      collectionId,
      name: collection.name,
      description: collection.description,
      photoIds: collection.images.filter((img) => img.id !== imageId).map((img) => img.id),
    }),
  });

  if (!updateRes.ok) {
    throw new Error("Failed to remove image from collection");
  }

  // Delete the image itself
  const deleteRes: Response = await fetch(`${BASE_URL}/photo`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageId }),
  });

  if (!deleteRes.ok) {
    throw new Error("Failed to delete photo");
  }
}

export async function deletePhotoCollection(collectionId: string): Promise<void> {
  const res: Response = await fetch(`${BASE_URL}/photo-collection`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collectionId }),
  });

  if (!res.ok) {
    throw new Error("Failed to delete photo collection");
  }
}

export async function editPhotoCollection(
  collectionId: string,
  name: string,
  description: string
): Promise<ImageCollection> {
  const res: Response = await fetch(`${BASE_URL}/photo-collection`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      collectionId,
      name,
      description,
    }),
  });

  return handleResponse<ImageCollection>(res);
}

export async function editPhoto(
  photoId: string,
  caption: string,
  metaData: string
): Promise<Image> {
  const res: Response = await fetch(`${BASE_URL}/photo`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      photoId,
      caption,
      metaData,
    }),
  });

  return handleResponse<Image>(res);
}
