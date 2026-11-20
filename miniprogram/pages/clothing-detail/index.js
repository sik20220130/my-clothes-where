const store = require('../../utils/store');
const { CATEGORY_META } = require('../../utils/category');

Page({
  data: {
    id: '',
    notFound: false,
    item: null,
    categoryLabel: '',
    categoryEmoji: '',
    cabinetName: '未分配',
    favorite: false
  },

  onLoad(options) {
    this.setData({ id: options.id || '' });
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const state = store.getState();
    const item = state.items.find((clothing) => clothing.id === this.data.id);
    if (!item) {
      this.setData({ notFound: true, item: null });
      return;
    }
    const cabinet = state.wardrobes.find((wardrobe) => wardrobe.id === item.wardrobeId);
    const meta = CATEGORY_META[item.category];
    this.setData({
      notFound: false,
      item,
      favorite: !!item.favorite,
      categoryLabel: meta ? meta.label : '',
      categoryEmoji: meta ? meta.emoji : '',
      cabinetName: cabinet ? cabinet.name : '未分配'
    });
  },

  toggleFavorite() {
    const favorite = store.toggleFavorite(this.data.item.id);
    wx.showToast({ title: favorite ? '已标记喜欢' : '已取消喜欢', icon: 'none' });
    this.refresh();
  },

  goEdit() {
    wx.navigateTo({ url: `/pages/add-clothing/index?id=${this.data.item.id}` });
  },

  handleTransfer() {
    const state = store.getState();
    if (state.wardrobes.length < 2) {
      wx.showToast({ title: '只有一个衣橱，先去添加更多衣橱吧', icon: 'none' });
      return;
    }
    const that = this;
    const item = this.data.item;
    wx.showActionSheet({
      itemList: state.wardrobes.map((wardrobe) => wardrobe.name),
      success(res) {
        const target = state.wardrobes[res.tapIndex];
        if (!target) {
          return;
        }
        if (target.id === item.wardrobeId) {
          wx.showToast({ title: '已经在这个衣橱里了', icon: 'none' });
          return;
        }
        store.moveItem(item.id, target.id);
        wx.showToast({ title: `已转移到${target.name}`, icon: 'none' });
        that.refresh();
      },
      fail(error) {
        console.info('[ClothingDetail] 转移衣橱取消或失败:', error);
      }
    });
  },

  handleDelete() {
    const item = this.data.item;
    wx.showModal({
      title: '删除单品',
      content: `确定要从衣橱中删除「${item.name}」吗？`,
      confirmText: '删除',
      confirmColor: '#f53f3f',
      success(res) {
        if (res.confirm) {
          store.removeItem(item.id);
          wx.showToast({ title: '已删除', icon: 'none' });
          setTimeout(() => wx.navigateBack(), 500);
        }
      }
    });
  },

  goBack() {
    wx.navigateBack();
  }
});
