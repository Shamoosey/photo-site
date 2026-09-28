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

  return { isLoading, error, albumImages, refetch };
}
