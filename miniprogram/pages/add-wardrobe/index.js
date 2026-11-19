const store = require('../../utils/store');

const DEFAULT_COVER = 'https://picsum.photos/id/582/750/400';

Page({
  data: {
    cover: '',
    name: '',
    location: '',
    isShared: false
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
    const { cover, name, location, isShared } = this.data;
    if (!name.trim()) {
      wx.showToast({ title: '请填写衣橱名称', icon: 'none' });
      return;
    }
    store.addCabinet({
      id: `w-${Date.now()}`,
      name: name.trim(),
      location: location.trim() || '未填写位置',
      cover: cover || DEFAULT_COVER,
      isShared
    });
    wx.showToast({ title: '衣橱已添加', icon: 'success', duration: 800 });
    setTimeout(() => wx.navigateBack(), 800);
  }
});
