const { outfits } = require('../../data/outfits');
const { SCENE_META } = require('../../utils/category');

Page({
  data: {
    notFound: false,
    outfit: null,
    sceneText: '',
    liked: false
  },

  onLoad(options) {
    const id = options.id || '';
    const outfit = outfits.find((item) => item.id === id);
    if (!outfit) {
      this.setData({ notFound: true });
      return;
    }
    const meta = SCENE_META[outfit.scene];
    this.setData({
      outfit,
      sceneText: meta ? `${meta.emoji} ${meta.label}` : ''
    });
  },

  toggleLike() {
    this.setData({ liked: !this.data.liked });
  },

  goBack() {
    wx.navigateBack();
  }
});
