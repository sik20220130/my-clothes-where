const store = require('../../utils/store');
const { CATEGORY_LIST, COLOR_OPTIONS, SEASON_LIST } = require('../../utils/category');
const { formatYMD } = require('../../utils/date');

const DEFAULT_IMAGES = {
  top: 'https://picsum.photos/id/103/600/600',
  bottom: 'https://picsum.photos/id/230/600/600',
  dress: 'https://picsum.photos/id/119/720/900',
  outer: 'https://picsum.photos/id/220/600/600',
  shoes: 'https://picsum.photos/id/230/600/600',
  bag: 'https://picsum.photos/id/250/600/600',
  accessory: 'https://picsum.photos/id/103/600/600'
};

Page({
  data: {
    isEditing: false,
    image: '',
    name: '',
    category: '',
    colorIndex: 0,
    seasons: ['春', '秋'],
    brand: '',
    note: '',
    wardrobeId: '',
    wardrobes: [],
    categories: CATEGORY_LIST.filter((item) => item.key !== 'all'),
    colorOptions: COLOR_OPTIONS,
    seasonOptions: SEASON_LIST.map((name) => ({ name, active: name === '春' || name === '秋' })),
    colorName: COLOR_OPTIONS[0].name,
    canSave: false
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
          that.setData({ image: res.tempFiles[0].tempFilePath });
        }
      },
      fail(error) {
        console.error('[AddClothing] 获取照片失败:', error);
      }
    });
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

    const color = COLOR_OPTIONS[colorIndex];
    const editingItem = this.editingItem;
    store.saveImage(image).then((savedImage) => {
      const payload = {
        id: editingItem ? editingItem.id : `c-${Date.now()}`,
        name: name.trim(),
        category,
        color: color.name,
        colorHex: color.hex,
        seasons: seasons.length > 0 ? seasons : ['四季'],
        image: savedImage || DEFAULT_IMAGES[category],
        brand: brand.trim() || '未填写',
        favorite: editingItem ? !!editingItem.favorite : false,
        addedAt: editingItem ? editingItem.addedAt : formatYMD(),
        wardrobeId: wardrobeId || (wardrobes[0] ? wardrobes[0].id : ''),
        note: note.trim() || undefined
      };

      if (editingItem) {
        store.updateItem(payload);
        wx.showToast({ title: '修改已保存', icon: 'success', duration: 800 });
      } else {
        store.addItem(payload);
        wx.showToast({ title: '已加入衣橱', icon: 'success', duration: 800 });
      }
      setTimeout(() => wx.navigateBack(), 800);
    });
  }
});
