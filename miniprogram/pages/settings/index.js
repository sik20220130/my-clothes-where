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

  handleReset() {
    const that = this;
    wx.showModal({
      title: '恢复示例数据',
      content: '将用内置示例数据覆盖当前衣橱内容，确定继续吗？',
      confirmText: '恢复',
      confirmColor: '#7b5bd6',
      success(res) {
        if (!res.confirm) return;
        store.resetData();
        that.refresh();
        wx.showToast({ title: '已恢复示例数据', icon: 'none' });
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
        '我的衣服在哪（简称：衣服在哪）v1.0.0\n衣物收纳、喜欢优先、多衣橱管理与家庭共享，让找衣服更轻松。',
      showCancel: false,
      confirmText: '知道啦'
    });
  }
});
