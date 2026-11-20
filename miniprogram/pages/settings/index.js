const store = require('../../utils/store');

Page({
  data: {
    stats: []
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const state = store.getState();
    this.setData({
      stats: [
        { label: '单品', value: state.items.length },
        { label: '衣橱', value: state.wardrobes.length },
        { label: '搭配', value: state.looks.length },
        { label: '喜欢', value: state.items.filter((item) => item.favorite).length }
      ]
    });
  },

  handleOnboarding() {
    wx.navigateTo({ url: '/pages/onboarding/index?preview=1' });
  },

  handlePrivacy() {
    if (!wx.openPrivacyContract) {
      wx.showToast({ title: '当前版本暂不支持查看协议', icon: 'none' });
      return;
    }
    wx.openPrivacyContract({
      fail() {
        wx.showToast({ title: '暂时无法打开协议，请稍后再试', icon: 'none' });
      }
    });
  },

  handleDeleteAll() {
    const that = this;
    wx.showModal({
      title: '删除全部数据',
      content: '将删除本机缓存、云端记录与云存储图片，且无法恢复。确定继续吗？',
      confirmText: '全部删除',
      confirmColor: '#f53f3f',
      success(res) {
        if (!res.confirm) return;
        wx.showLoading({ title: '正在删除', mask: true });
        store
          .clearAll()
          .then(() => {
            wx.hideLoading();
            that.refresh();
            wx.showToast({ title: '数据已全部删除', icon: 'none' });
          })
          .catch((error) => {
            console.error('[Settings] 删除全部数据失败:', error);
            wx.hideLoading();
            wx.showToast({ title: '删除失败，请稍后再试', icon: 'none' });
          });
      }
    });
  },

  handleClear() {
    const that = this;
    wx.showModal({
      title: '清空单品',
      content: '将清空全部单品、搭配与收藏，衣橱和家庭成员会保留。确定继续吗？',
      confirmText: '清空',
      confirmColor: '#f53f3f',
      success(res) {
        if (!res.confirm) return;
        store.clearItems();
        that.refresh();
        wx.showToast({ title: '已清空单品', icon: 'none' });
      }
    });
  },

  handleAbout() {
    wx.showModal({
      title: '关于我的衣服在哪',
      content:
        '我的衣服在哪（简称：衣服在哪）v1.0.0\n衣物收纳、搭配记录与多衣橱管理，让找衣服更轻松。',
      showCancel: false,
      confirmText: '知道啦'
    });
  }
});
