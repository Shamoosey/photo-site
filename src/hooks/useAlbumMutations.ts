import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as AlbumService from "../services/album.service";
import type { EditAlbum } from "../types/EditAlbum";

export function useUpdateAlbum(albumId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditAlbum) => AlbumService.editAlbum(albumId, data),
    // Returning the promise keeps the mutation pending until the refetch finishes,
    // so anything that runs after success (like navigating away) sees fresh data.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["albums"] }),
        queryClient.invalidateQueries({ queryKey: ["album", albumId] }),
      ]),
  });
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (albumId: string) => AlbumService.deleteAlbum(albumId),
    onSuccess: (_data, albumId) => {
      queryClient.removeQueries({ queryKey: ["album", albumId] });
      return queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
  });
}
