const { CATEGORY_META } = require('../../utils/category');

Component({
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },

  data: {
    categoryLabel: ''
  },

  observers: {
    item(item) {
      if (!item || !item.category) return;
      const meta = CATEGORY_META[item.category];
      this.setData({ categoryLabel: meta ? meta.label : '' });
    }
  },

  methods: {
    handleTap() {
      this.triggerEvent('select', { item: this.data.item });
    },

    handleFavorite() {
      this.triggerEvent('favorite', { item: this.data.item });
    },

    handleImageError() {
      console.error('[ClothingCard] 图片加载失败:', this.data.item.image);
    }
  }
});
