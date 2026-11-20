import type { ClothingCategory, OutfitScene } from '@/types/wardrobe';

export const CATEGORY_LIST: Array<{ key: ClothingCategory | 'all'; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'top', label: '上衣' },
  { key: 'bottom', label: '裤装' },
  { key: 'dress', label: '裙装' },
  { key: 'outer', label: '外套' },
  { key: 'shoes', label: '鞋履' },
  { key: 'bag', label: '包袋' },
  { key: 'accessory', label: '配饰' }
];

export const CATEGORY_META: Record<ClothingCategory, { label: string; emoji: string }> = {
  top: { label: '上衣', emoji: '👕' },
  bottom: { label: '裤装', emoji: '👖' },
  dress: { label: '裙装', emoji: '👗' },
  outer: { label: '外套', emoji: '🧥' },
  shoes: { label: '鞋履', emoji: '👟' },
  bag: { label: '包袋', emoji: '👜' },
  accessory: { label: '配饰', emoji: '💍' }
};

export const SCENE_META: Record<OutfitScene, { label: string; emoji: string }> = {
  work: { label: '通勤', emoji: '💼' },
  date: { label: '约会', emoji: '💕' },
  casual: { label: '休闲', emoji: '☕' },
  travel: { label: '度假', emoji: '🏖️' },
  sport: { label: '运动', emoji: '🏃' }
};

export const SCENE_LIST: Array<{ key: OutfitScene | 'all'; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'work', label: '通勤' },
  { key: 'date', label: '约会' },
  { key: 'casual', label: '休闲' },
  { key: 'travel', label: '度假' },
  { key: 'sport', label: '运动' }
];

export const SEASON_LIST = ['春', '夏', '秋', '冬'];

export const COLOR_OPTIONS: Array<{ name: string; hex: string }> = [
  { name: '奶油白', hex: '#f5f1e8' },
  { name: '魔法黑', hex: '#2b2440' },
  { name: '雾霾蓝', hex: '#8fa9c9' },
  { name: '樱花粉', hex: '#f4a7b9' },
  { name: '燕麦色', hex: '#d9c8a9' },
  { name: '牛油果绿', hex: '#9db68c' }
];
