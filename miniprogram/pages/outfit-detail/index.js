const { outfits } = require('../../data/outfits');
const { SCENE_META } = require('../../utils/category');
const store = require('../../utils/store');

Page({
  data: {
    notFound: false,
    outfit: null,
    sceneText: '',
    liked: false
  },

  onLoad(options) {
    const id = options.id || '';
    let outfit = outfits.find((item) => item.id === id);
    let sceneText = '';

    if (outfit) {
      const meta = SCENE_META[outfit.scene];
      sceneText = meta ? `${meta.emoji} ${meta.label}` : '';
    } else {
      const look = store.getLook(id);
      if (!look) {
        this.setData({ notFound: true });
        return;
      }
      const items = look.itemIds
        .map((itemId) => store.getState().items.find((item) => item.id === itemId))
        .filter(Boolean);
      outfit = {
        id: look.id,
        title: look.name,
        cover: items[0] ? items[0].image : 'https://picsum.photos/id/103/720/900',
        author: '我的搭配',
        tags: [],
        description: `这套搭配收录了 ${items.length} 件单品，创建于 ${look.createdAt}。`,
        itemNames: items.map((item) => item.name)
      };
      sceneText = '✨ 我的搭配';
    }

    this.setData({
      outfit,
      sceneText,
      liked: store.isLookFavorite(id)
    });
  },

  toggleLike() {
    if (!this.data.outfit) return;
    const liked = store.toggleLookFavorite(this.data.outfit.id);
    this.setData({ liked });
  },

  goBack() {
    wx.navigateBack();
  }
});
