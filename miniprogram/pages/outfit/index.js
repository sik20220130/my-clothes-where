const store = require('../../utils/store');
const { outfits } = require('../../data/outfits');
const { SCENE_LIST, CATEGORY_META } = require('../../utils/category');

Page({
  data: {
    scene: 'all',
    sceneList: SCENE_LIST,
    filtered: [],
    lookCards: [],
    magic: null
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

    this.setData({ lookCards, filtered: this.filterOutfits(this.data.scene) });
  },

  filterOutfits(scene) {
    return outfits.filter((outfit) => scene === 'all' || outfit.scene === scene);
  },

  selectScene(event) {
    const scene = event.currentTarget.dataset.key;
    this.setData({ scene, filtered: this.filterOutfits(scene) });
  },

  pickRandom(category) {
    const pool = store.getState().items.filter((item) => item.category === category);
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  handleMagic() {
    const picked = [this.pickRandom('top'), this.pickRandom('bottom'), this.pickRandom('shoes')].filter(
      Boolean
    );
    if (picked.length < 2) {
      wx.showToast({ title: '衣橱单品不足，先添加几件吧', icon: 'none' });
      return;
    }
    const magic = {
      key: `${Date.now()}`,
      items: picked.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        categoryLabel: CATEGORY_META[item.category].label
      }))
    };
    this.setData({ magic });
  },

  goClothing(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/clothing-detail/index?id=${id}` });
  },

  goDetail(event) {
    const { outfit } = event.detail;
    wx.navigateTo({ url: `/pages/outfit-detail/index?id=${outfit.id}` });
  },

  goBuildLook() {
    wx.navigateTo({ url: '/pages/build-look/index' });
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
