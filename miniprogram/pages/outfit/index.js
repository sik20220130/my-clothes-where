const store = require('../../utils/store');

Page({
  data: {
    lookCards: []
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const items = store.getSortedItems();
    const looks = store.getState().looks;

    const lookCards = looks.map((look) => {
      const images = look.itemIds
        .map((itemId) => items.find((item) => item.id === itemId))
        .filter(Boolean)
        .slice(0, 3)
        .map((item) => item.image);
      return { id: look.id, name: look.name, images };
    });

    this.setData({ lookCards });
  },

  goLook(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/outfit-detail/index?id=${id}` });
  },

  goBuildLook() {
    wx.navigateTo({ url: '/pages/build-look/index' });
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/add-clothing/index' });
  },

  handleRemoveLook(event) {
    const id = event.currentTarget.dataset.id;
    const name = event.currentTarget.dataset.name;
    const that = this;
    wx.showModal({
      title: '删除搭配',
      content: `确定删除「${name}」吗？`,
      confirmText: '删除',
      confirmColor: '#f53f3f',
      success(res) {
        if (res.confirm) {
          store.removeLook(id);
          wx.showToast({ title: '已删除', icon: 'none' });
          that.refresh();
        }
      }
    });
  }
});
