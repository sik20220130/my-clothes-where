const { outfits } = require('../../data/outfits');
const { SCENE_META } = require('../../utils/category');
const store = require('../../utils/store');

Page({
  data: {
    notFound: false,
    outfit: null,
    sceneText: '',
    isOwn: false
  },

  onLoad(options) {
    this.lookId = (options && options.id) || '';
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const id = this.lookId;
    const preset = outfits.find((item) => item.id === id);
    if (preset) {
      const meta = SCENE_META[preset.scene];
      this.setData({
        notFound: false,
        isOwn: false,
        sceneText: meta ? meta.label : '',
        outfit: preset
      });
      return;
    }

    const look = store.getLook(id);
    if (!look) {
      this.setData({ notFound: true, outfit: null, isOwn: false });
      return;
    }

    const state = store.getState();
    const items = (look.itemIds || []).map((itemId) => {
      const item = state.items.find((clothing) => clothing.id === itemId);
      if (!item) {
        return { id: itemId, name: '单品已删除', image: '', missing: true };
      }
      return { id: item.id, name: item.name, image: item.image, missing: false };
    });
    const validCount = items.filter((item) => !item.missing).length;
    const firstImage = items.find((item) => item.image);

    this.setData({
      notFound: false,
      isOwn: true,
      sceneText: '我的搭配',
      outfit: {
        id: look.id,
        title: look.name,
        cover: firstImage ? firstImage.image : 'https://picsum.photos/id/103/720/900',
        author: '我的搭配',
        tags: [],
        description: `这套搭配收录了 ${validCount} 件单品，创建于 ${look.createdAt}。`,
        items
      }
    });
  },

  goEdit() {
    const outfit = this.data.outfit;
    if (!outfit) return;
    wx.navigateTo({ url: `/pages/build-look/index?id=${outfit.id}` });
  },

  handleDelete() {
    const outfit = this.data.outfit;
    if (!outfit) return;
    wx.showModal({
      title: '删除搭配',
      content: `确定删除「${outfit.title}」吗？单品不会从衣橱中删除。`,
      confirmText: '删除',
      confirmColor: '#f53f3f',
      success(res) {
        if (!res.confirm) return;
        store.removeLook(outfit.id);
        wx.showToast({ title: '已删除', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 500);
      }
    });
  },

  goBack() {
    wx.navigateBack();
  }
});
