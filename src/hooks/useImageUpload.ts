import { useRef, useState } from "react";
import { uploadImage } from "../services/photo.service";

export function useImageUpload(onSuccess?: () => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [metaData, setMetaData] = useState("");
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const setCaptionValue = (value: string) => {
    setCaption(value);
    setErrors((prev) => {
      const next = new Map(prev);
      next.delete("caption");
      return next;
    });
  };

  const setMetaDataValue = (value: string) => {
    setMetaData(value);
    setErrors((prev) => {
      const next = new Map(prev);
      next.delete("metaData");
      return next;
    });
  };

  const MAX_OUTPUT_BYTES = 10 * 1024 * 1024; //max 10mb

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Canvas context unavailable"));
            return;
          }

          let width = img.width;
          let height = img.height;
          let quality = 0.85;
          const maxDimension = 1200;

          const scaleDown = () => {
            if (width > height) {
              if (width > maxDimension) {
                height *= maxDimension / width;
                width = maxDimension;
              }
            } else {
              if (height > maxDimension) {
                width *= maxDimension / height;
                height = maxDimension;
              }
            }
          };

          scaleDown();

          const render = (): string => {
            canvas.width = width;
            canvas.height = height;
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            return canvas.toDataURL("image/jpeg", quality);
          };

          const getByteSize = (dataUrl: string) => {
            const base64Length = dataUrl.split(",")[1]?.length || 0;
            return base64Length * 0.75; // base64 -> raw byte approximation
          };

          let result = render();
          let attempts = 0;
          const maxAttempts = 10;

          while (getByteSize(result) > MAX_OUTPUT_BYTES && attempts < maxAttempts) {
            if (quality > 0.4) {
              quality -= 0.1;
            } else {
              width *= 0.8;
              height *= 0.8;
            }
            result = render();
            attempts++;
          }

          if (getByteSize(result) > MAX_OUTPUT_BYTES) {
            reject(new Error("Unable to compress image below the required size"));
            return;
          }

          resolve(result);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (file: File | null) => {
    setErrors((prev) => {
      const next = new Map(prev);
      next.delete("image");
      return next;
    });

    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrors((prev) => new Map(prev).set("image", "Image must be less than 25MB"));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => new Map(prev).set("image", "Only image files are allowed"));
      return;
    }

    setImageFile(file);

    try {
      const resizedBase64 = await resizeImage(file);
      setImagePreview(resizedBase64);
    } catch (error) {
      setErrors((prev) => new Map(prev).set("image", "Unable to process this image, please try a different one"));
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const reset = () => {
    setImageFile(null);
    setImagePreview(null);
    setCaption("");
    setMetaData("");
    setErrors(new Map());
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submit = async () => {
    const newErrors = new Map<string, string>();

    if (!imageFile) {
      newErrors.set("image", "Please select an image");
    }
    if (!caption.trim()) {
      newErrors.set("caption", "Please enter a caption");
    }
    if (!metaData.trim()) {
      newErrors.set("metaData", "Please enter metadata");
    }

    if (newErrors.size > 0) {
      setErrors(newErrors);
      return;
    }
    await uploadImage({
      imageBase64: imagePreview as string,
      caption,
      metaData,
    });

    reset();
    onSuccess?.();
  };

  return {
    fileInputRef,
    imageFile,
    imagePreview,
    caption,
    metaData,
    errors,
    setCaptionValue,
    setMetaDataValue,
    handleImageChange,
    submit,
    reset,
  };
}
