const { SCENE_META } = require('../../utils/category');

Component({
  properties: {
    outfit: {
      type: Object,
      value: {}
    },
    variant: {
      type: String,
      value: 'list'
    }
  },

  data: {
    sceneText: ''
  },

  observers: {
    outfit(outfit) {
      if (!outfit || !outfit.scene) return;
      const meta = SCENE_META[outfit.scene];
      this.setData({ sceneText: meta ? `${meta.emoji} ${meta.label}` : '' });
    }
  },

  methods: {
    handleTap() {
      this.triggerEvent('select', { outfit: this.data.outfit });
    },

    handleImageError() {
      console.error('[OutfitCard] 图片加载失败:', this.data.outfit.cover);
    }
  }
});
