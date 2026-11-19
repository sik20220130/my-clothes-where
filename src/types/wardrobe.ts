export type ClothingCategory = 'top' | 'bottom' | 'dress' | 'outer' | 'shoes' | 'bag' | 'accessory';

export type OutfitScene = 'work' | 'date' | 'casual' | 'travel' | 'sport';

export interface WardrobeCabinet {
  id: string;
  name: string;
  cover: string;
  location: string;
  isShared: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  colorHex: string;
  seasons: string[];
  image: string;
  brand: string;
  wearCount: number;
  addedAt: string;
  wardrobeId: string;
  note?: string;
}

export interface OutfitItem {
  id: string;
  title: string;
  scene: OutfitScene;
  cover: string;
  tags: string[];
  itemNames: string[];
  likes: number;
  author: string;
  description: string;
}

export interface CustomLook {
  id: string;
  name: string;
  itemIds: string[];
  createdAt: string;
}
