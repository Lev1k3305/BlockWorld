export type AlbumOwner = 'alizhan' | 'dilnaz';

export type LayoutType = 'single' | 'grid-2' | 'collage-3' | 'polaroid' | 'hero-text';

export interface Sticker {
  id: string;
  emoji: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  scale?: number;
  rotate?: number;
}

export interface Photo {
  id: string;
  albumId: string;
  dataUrl: string;
  caption?: string;
  date?: string;
  memoryNote?: string;
  order: number;
  createdAt: number;
}

export interface AlbumPage {
  id: string;
  albumId: string;
  pageNumber: number;
  layout: LayoutType;
  photoIds: string[];
  title?: string;
  storyText?: string;
  stickers: Sticker[];
}

export interface Album {
  id: string;
  owner: AlbumOwner;
  title: string;
  description?: string;
  coverPhotoId?: string;
  createdAt: number;
  updatedAt: number;
}
