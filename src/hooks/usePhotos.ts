import { useCallback, useEffect, useState } from "react";
import * as PhotoService from "../services/photo.service";
import type { Image } from "../types/Image";

export function usePhotos(dependencies?: unknown[]) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<Image[]>([]);

  const fetchPhotoCollection = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await PhotoService.getAllPhotos();
      setImages(data);
    } catch (error) {
      setError("Unable to fetch photo collection due to unexpected error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotoCollection();
  }, [dependencies]);

  const sortedImages = images.sort((a, b) => {
    if (a.sortOrder > b.sortOrder) return 1;
    else return -1;
  });

  return {
    isLoading,
    error,
    images,
    sortedImages,
    refetch: fetchPhotoCollection,
  };
}
