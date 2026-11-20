import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { clothes as defaultClothes } from '@/data/clothes';
import { wardrobes as defaultWardrobes } from '@/data/wardrobes';
import type { ClothingItem, CustomLook, WardrobeCabinet } from '@/types/wardrobe';

const STORAGE_KEY = 'magic_wardrobe_data_v2';

interface PersistedData {
  items: ClothingItem[];
  wardrobes: WardrobeCabinet[];
  looks: CustomLook[];
}

function loadData(): PersistedData {
  try {
    const cached = Taro.getStorageSync(STORAGE_KEY);
    if (cached && Array.isArray(cached.items) && Array.isArray(cached.wardrobes)) {
      return {
        items: cached.items as ClothingItem[],
        wardrobes: cached.wardrobes as WardrobeCabinet[],
        looks: Array.isArray(cached.looks) ? (cached.looks as CustomLook[]) : []
      };
    }
  } catch (error) {
    console.error('[Wardrobe] 读取本地数据失败:', error);
  }
  return { items: defaultClothes, wardrobes: defaultWardrobes, looks: [] };
}

function persist(data: PersistedData) {
  try {
    Taro.setStorageSync(STORAGE_KEY, {
      items: data.items,
      wardrobes: data.wardrobes,
      looks: data.looks
    });
  } catch (error) {
    console.error('[Wardrobe] 保存本地数据失败:', error);
  }
}

const initial = loadData();

interface WardrobeState extends PersistedData {
  addItem: (item: ClothingItem) => void;
  updateItem: (item: ClothingItem) => void;
  removeItem: (id: string) => void;
  recordWear: (id: string) => void;
  moveItem: (itemId: string, wardrobeId: string) => void;
  addCabinet: (cabinet: WardrobeCabinet) => void;
  toggleCabinetShare: (id: string) => void;
  addLook: (look: CustomLook) => void;
  removeLook: (id: string) => void;
}

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  items: initial.items,
  wardrobes: initial.wardrobes,
  looks: initial.looks,

  addItem: (item) => {
    const next = [item, ...get().items];
    const state = get();
    persist({ items: next, wardrobes: state.wardrobes, looks: state.looks });
    set({ items: next });
    console.info('[Wardrobe] 新增单品:', item.name);
  },

  updateItem: (item) => {
    const next = get().items.map((current) => (current.id === item.id ? item : current));
    const state = get();
    persist({ items: next, wardrobes: state.wardrobes, looks: state.looks });
    set({ items: next });
    console.info('[Wardrobe] 更新单品:', item.name);
  },

  removeItem: (id) => {
    const next = get().items.filter((item) => item.id !== id);
    const state = get();
    persist({ items: next, wardrobes: state.wardrobes, looks: state.looks });
    set({ items: next });
    console.info('[Wardrobe] 删除单品:', id);
  },

  recordWear: (id) => {
    const next = get().items.map((item) =>
      item.id === id ? { ...item, wearCount: item.wearCount + 1 } : item
    );
    const state = get();
    persist({ items: next, wardrobes: state.wardrobes, looks: state.looks });
    set({ items: next });
    console.info('[Wardrobe] 记录穿着:', id);
  },

  moveItem: (itemId, wardrobeId) => {
    const next = get().items.map((item) =>
      item.id === itemId ? { ...item, wardrobeId } : item
    );
    const state = get();
    persist({ items: next, wardrobes: state.wardrobes, looks: state.looks });
    set({ items: next });
    console.info('[Wardrobe] 转移单品:', itemId, '->', wardrobeId);
  },

  addCabinet: (cabinet) => {
    const next = [...get().wardrobes, cabinet];
    const state = get();
    persist({ items: state.items, wardrobes: next, looks: state.looks });
    set({ wardrobes: next });
    console.info('[Wardrobe] 新增衣橱:', cabinet.name);
  },

  toggleCabinetShare: (id) => {
    const next = get().wardrobes.map((cabinet) =>
      cabinet.id === id ? { ...cabinet, isShared: !cabinet.isShared } : cabinet
    );
    const state = get();
    persist({ items: state.items, wardrobes: next, looks: state.looks });
    set({ wardrobes: next });
    console.info('[Wardrobe] 切换衣橱共享状态:', id);
  },

  addLook: (look) => {
    const next = [look, ...get().looks];
    const state = get();
    persist({ items: state.items, wardrobes: state.wardrobes, looks: next });
    set({ looks: next });
    console.info('[Wardrobe] 保存搭配:', look.name);
  },

  removeLook: (id) => {
    const next = get().looks.filter((look) => look.id !== id);
    const state = get();
    persist({ items: state.items, wardrobes: state.wardrobes, looks: next });
    set({ looks: next });
    console.info('[Wardrobe] 删除搭配:', id);
  }
}));
