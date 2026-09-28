import * as AlbumService from "../services/album.service";
import type { Album } from "../types/Album";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useAlbums() {
  const queryClient = useQueryClient();

  const {
    data: albums,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      return AlbumService.getAllAlbums();
    },
    initialData: () => {
      const cached = queryClient.getQueryData<Album[]>(["albums"]);
      return cached;
    },
  });

  return {
    isLoading,
    error,
    albums,
  };
}
