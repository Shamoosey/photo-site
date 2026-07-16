import { useCallback, useEffect, useState } from "react";
import type { ImageCollection } from "../types/ImageCollection";
import * as PhotoService from "../services/photo.service";

export function usePhotoCollection(name: string, dependencies?: unknown[]) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoCollection, setPhotoCollection] = useState<ImageCollection | null>(null);

  const fetchPhotoCollection = useCallback(async () => {
    setIsLoading(true);
    const data = await PhotoService.getPhotosByCollectionName(name);
    setPhotoCollection(data);
    try {
    } catch (error) {
      setError("Unable to fetch photo collection due to unexpected error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotoCollection();
  }, [dependencies]);

  return {
    isLoading,
    error,
    photoCollection,
  };
}
