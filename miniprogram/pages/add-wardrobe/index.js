const store = require('../../utils/store');

const DEFAULT_COVER = 'https://picsum.photos/id/582/750/400';

Page({
  data: {
    id: '',
    isEdit: false,
    cover: '',
    name: '',
    location: '',
    isShared: false
  },

  onLoad(options) {
    const id = options && options.id;
    if (!id) return;
    const cabinet = store.getCabinet(id);
    if (!cabinet) return;
    this.setData({
      id: cabinet.id,
      isEdit: true,
      cover: cabinet.cover,
      name: cabinet.name,
      location: cabinet.location,
      isShared: !!cabinet.isShared
    });
    wx.setNavigationBarTitle({ title: '编辑衣橱' });
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
          that.setData({ cover: res.tempFiles[0].tempFilePath });
        }
      },
      fail(error) {
        console.error('[AddWardrobe] 选择照片失败:', error);
      }
    });
  },

  handleNameInput(event) {
    this.setData({ name: event.detail.value });
  },

  handleLocationInput(event) {
    this.setData({ location: event.detail.value });
  },

  toggleShare() {
    this.setData({ isShared: !this.data.isShared });
  },

  handleSave() {
    const { id, isEdit, cover, name, location, isShared } = this.data;
    if (!name.trim()) {
      wx.showToast({ title: '请填写衣橱名称', icon: 'none' });
      return;
    }
    const cabinet = {
      id: id || `w-${Date.now()}`,
      name: name.trim(),
      location: location.trim() || '未填写位置',
      cover: cover || DEFAULT_COVER,
      isShared
    };
    store.saveImage(cover).then((savedCover) => {
      cabinet.cover = savedCover || DEFAULT_COVER;
      if (isEdit) {
        store.updateCabinet(cabinet);
      } else {
        store.addCabinet(cabinet);
      }
      wx.showToast({
        title: isEdit ? '衣橱已更新' : '衣橱已添加',
        icon: 'success',
        duration: 800
      });
      setTimeout(() => wx.navigateBack(), 800);
    });
  }
});
