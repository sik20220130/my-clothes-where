// ============================================
// 数据仓库（本地缓存 + 微信云开发同步）
// ============================================
// 页面统一通过同步方法读取内存缓存，保证渲染逻辑不变；
// 数据变更时会同时写入本地缓存并异步同步到云数据库。
// 云环境：cloud1-d5ghmekgecd229e76
// 云数据库集合：wardrobe_data（每个用户一条，仅创建者可读写）
// 数据契约：Requirements_Decomposer/.../02-data-contract.md
// ============================================

const { clothes: sampleClothes } = require('../data/clothes');
const { wardrobes: sampleWardrobes } = require('../data/wardrobes');

const CLOUD_ENV = 'cloud1-d5ghmekgecd229e76';
const COLLECTION = 'wardrobe_data';
const STORAGE_KEY = 'magic_wardrobe_data_v2';
const UPLOAD_CONCURRENCY = 5;

let cache = null;
let database = null;
let docId = '';
let cloudState = 'idle'; // idle | ready | disabled
let initPromise = null;
let writeChain = Promise.resolve();

// 图片上传队列（并发上限 5）
let uploadActive = 0;
const uploadQueue = [];

function createDefaultState() {
  return {
    items: [],
    wardrobes: [],
    looks: [],
    lookFavorites: [],
    members: [],
    onboardingDone: false,
    updatedAt: 0
  };
}

function normalizeItem(raw) {
  const item = Object.assign({}, raw);
  // 旧数据没有 updatedAt 时，用入库时间兜底
  item.updatedAt = Number(item.updatedAt) || Date.parse(item.addedAt) || 0;
  item.syncState = item.syncState === 'pending' ? 'pending' : 'synced';
  return item;
}

function normalizeRecord(raw) {
  const record = Object.assign({}, raw);
  record.updatedAt = Number(record.updatedAt) || 0;
  return record;
}

// 字段缺失或类型异常一律回落空数组，不再回落示例数据
function normalizeState(raw) {
  const source = raw || {};
  return {
    items: Array.isArray(source.items) ? source.items.map(normalizeItem) : [],
    wardrobes: Array.isArray(source.wardrobes) ? source.wardrobes.map(normalizeRecord) : [],
    looks: Array.isArray(source.looks) ? source.looks.map(normalizeRecord) : [],
    lookFavorites: Array.isArray(source.lookFavorites) ? source.lookFavorites : [],
    members: Array.isArray(source.members) ? source.members.map(normalizeRecord) : [],
    onboardingDone: source.onboardingDone === true,
    updatedAt: Number(source.updatedAt) || 0
  };
}

function loadLocal() {
  try {
    const cached = wx.getStorageSync(STORAGE_KEY);
    if (cached) {
      return normalizeState(cached);
    }
  } catch (error) {
    console.error('[Wardrobe] 读取本地缓存失败:', error);
  }
  return null;
}

function saveLocal() {
  try {
    wx.setStorageSync(STORAGE_KEY, {
      items: cache.items,
      wardrobes: cache.wardrobes,
      looks: cache.looks,
      lookFavorites: cache.lookFavorites,
      members: cache.members,
      onboardingDone: cache.onboardingDone === true,
      updatedAt: cache.updatedAt
    });
  } catch (error) {
    console.error('[Wardrobe] 保存本地缓存失败:', error);
  }
}

function getData() {
  if (!cache) {
    cache = loadLocal() || createDefaultState();
    saveLocal();
  }
  return cache;
}

function hasData(state) {
  return !!(
    state &&
    ((state.items && state.items.length) ||
      (state.wardrobes && state.wardrobes.length) ||
      (state.looks && state.looks.length))
  );
}

function isLocalImagePath(path) {
  if (!path) return false;
  return path.indexOf('cloud://') !== 0 && path.indexOf('http') !== 0;
}

