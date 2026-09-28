import { useMutation } from "@tanstack/react-query";
import { uploadImage, type UploadedImage } from "../services/upload.service";

export function useUploadImage() {
  return useMutation<UploadedImage, Error, File>({
    mutationFn: (file) => uploadImage(file),
  });
}
