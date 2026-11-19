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
        Object.assign({}, cabinet, { count: counts[cabinet.id] || 0 })
      )
    });
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/add-wardrobe/index' });
  },

  goItems() {
    wx.switchTab({ url: '/pages/wardrobe/index' });
  },

  handleToggleShare(event) {
    const { id, name } = event.currentTarget.dataset;
    store.toggleCabinetShare(id);
    wx.showToast({ title: `${name}共享状态已更新`, icon: 'none' });
    this.refresh();
  }
});