// 把整份数据写入云数据库；docId 为空时新建记录
function pushCloud() {
  if (cloudState !== 'ready' || !database || !cache) {
    return Promise.resolve(false);
  }
  if (!cache.updatedAt) {
    cache.updatedAt = Date.now();
  }
  const payload = {
    items: cache.items,
    wardrobes: cache.wardrobes,
    looks: cache.looks,
    lookFavorites: cache.lookFavorites,
    members: cache.members,
    onboardingDone: cache.onboardingDone === true,
    updatedAt: cache.updatedAt
  };
  if (docId) {
    return database
      .collection(COLLECTION)
      .doc(docId)
      .set({ data: payload })
      .then(() => true)
      .catch((error) => {
        console.error('[Wardrobe] 云端更新失败:', error);
        return false;
      });
  }
  return database
    .collection(COLLECTION)
    .add({ data: payload })
    .then((res) => {
      docId = res._id;
      return true;
    })
    .catch((error) => {
      console.error('[Wardrobe] 云端写入失败:', error);
      return false;
    });
}

// 云端同步成功：全部置为已同步（只写本地，避免推送循环）
function markAllSynced() {
  let changed = false;
  (cache.items || []).forEach((item) => {
    if (item.syncState !== 'synced') {
      item.syncState = 'synced';
      changed = true;
    }
  });
  if (changed) {
    saveLocal();
  }
}

// 云端同步失败：仍依赖本地图片的单品标记为待同步
function markLocalImagesPending() {
  let changed = false;
  (cache.items || []).forEach((item) => {
    if (isLocalImagePath(item.image) && item.syncState !== 'pending') {
      item.syncState = 'pending';
      changed = true;
    }
  });
  if (changed) {
    saveLocal();
  }
}

// 本地缓存立即生效，云端按顺序串行同步，避免并发覆盖
function persist() {
  const data = getData();
  data.updatedAt = Date.now();
  saveLocal();
  writeChain = writeChain
    .then(() => initPromise || init())
    .then(() => pushCloud())
    .then((ok) => {
      if (ok) {
        markAllSynced();
      } else {
        markLocalImagesPending();
      }
      return ok;
    })
    .catch((error) => {
      console.error('[Wardrobe] 数据同步异常:', error);
      markLocalImagesPending();
      return false;
    });
  return writeChain;
}

