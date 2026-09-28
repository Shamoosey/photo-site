export interface UploadImagePayload {
  albumId: string;
  imageBase64: string;
  caption: string;
  metaData: string;
  sortOrder: number;
}
