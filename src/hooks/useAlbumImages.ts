import { useQuery } from "@tanstack/react-query";
import * as AlbumService from "../services/album.service";

export function useAlbumImages(albumId: string | undefined) {
  const {
    data: albumImages,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["albumImages", albumId],
    queryFn: () => AlbumService.getAlbumImages(albumId!),
    enabled: !!albumId,
  });

  const sortedImages = albumImages?.sort((a, b) => a.sortOrder - b.sortOrder);

  return { isLoading, error, albumImages, sortedImages, refetch };
}
