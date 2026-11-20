const store = require('../../utils/store');

Page({
  data: {
    id: '',
    isEdit: false,
    cover: '',
    name: '',
    location: '',
    isShared: false,
    showPrivacy: false
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
          // 选图后必须进入裁切页，不允许跳过直接上传
          that.openCrop(res.tempFiles[0].tempFilePath);
        }
      },
      fail(error) {
        console.error('[AddWardrobe] 选择照片失败:', error);
        wx.showToast({ title: '未获取到照片，将使用默认封面', icon: 'none' });
      }
    });
  },

  // 跳转裁切页（封面 15:8），确认后回填裁切结果
  openCrop(src) {
    const that = this;
    wx.navigateTo({
      url: `/pages/image-crop/index?mode=cover&src=${encodeURIComponent(src)}`,
      events: {
        cropResult(payload) {
          if (payload && payload.path) {
            that.setData({ cover: payload.path });
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

  // 拒绝授权：不影响手动填写衣橱信息
  handlePrivacyDisagree() {
    getApp().resolvePrivacy(false);
    this.setData({ showPrivacy: false });
  },

  handleNameInput(event) {
    this.setData({ name: event.detail.value });
  },

  handleLocationInput(event) {
    this.setData({ location: event.detail.value });
  },

  handleSave() {
    const { id, isEdit, cover, name, location, isShared } = this.data;
    const trimmedName = name.trim();
    if (!trimmedName) {
      wx.showToast({ title: '请填写衣橱名称', icon: 'none' });
      return;
    }
    // 重名校验：忽略大小写与首尾空格，编辑时排除自身
    const duplicated = store.getState().wardrobes.some(
      (cabinet) =>
        cabinet.id !== id &&
        String(cabinet.name || '').trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicated) {
      wx.showToast({ title: '已存在同名衣橱', icon: 'none' });
      return;
    }
    const cabinet = {
      id: id || `w-${Date.now()}`,
      name: trimmedName,
      location: location.trim() || '未填写位置',
      // 未选封面时留空，前端回落内置默认封面，不写外链
      cover: cover || '',
      isShared
    };
    const saveTask = cover ? store.saveImage(cover) : Promise.resolve('');
    saveTask.then((savedCover) => {
      cabinet.cover = savedCover || '';
      const pending = !!cabinet.cover && store.isLocalImagePath(cabinet.cover);
      if (isEdit) {
        store.updateCabinet(cabinet);
      } else {
        store.addCabinet(cabinet);
      }
      if (pending) {
        wx.showToast({ title: '已保存，封面未同步', icon: 'none', duration: 1600 });
      } else {
        wx.showToast({
          title: isEdit ? '衣橱已更新' : '衣橱已添加',
          icon: 'success',
          duration: 800
        });
      }
      setTimeout(() => wx.navigateBack(), pending ? 1200 : 800);
    });
  }
});
