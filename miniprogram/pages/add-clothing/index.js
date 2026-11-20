const store = require('../../utils/store');
const { CATEGORY_LIST, COLOR_OPTIONS, SEASON_LIST } = require('../../utils/category');
const { formatYMD } = require('../../utils/date');

const DEFAULT_IMAGES = {
  top: '/assets/demo/item-1.png',
  bottom: '/assets/demo/item-2.png',
  dress: '/assets/demo/item-3.png',
  outer: '/assets/demo/item-4.png',
  shoes: '/assets/demo/item-5.png',
  bag: '/assets/demo/item-6.png',
  accessory: '/assets/demo/item-1.png'
};

// 新建单品按当前月份单季预选：3-5 春、6-8 夏、9-11 秋、12-2 冬
function defaultSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return '春';
  if (month >= 6 && month <= 8) return '夏';
  if (month >= 9 && month <= 11) return '秋';
  return '冬';
}

const DEFAULT_SEASON = defaultSeason();

Page({
  data: {
    isEditing: false,
    image: '',
    name: '',
    category: '',
    colorIndex: 0,
    seasons: [DEFAULT_SEASON],
    brand: '',
    note: '',
    wardrobeId: '',
    wardrobes: [],
    categories: CATEGORY_LIST.filter((item) => item.key !== 'all'),
    colorOptions: COLOR_OPTIONS,
    seasonOptions: SEASON_LIST.map((name) => ({ name, active: name === DEFAULT_SEASON })),
    colorName: COLOR_OPTIONS[0].name,
    canSave: false,
    showPrivacy: false
  },

  onLoad(options) {
    const editingId = options.id || '';
    const state = store.getState();
    const editingItem = editingId ? state.items.find((item) => item.id === editingId) : null;

    if (editingItem) {
      const index = COLOR_OPTIONS.findIndex((color) => color.name === editingItem.color);
      const colorIndex = index >= 0 ? index : 0;
      this.editingItem = editingItem;
      wx.setNavigationBarTitle({ title: '编辑单品' });
      this.setData({
        isEditing: true,
        image: editingItem.image,
        name: editingItem.name,
        category: editingItem.category,
        colorIndex,
        colorName: COLOR_OPTIONS[colorIndex].name,
        seasons: editingItem.seasons,
        seasonOptions: SEASON_LIST.map((name) => ({
          name,
          active: editingItem.seasons.indexOf(name) >= 0
        })),
        brand: editingItem.brand,
        note: editingItem.note || '',
        wardrobeId: editingItem.wardrobeId,
        wardrobes: state.wardrobes,
        canSave: true
      });
      return;
    }

    this.setData({
      wardrobes: state.wardrobes,
      wardrobeId: state.wardrobes[0] ? state.wardrobes[0].id : ''
    });
  },

  chooseImage(event) {
    const source = event.currentTarget.dataset.source;
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: [source],
      sizeType: ['compressed'],
      success(res) {
        if (res.tempFiles && res.tempFiles.length > 0) {
          // 选图后必须进入裁切页，不允许跳过直接上传
          that.openCrop(res.tempFiles[0].tempFilePath);
        }
      },
      fail(error) {
        console.error('[AddClothing] 获取照片失败:', error);
        wx.showToast({ title: '未获取到照片，可手动填写保存', icon: 'none' });
      }
    });
  },

  // 跳转裁切页（单品 3:4），确认后回填裁切结果
  openCrop(src) {
    const that = this;
    wx.navigateTo({
      url: `/pages/image-crop/index?mode=item&src=${encodeURIComponent(src)}`,
      events: {
        cropResult(payload) {
          if (payload && payload.path) {
            that.setData({ image: payload.path });
          }
        }
      }
    });
  },

  // 由 app.js 的隐私授权监听调用
  showPrivacyPopup() {
    this.setData({ showPrivacy: true });
  },

  // open-type="agreePrivacyAuthorization" 点击后微信会自动放行原接口，这里只需关闭弹窗
  handlePrivacyAgree() {
    getApp().globalData.privacyResolve = null;
    this.setData({ showPrivacy: false });
  },

  // 拒绝授权：原接口返回失败，降级为手动填写表单
  handlePrivacyDisagree() {
    getApp().resolvePrivacy(false);
    this.setData({ showPrivacy: false });
  },

  handleNameInput(event) {
    this.setData({ name: event.detail.value }, () => this.updateCanSave());
  },

  handleBrandInput(event) {
    this.setData({ brand: event.detail.value });
  },

  handleNoteInput(event) {
    this.setData({ note: event.detail.value });
  },

  selectCabinet(event) {
    this.setData({ wardrobeId: event.currentTarget.dataset.id });
  },

  selectCategory(event) {
    this.setData({ category: event.currentTarget.dataset.key }, () => this.updateCanSave());
  },

  selectColor(event) {
    const colorIndex = Number(event.currentTarget.dataset.index);
    this.setData({ colorIndex, colorName: COLOR_OPTIONS[colorIndex].name });
  },

  toggleSeason(event) {
    const season = event.currentTarget.dataset.season;
    const seasons = this.data.seasons.slice();
    const index = seasons.indexOf(season);
    if (index >= 0) {
      seasons.splice(index, 1);
    } else {
      seasons.push(season);
    }
    this.setData({
      seasons,
      seasonOptions: SEASON_LIST.map((name) => ({ name, active: seasons.indexOf(name) >= 0 }))
    });
  },

  updateCanSave() {
    this.setData({ canSave: this.data.name.trim().length > 0 && this.data.category !== '' });
  },

  goCreateCabinet() {
    wx.navigateTo({ url: '/pages/add-wardrobe/index' });
  },

  handleSave() {
    const { name, category, image, seasons, brand, note, wardrobeId, colorIndex, wardrobes } = this.data;
    if (!name.trim()) {
      wx.showToast({ title: '请填写单品名称', icon: 'none' });
      return;
    }
    if (!category) {
      wx.showToast({ title: '请选择单品分类', icon: 'none' });
      return;
    }

    const targetWardrobeId = wardrobeId || (wardrobes[0] ? wardrobes[0].id : '');
    if (!targetWardrobeId) {
      wx.showModal({
        title: '先创建一个衣橱',
        content: '单品需要归入衣橱，创建衣橱后再回来保存。',
        confirmText: '去创建',
        confirmColor: '#7b5bd6',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/add-wardrobe/index' });
          }
        }
      });
      return;
    }

    const color = COLOR_OPTIONS[colorIndex];
    const editingItem = this.editingItem;
    store.saveImage(image).then((savedImage) => {
      const finalImage = savedImage || DEFAULT_IMAGES[category];
      const pending = store.isLocalImagePath(finalImage);
      const payload = {
        id: editingItem ? editingItem.id : `c-${Date.now()}`,
        name: name.trim(),
        category,
        color: color.name,
        colorHex: color.hex,
        seasons: seasons.length > 0 ? seasons : ['四季'],
        image: finalImage,
        brand: brand.trim() || '未填写',
        favorite: editingItem ? !!editingItem.favorite : false,
        addedAt: editingItem ? editingItem.addedAt : formatYMD(),
        wardrobeId: targetWardrobeId,
        note: note.trim() || undefined,
        syncState: pending ? 'pending' : 'synced'
      };

      if (editingItem) {
        store.updateItem(payload);
      } else {
        store.addItem(payload);
      }
      if (pending) {
        wx.showToast({ title: '已保存到本机，稍后自动同步', icon: 'none' });
      } else if (editingItem) {
        wx.showToast({ title: '修改已保存', icon: 'success', duration: 800 });
      } else {
        wx.showToast({ title: '已加入衣橱', icon: 'success', duration: 800 });
      }
      setTimeout(() => wx.navigateBack(), 800);
    });
  }
});
