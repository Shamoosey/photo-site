import { useQuery } from "@tanstack/react-query";
import * as AlbumService from "../services/album.service";

export function useAlbum(albumId: string) {
  return useQuery({
    queryKey: ["album", albumId],
    queryFn: async () => {
      return AlbumService.getAlbumById(albumId);
    },
  });
}
