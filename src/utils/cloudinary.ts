const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;

export function isValidCloudinaryAsset(url: unknown, publicId: unknown): boolean {
  return (
    typeof url === "string" &&
    typeof publicId === "string" &&
    url.startsWith(`https://res.cloudinary.com/${CLOUD_NAME}/`) &&
    publicId.startsWith("albums/") &&
    url.includes(publicId)
  );
}