// 按 id 合并两组数据：同 id 取 updatedAt 较新的一条
function mergeById(localArr, remoteArr) {
  const map = new Map();
  (remoteArr || []).forEach((item) => {
    if (item && item.id) map.set(item.id, item);
  });
  (localArr || []).forEach((item) => {
    if (!item || !item.id) return;
    const old = map.get(item.id);
    if (!old) {
      map.set(item.id, item);
      return;
    }
    if ((item.updatedAt || 0) >= (old.updatedAt || 0)) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}

// 统计本地相对云端贡献了多少条记录（用于合并提示）
function countLocalContribution(local, remote) {
  let count = 0;
  ['items', 'wardrobes', 'looks', 'members'].forEach((key) => {
    const remoteMap = new Map((remote[key] || []).map((item) => [item.id, item]));
    (local[key] || []).forEach((item) => {
      const old = remoteMap.get(item.id);
      if (!old) {
        count += 1;
        return;
      }
      if ((item.updatedAt || 0) > (old.updatedAt || 0)) {
        count += 1;
      }
    });
  });
  const remoteFavorites = new Set(remote.lookFavorites || []);
  (local.lookFavorites || []).forEach((id) => {
    if (!remoteFavorites.has(id)) count += 1;
  });
  return count;
}

function mergeStates(local, remote) {
  const state = {
    items: mergeById(local.items, remote.items),
    wardrobes: mergeById(local.wardrobes, remote.wardrobes),
    looks: mergeById(local.looks, remote.looks),
    members: mergeById(local.members, remote.members),
    lookFavorites: Array.from(
      new Set((remote.lookFavorites || []).concat(local.lookFavorites || []))
    ),
    // 任一端已完成引导即视为完成，避免旧设备把状态改回 false
    onboardingDone: local.onboardingDone === true || remote.onboardingDone === true,
    updatedAt: Math.max(local.updatedAt || 0, remote.updatedAt || 0)
  };
  return {
    state,
    localContributed: countLocalContribution(local, remote) > 0,
    dirty: JSON.stringify(state) !== JSON.stringify(normalizeState(remote))
  };
}

function init() {
  if (initPromise) {
    return initPromise;
  }
  cache = loadLocal();
  initPromise = new Promise((resolve) => {
    if (!wx.cloud) {
      cloudState = 'disabled';
      if (!cache) {
        cache = createDefaultState();
        saveLocal();
      }
      resolve(false);
      return;
    }
    try {
      wx.cloud.init({ env: CLOUD_ENV, traceUser: true });
    } catch (error) {
      console.error('[Wardrobe] 云开发初始化失败:', error);
      cloudState = 'disabled';
      if (!cache) {
        cache = createDefaultState();
        saveLocal();
      }
      resolve(false);
      return;
    }
    database = wx.cloud.database();
    database
      .collection(COLLECTION)
      .where({ _openid: '{openid}' })
      .limit(1)
      .get()
      .then((res) => {
        const doc = res.data && res.data[0];
        cloudState = 'ready';
        if (!doc) {
          // 云端无记录：本地有数据或已完成引导才推送，全新空态不写云
          if (!cache) cache = createDefaultState();
          return hasData(cache) || cache.onboardingDone === true ? pushCloud() : false;
        }
        docId = doc._id;
        const remote = normalizeState(doc);
        if (!cache) cache = createDefaultState();
        // 本机没有任何数据：直接以云端为准，但引导完成标记取或
        if (!hasData(cache)) {
          cache = Object.assign({}, remote, {
            onboardingDone: remote.onboardingDone === true || cache.onboardingDone === true
          });
          saveLocal();
          return true;
        }
        const merged = mergeStates(cache, remote);
        cache = merged.state;
        saveLocal();
        if (merged.localContributed) {
          wx.showToast({ title: '已合并本机与云端数据', icon: 'none' });
        }
        if (merged.dirty) {
          return pushCloud();
        }
        return true;
      })
      .then((ok) => {
        resolve(!!ok);
        migrateLocalImages();
      })
      .catch((error) => {
        console.error('[Wardrobe] 云端数据加载失败，暂用本地缓存:', error);
        cloudState = 'disabled';
        if (!cache) {
          cache = createDefaultState();
          saveLocal();
        }
        resolve(false);
      });
  });
  return initPromise;
}

function isCloudReady() {
  return cloudState === 'ready';
}

// 新手引导是否需要展示：未完成过且没有任何单品
function isOnboardingNeeded() {
  const data = getData();
  return data.onboardingDone !== true && data.items.length === 0;
}

// 完成新手引导：写入标记并同步云端（空数据也会写入，保证换设备不重复引导）
function completeOnboarding() {
  const data = getData();
  if (data.onboardingDone === true) {
    return;
  }
  data.onboardingDone = true;
  persist();
}

// ---------- 图片：压缩 + 并发上传 ----------

// 云存储体积目标：超过则逐级降低质量，控制存储成本
const IMAGE_SIZE_TARGET = 300 * 1024;
const IMAGE_MAX_SIDE = 1600;
const COMPRESS_QUALITIES = [80, 70, 62, 55];

function getFileSize(filePath) {
  return new Promise((resolve) => {
    if (!wx.getFileSystemManager) {
      resolve(0);
      return;
    }
    wx.getFileSystemManager().getFileInfo({
      filePath,
      success: (res) => resolve(res.size || 0),
      fail: () => resolve(0)
    });
  });
}

function getImageInfo(filePath) {
  return new Promise((resolve) => {
    wx.getImageInfo({
      src: filePath,
      success: (res) => resolve({ width: res.width || 0, height: res.height || 0 }),
      fail: () => resolve(null)
    });
  });
}

// 按长边上限换算压缩宽度，竖图也不会超过上限
function computeCompressedWidth(width, height, maxSide) {
  const longest = Math.max(width, height);
  if (!longest) {
    return maxSide;
  }
  return Math.max(1, Math.round((width * maxSide) / longest));
}

// 上传前压缩：长边 ≤1600；体积超过目标时逐级降质量，直到达标或用尽档位
function compressImage(filePath) {
  if (!filePath || !wx.compressImage) {
    return Promise.resolve(filePath);
  }
  return Promise.all([getFileSize(filePath), getImageInfo(filePath)]).then(
    ([size, info]) => {
      const compressedWidth = info
        ? computeCompressedWidth(info.width, info.height, IMAGE_MAX_SIDE)
        : IMAGE_MAX_SIDE;
      const needResize = info
        ? Math.max(info.width, info.height) > IMAGE_MAX_SIDE
        : true;
      // 已达标且长边未超限：不重复压缩，避免画质损失
      if (size > 0 && size <= IMAGE_SIZE_TARGET && !needResize) {
        return filePath;
      }
      let lastPath = filePath;
      const step = (index) => {
        if (index >= COMPRESS_QUALITIES.length) {
          return lastPath;
        }
        return new Promise((resolve) => {
          wx.compressImage({
            src: filePath,
            quality: COMPRESS_QUALITIES[index],
            compressedWidth,
            success(res) {
              const path = res.tempFilePath || filePath;
              lastPath = path;
              getFileSize(path).then((nextSize) => {
                if (nextSize > 0 && nextSize <= IMAGE_SIZE_TARGET) {
                  resolve(path);
                } else {
                  step(index + 1).then(resolve);
                }
              });
            },
            fail() {
              step(index + 1).then(resolve);
            }
          });
        });
      };
      return step(0);
    }
  );
}

function runUploadQueue() {
  while (uploadActive < UPLOAD_CONCURRENCY && uploadQueue.length > 0) {
    const job = uploadQueue.shift();
    uploadActive += 1;
    job
      .run()
      .then((fileID) => job.resolve(fileID))
      .catch(() => job.resolve(''))
      .then(() => {
        uploadActive -= 1;
        runUploadQueue();
      });
  }
}

function enqueueUpload(run) {
  return new Promise((resolve) => {
    uploadQueue.push({ run, resolve });
    runUploadQueue();
  });
}

function uploadImage(filePath) {
  if (!filePath || cloudState !== 'ready' || !wx.cloud) {
    return Promise.resolve('');
  }
  if (filePath.indexOf('cloud://') === 0 || filePath.indexOf('http') === 0) {
    return Promise.resolve(filePath);
  }
  const matched = filePath.match(/\.[a-zA-Z0-9]+$/);
  const ext = matched ? matched[0] : '.jpg';
  const cloudPath = `wardrobe/${Date.now()}_${Math.floor(Math.random() * 1000000)}${ext}`;
  return enqueueUpload(() =>
    wx.cloud
      .uploadFile({ cloudPath, filePath })
      .then((res) => res.fileID || '')
      .catch((error) => {
        console.error('[Wardrobe] 图片上传失败:', error);
        return '';
      })
  );
}

// 首次接入云开发时，把本地已有的图片压缩后迁移到云存储
function migrateLocalImages() {
  if (cloudState !== 'ready') return;
  const userDataPath = (wx.env && wx.env.USER_DATA_PATH) || '';
  if (!userDataPath) return;
  const tasks = [];
  getData().items.forEach((item) => {
    if (item.image && item.image.indexOf(userDataPath) === 0) {
      tasks.push(
        compressImage(item.image)
          .then((path) => uploadImage(path))
          .then((fileID) => {
            if (fileID) item.image = fileID;
          })
      );
    }
  });
  getData().wardrobes.forEach((cabinet) => {
    if (cabinet.cover && cabinet.cover.indexOf(userDataPath) === 0) {
      tasks.push(
        compressImage(cabinet.cover)
          .then((path) => uploadImage(path))
          .then((fileID) => {
            if (fileID) cabinet.cover = fileID;
          })
      );
    }
  });
  if (!tasks.length) return;
  Promise.all(tasks).then(() => persist());
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

function touch(record) {
  record.updatedAt = Date.now();
  return record;
}

function addItem(item) {
  const data = getData();
  const next = touch(
    Object.assign({ syncState: 'synced', favorite: false }, item)
  );
  data.items = [next].concat(data.items);
  persist();
}

function updateItem(item) {
  const data = getData();
  data.items = data.items.map((current) =>
    current.id === item.id ? touch(Object.assign({}, current, item)) : current
  );
  persist();
}

function removeItem(id) {
  const data = getData();
  data.items = data.items.filter((item) => item.id !== id);
  persist();
}

// 切换「喜欢」状态
function toggleFavorite(id) {
  const data = getData();
  let nextValue = false;
  data.items = data.items.map((item) => {
    if (item.id !== id) return item;
    nextValue = !item.favorite;
    return touch(Object.assign({}, item, { favorite: nextValue }));
  });
  persist();
  return nextValue;
}

function moveItem(itemId, wardrobeId) {
  const data = getData();
  data.items = data.items.map((item) =>
    item.id === itemId ? touch(Object.assign({}, item, { wardrobeId })) : item
  );
  persist();
}

function getCabinet(id) {
  return getData().wardrobes.find((cabinet) => cabinet.id === id) || null;
}

function addCabinet(cabinet) {
  const data = getData();
  const next = Object.assign({}, cabinet);
  next.createdAt = Number(next.createdAt) || Date.now();
  touch(next);
  data.wardrobes = data.wardrobes.concat([next]);
  persist();
}

function updateCabinet(cabinet) {
  const data = getData();
  data.wardrobes = data.wardrobes.map((current) =>
    current.id === cabinet.id ? touch(Object.assign({}, current, cabinet)) : current
  );
  persist();
}

// 删除衣橱时的转移目标：剩余衣橱中创建最早的一个；无 createdAt 的旧数据按 id 升序兜底
function getTransferTarget(id) {
  const remaining = getData().wardrobes.filter((current) => current.id !== id);
  if (remaining.length === 0) {
    return null;
  }
  return remaining.slice().sort((a, b) => {
    const createdA = Number(a.createdAt) || 0;
    const createdB = Number(b.createdAt) || 0;
    if (createdA !== createdB) {
      return createdA - createdB;
    }
    return String(a.id).localeCompare(String(b.id));
  })[0];
}

// 删除衣橱：单品批量转移到最早的剩余衣橱，一次保存；仅剩一个衣橱时不允许删除
function removeWardrobe(id) {
  const data = getData();
  const cabinet = data.wardrobes.find((current) => current.id === id);
  if (!cabinet) {
    return { ok: false, reason: 'notfound' };
  }
  const target = getTransferTarget(id);
  if (!target) {
    return { ok: false, reason: 'last' };
  }
  const moved = data.items.filter((item) => item.wardrobeId === id).length;
  data.wardrobes = data.wardrobes.filter((current) => current.id !== id);
  data.items = data.items.map((item) =>
    item.wardrobeId === id
      ? touch(Object.assign({}, item, { wardrobeId: target.id }))
      : item
  );
  persist();
  return { ok: true, moved, targetName: target.name };
}

function toggleCabinetShare(id) {
  const data = getData();
  data.wardrobes = data.wardrobes.map((cabinet) =>
    cabinet.id === id
      ? touch(Object.assign({}, cabinet, { isShared: !cabinet.isShared }))
      : cabinet
  );
  persist();
}

// 拍照/相册图片：本地持久化 → 压缩 → 云存储上传，返回 cloud:// 或本地路径
function saveImage(tempFilePath) {
  if (!tempFilePath) {
    return Promise.resolve('');
  }
  if (
    tempFilePath.indexOf('https://') === 0 ||
    tempFilePath.indexOf('cloud://') === 0
  ) {
    return Promise.resolve(tempFilePath);
  }
  const userDataPath = (wx.env && wx.env.USER_DATA_PATH) || '';
  if (userDataPath && tempFilePath.indexOf(userDataPath) === 0) {
    return (initPromise || init())
      .then(() => compressImage(tempFilePath))
      .then((compressedPath) => uploadImage(compressedPath))
      .then((fileID) => fileID || tempFilePath);
  }
  if (!userDataPath) {
    return Promise.resolve(tempFilePath);
  }
  return new Promise((resolve) => {
    const fs = wx.getFileSystemManager();
    const matched = tempFilePath.match(/\.[a-zA-Z0-9]+$/);
    const ext = matched ? matched[0] : '.jpg';
    const filePath = `${userDataPath}/mw_${Date.now()}_${Math.floor(
      Math.random() * 1000
    )}${ext}`;
    fs.saveFile({
      tempFilePath,
      filePath,
      success(res) {
        resolve(res.savedFilePath || filePath);
      },
      fail(error) {
        console.error('[Wardrobe] 图片本地保存失败:', error);
        resolve(tempFilePath);
      }
    });
  }).then((localPath) => {
    if (!localPath) return '';
    return compressImage(localPath)
      .then((compressedPath) => (initPromise || init()).then(() => uploadImage(compressedPath)))
      .then((fileID) => fileID || localPath);
  });
}

function getMembers() {
  return getData().members;
}

function addMember(member) {
  const data = getData();
  data.members = data.members.concat([touch(Object.assign({}, member))]);
  persist();
}

function removeMember(id) {
  const data = getData();
  if (data.members.length <= 1) {
    return false;
  }
  data.members = data.members.filter((member) => member.id !== id);
  persist();
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
  persist();
  return !exists;
}

function addLook(look) {
  const data = getData();
  data.looks = [touch(Object.assign({}, look))].concat(data.looks);
  persist();
}

function updateLook(look) {
  const data = getData();
  data.looks = data.looks.map((current) =>
    current.id === look.id
      ? touch(
          Object.assign({}, current, {
            name: look.name,
            itemIds: look.itemIds
          })
        )
      : current
  );
  persist();
}

function removeLook(id) {
  const data = getData();
  data.looks = data.looks.filter((look) => look.id !== id);
  data.lookFavorites = (data.lookFavorites || []).filter((lookId) => lookId !== id);
  persist();
}

// 载入内置示例数据：唯一写入示例数据的入口
function loadSampleData() {
  const now = Date.now();
  cache = {
    items: sampleClothes.map((item) =>
      normalizeItem(
        Object.assign({}, item, { favorite: !!item.favorite, syncState: 'synced', updatedAt: now })
      )
    ),
    wardrobes: sampleWardrobes.map((cabinet) =>
      normalizeRecord(Object.assign({}, cabinet, { updatedAt: now }))
    ),
    looks: [],
    lookFavorites: [],
    members: [],
    updatedAt: now
  };
  saveLocal();
  return persist();
}

// 清空单品、搭配与收藏，保留衣橱和家庭成员
function clearItems() {
  const data = getData();
  data.items = [];
  data.looks = [];
  data.lookFavorites = [];
  persist();
}

function collectCloudFiles(state) {
  const files = [];
  (state.items || []).forEach((item) => {
    if (item.image && item.image.indexOf('cloud://') === 0) {
      files.push(item.image);
    }
  });
  (state.wardrobes || []).forEach((cabinet) => {
    if (cabinet.cover && cabinet.cover.indexOf('cloud://') === 0) {
      files.push(cabinet.cover);
    }
  });
  return files;
}

function deleteCloudFiles(files) {
  const chunks = [];
  for (let i = 0; i < files.length; i += 50) {
    chunks.push(files.slice(i, i + 50));
  }
  return chunks.reduce(
    (chain, chunk) =>
      chain.then(() =>
        wx.cloud
          .deleteFile({ fileList: chunk })
          .catch((error) => {
            console.error('[Wardrobe] 云存储文件删除失败:', error);
            return null;
          })
      ),
    Promise.resolve()
  );
}

// 删除全部数据：本地缓存 + 云端记录 + 云存储文件
function clearAll() {
  const files = cache ? collectCloudFiles(cache) : [];
  // 删除数据不重置引导状态，避免已读用户被再次引导
  const keepOnboarded = !!(cache && cache.onboardingDone === true);
  const resetLocal = () => {
    try {
      wx.removeStorageSync(STORAGE_KEY);
    } catch (error) {
      console.error('[Wardrobe] 清除本地缓存失败:', error);
    }
    cache = createDefaultState();
    cache.onboardingDone = keepOnboarded;
  };
  return (initPromise || init()).then(() => {
    if (cloudState !== 'ready' || !database) {
      resetLocal();
      return true;
    }
    const tasks = [];
    if (files.length > 0) {
      tasks.push(deleteCloudFiles(files));
    }
    if (docId) {
      tasks.push(
        database
          .collection(COLLECTION)
          .doc(docId)
          .remove()
          .catch((error) => {
            console.error('[Wardrobe] 云端记录删除失败:', error);
            return null;
          })
      );
    }
    return Promise.all(tasks).then(() => {
      docId = '';
      resetLocal();
      return true;
    });
  });
}

module.exports = {
  init,
  isCloudReady,
  isOnboardingNeeded,
  completeOnboarding,
  isLocalImagePath,
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
  getTransferTarget,
  removeWardrobe,
  toggleCabinetShare,
  saveImage,
  getMembers,
  addMember,
  removeMember,
  getLook,
  isLookFavorite,
  toggleLookFavorite,
  addLook,
  updateLook,
  removeLook,
  loadSampleData,
  clearItems,
  clearAll
};
