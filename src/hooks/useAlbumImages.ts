import { useMemo } from "react";
import * as AlbumService from "../services/album.service";
import type { Image } from "../types/Image";
import type { Album } from "../types/Album";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useAlbumImages(album: Album) {
  const queryClient = useQueryClient();
  const {
    data: albumImages,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["albumImages"],
    queryFn: async () => {
      return AlbumService.getAlbumImages(album.id);
    },
    initialData: () => {
      return queryClient.getQueryData<Image[]>(["albumImages"]);
    },
  });
  const sortedImages = useMemo(() => [...(albumImages ?? [])].sort((a, b) => a.sortOrder - b.sortOrder), [albumImages]);

  return {
    isLoading,
    error,
    albumImages,
    sortedImages,
  };
}
