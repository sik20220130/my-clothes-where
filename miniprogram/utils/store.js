// ============================================
// 数据仓库（本地存储版）
// ============================================
// 目前所有数据保存在 wx.storage 中，便于 Demo 直接运行。
// 接入微信云开发时，只需要把 load/save 内部的实现替换为
// wx.cloud.database() 的查询与更新，页面调用方式保持不变。
//
// 示例（云开发）：
//   const db = wx.cloud.database();
//   const res = await db.collection('clothes').get();
// ============================================

const { clothes: defaultClothes } = require('../data/clothes');
const { wardrobes: defaultWardrobes } = require('../data/wardrobes');

const STORAGE_KEY = 'magic_wardrobe_data_v2';

function load() {
  try {
    const cached = wx.getStorageSync(STORAGE_KEY);
    if (cached && Array.isArray(cached.items) && Array.isArray(cached.wardrobes)) {
      return {
        items: cached.items,
        wardrobes: cached.wardrobes,
        looks: Array.isArray(cached.looks) ? cached.looks : []
      };
    }
  } catch (error) {
    console.error('[Wardrobe] 读取本地数据失败:', error);
  }
  return null;
}

function save(data) {
  try {
    wx.setStorageSync(STORAGE_KEY, {
      items: data.items,
      wardrobes: data.wardrobes,
      looks: data.looks
    });
  } catch (error) {
    console.error('[Wardrobe] 保存本地数据失败:', error);
  }
}

// 首次启动写入演示数据
function ensureSeeded() {
  if (!load()) {
    save({
      items: defaultClothes,
      wardrobes: defaultWardrobes,
      looks: []
    });
  }
}

function getData() {
  return (
    load() || {
      items: defaultClothes,
      wardrobes: defaultWardrobes,
      looks: []
    }
  );
}

function getState() {
  return getData();
}

// 喜欢的单品优先展示，其余按加入时间倒序
function getSortedItems() {
  return getData().items.slice().sort((a, b) => {
    if (!!a.favorite !== !!b.favorite) {
      return a.favorite ? -1 : 1;
    }
    return String(b.addedAt).localeCompare(String(a.addedAt));
  });
}

function addItem(item) {
  const data = getData();
  data.items = [item].concat(data.items);
  save(data);
}

function updateItem(item) {
  const data = getData();
  data.items = data.items.map((current) => (current.id === item.id ? item : current));
  save(data);
}

function removeItem(id) {
  const data = getData();
  data.items = data.items.filter((item) => item.id !== id);
  save(data);
}

// 切换「喜欢」状态
function toggleFavorite(id) {
  const data = getData();
  let nextValue = false;
  data.items = data.items.map((item) => {
    if (item.id !== id) return item;
    nextValue = !item.favorite;
    return Object.assign({}, item, { favorite: nextValue });
  });
  save(data);
  return nextValue;
}

function moveItem(itemId, wardrobeId) {
  const data = getData();
  data.items = data.items.map((item) =>
    item.id === itemId ? Object.assign({}, item, { wardrobeId }) : item
  );
  save(data);
}

function addCabinet(cabinet) {
  const data = getData();
  data.wardrobes = data.wardrobes.concat([cabinet]);
  save(data);
}

function toggleCabinetShare(id) {
  const data = getData();
  data.wardrobes = data.wardrobes.map((cabinet) =>
    cabinet.id === id ? Object.assign({}, cabinet, { isShared: !cabinet.isShared }) : cabinet
  );
  save(data);
}

function addLook(look) {
  const data = getData();
  data.looks = [look].concat(data.looks);
  save(data);
}

function removeLook(id) {
  const data = getData();
  data.looks = data.looks.filter((look) => look.id !== id);
  save(data);
}

module.exports = {
  ensureSeeded,
  getState,
  getSortedItems,
  addItem,
  updateItem,
  removeItem,
  toggleFavorite,
  moveItem,
  addCabinet,
  toggleCabinetShare,
  addLook,
  removeLook
};
