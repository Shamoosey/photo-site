import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import * as AlbumService from "../services/album.service";

export function useAlbumImages(albumId: string | undefined) {
  const {
    data: albumImages,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["albumImages", albumId],
    queryFn: () => AlbumService.getAlbumImages(albumId!),
    enabled: !!albumId,
  });

  const sortedImages = useMemo(() => [...(albumImages ?? [])].sort((a, b) => a.sortOrder - b.sortOrder), [albumImages]);

  return { isLoading, error, albumImages, sortedImages };
}
