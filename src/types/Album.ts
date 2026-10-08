export interface Album {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  defaultAlbum: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
