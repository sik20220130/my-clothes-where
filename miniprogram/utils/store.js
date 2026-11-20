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
const { familyMembers: defaultMembers } = require('../data/family');

const STORAGE_KEY = 'magic_wardrobe_data_v2';

function load() {
  try {
    const cached = wx.getStorageSync(STORAGE_KEY);
    if (cached && Array.isArray(cached.items) && Array.isArray(cached.wardrobes)) {
      return {
        items: cached.items,
        wardrobes: cached.wardrobes,
        looks: Array.isArray(cached.looks) ? cached.looks : [],
        lookFavorites: Array.isArray(cached.lookFavorites) ? cached.lookFavorites : [],
        members: Array.isArray(cached.members) ? cached.members : defaultMembers
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
      looks: data.looks,
      lookFavorites: data.lookFavorites,
      members: data.members
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
      looks: [],
      lookFavorites: [],
      members: defaultMembers
    });
  }
}

function getData() {
  return (
    load() || {
      items: defaultClothes,
      wardrobes: defaultWardrobes,
      looks: [],
      lookFavorites: [],
      members: defaultMembers
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

function getCabinet(id) {
  return getData().wardrobes.find((cabinet) => cabinet.id === id) || null;
}

function addCabinet(cabinet) {
  const data = getData();
  data.wardrobes = data.wardrobes.concat([cabinet]);
  save(data);
}

function updateCabinet(cabinet) {
  const data = getData();
  data.wardrobes = data.wardrobes.map((current) =>
    current.id === cabinet.id ? cabinet : current
  );
  save(data);
}

// 删除衣橱时，把其中的单品转移到第一个剩余衣橱；仅剩一个衣橱时不允许删除
function removeCabinet(id) {
  const data = getData();
  const cabinet = data.wardrobes.find((current) => current.id === id);
  if (!cabinet) {
    return { ok: false, reason: 'notfound' };
  }
  const remaining = data.wardrobes.filter((current) => current.id !== id);
  if (remaining.length === 0) {
    return { ok: false, reason: 'last' };
  }
  const target = remaining[0];
  const moved = data.items.filter((item) => item.wardrobeId === id).length;
  data.wardrobes = remaining;
  data.items = data.items.map((item) =>
    item.wardrobeId === id ? Object.assign({}, item, { wardrobeId: target.id }) : item
  );
  save(data);
  return { ok: true, moved, targetName: target.name };
}

function toggleCabinetShare(id) {
  const data = getData();
  data.wardrobes = data.wardrobes.map((cabinet) =>
    cabinet.id === id ? Object.assign({}, cabinet, { isShared: !cabinet.isShared }) : cabinet
  );
  save(data);
}

// 把拍照/相册的临时图片保存到小程序本地目录，避免重启后失效
function saveImage(tempFilePath) {
  if (!tempFilePath) {
    return Promise.resolve('');
  }
  if (
    tempFilePath.indexOf('https://') === 0 ||
    tempFilePath.indexOf(wx.env.USER_DATA_PATH) === 0
  ) {
    return Promise.resolve(tempFilePath);
  }
  return new Promise((resolve) => {
    const fs = wx.getFileSystemManager();
    const matched = tempFilePath.match(/\.[a-zA-Z0-9]+$/);
    const ext = matched ? matched[0] : '.jpg';
    const filePath = `${wx.env.USER_DATA_PATH}/mw_${Date.now()}${ext}`;
    fs.saveFile({
      tempFilePath,
      filePath,
      success(res) {
        resolve(res.savedFilePath || filePath);
      },
      fail(error) {
        console.error('[Wardrobe] 图片保存失败:', error);
        resolve(tempFilePath);
      }
    });
  });
}

function getMembers() {
  return getData().members;
}

function addMember(member) {
  const data = getData();
  data.members = data.members.concat([member]);
  save(data);
}

function removeMember(id) {
  const data = getData();
  if (data.members.length <= 1) {
    return false;
  }
  data.members = data.members.filter((member) => member.id !== id);
  save(data);
  return true;
}

function getLook(id) {
  return getData().looks.find((look) => look.id === id) || null;
}

function isLookFavorite(id) {
  return getData().lookFavorites.indexOf(id) >= 0;
}

function toggleLookFavorite(id) {
  const data = getData();
  const favorites = data.lookFavorites || [];
  const exists = favorites.indexOf(id) >= 0;
  data.lookFavorites = exists
    ? favorites.filter((lookId) => lookId !== id)
    : favorites.concat([id]);
  save(data);
  return !exists;
}

function addLook(look) {
  const data = getData();
  data.looks = [look].concat(data.looks);
  save(data);
}

function removeLook(id) {
  const data = getData();
  data.looks = data.looks.filter((look) => look.id !== id);
  data.lookFavorites = (data.lookFavorites || []).filter((lookId) => lookId !== id);
  save(data);
}

// 恢复内置示例数据
function resetData() {
  save({
    items: defaultClothes,
    wardrobes: defaultWardrobes,
    looks: [],
    lookFavorites: [],
    members: defaultMembers
  });
}

// 清空单品、搭配与收藏，保留衣橱和家庭成员
function clearItems() {
  const data = getData();
  data.items = [];
  data.looks = [];
  data.lookFavorites = [];
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
  getCabinet,
  addCabinet,
  updateCabinet,
  removeCabinet,
  toggleCabinetShare,
  saveImage,
  getMembers,
  addMember,
  removeMember,
  getLook,
  isLookFavorite,
  toggleLookFavorite,
  addLook,
  removeLook,
  resetData,
  clearItems
};
