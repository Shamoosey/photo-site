import { useState } from "react";

interface ResizeOptions {
  quality?: number;
  outputType?: string;
}

export function useImageResize() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resizeImage = async (file: File, options: ResizeOptions = {}): Promise<File> => {
    const { quality = 0.85, outputType = "image/jpeg" } = options;

    setLoading(true);
    setError(null);

    try {
      const resizedFile = await new Promise<File>((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);

        image.onload = () => {
          try {
            const canvas = document.createElement("canvas");

            // Preserve original dimensions.
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            const context = canvas.getContext("2d");

            if (!context) {
              throw new Error("Could not create Canvas context");
            }

            context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);

            canvas.toBlob(
              (blob) => {
                URL.revokeObjectURL(objectUrl);

                if (!blob) {
                  reject(new Error("Could not resize image"));
                  return;
                }

                const extension = outputType === "image/webp" ? "webp" : outputType === "image/png" ? "png" : "jpg";

                const fileName = file.name.replace(/\.[^/.]+$/, `.${extension}`);

                resolve(
                  new File([blob], fileName, {
                    type: outputType,
                    lastModified: Date.now(),
                  }),
                );
              },
              outputType,
              quality,
            );
          } catch (err) {
            URL.revokeObjectURL(objectUrl);
            reject(err);
          }
        };

        image.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Could not load image"));
        };

        image.src = objectUrl;
      });

      return resizedFile;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resize image";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    resizeImage,
    loading,
    error,
  };
}
