const store = require('../../utils/store');

Page({
  data: {
    wardrobes: [],
    counts: {}
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const state = store.getState();
    const counts = {};
    state.items.forEach((item) => {
      counts[item.wardrobeId] = (counts[item.wardrobeId] || 0) + 1;
    });
    this.setData({
      wardrobes: state.wardrobes.map((cabinet) =>
        Object.assign({}, cabinet, {
          count: counts[cabinet.id] || 0,
          displayName: cabinet.name || '未命名衣橱'
        })
      )
    });
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/add-wardrobe/index' });
  },

  goEdit(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/add-wardrobe/index?id=${id}` });
  },

  goItems(event) {
    const { id } = event.currentTarget.dataset;
    if (id) {
      getApp().globalData.wardrobeFilter = id;
    }
    wx.switchTab({ url: '/pages/wardrobe/index' });
  },

  handleDelete(event) {
    const { id, name, count } = event.currentTarget.dataset;
    const state = store.getState();
    if (state.wardrobes.length <= 1) {
      wx.showToast({ title: '至少保留一个衣橱', icon: 'none' });
      return;
    }
    const target = store.getTransferTarget(id);
    const content =
      count > 0 && target
        ? `「${name}」内有 ${count} 件单品，删除后将转移到「${target.name}」。`
        : `确定删除「${name}」吗？`;
    wx.showModal({
      title: '删除衣橱',
      content,
      confirmText: '删除',
      confirmColor: '#f53f3f',
      success: (res) => {
        if (!res.confirm) return;
        const result = store.removeWardrobe(id);
        if (!result.ok) {
          wx.showToast({
            title: result.reason === 'last' ? '至少保留一个衣橱' : '衣橱不存在',
            icon: 'none'
          });
          return;
        }
        wx.showToast({
          title: result.moved > 0 ? `已删除，${result.moved} 件单品已转移` : '衣橱已删除',
          icon: 'none'
        });
        this.refresh();
      }
    });
  }
});
