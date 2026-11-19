const store = require('../../utils/store');
const { outfits } = require('../../data/outfits');
const { CATEGORY_META } = require('../../utils/category');
const { greeting, formatMD, weekLabel, monthPrefix } = require('../../utils/date');

const AVATAR = 'https://picsum.photos/id/64/200/200';

const QUICK_ENTRIES = [
  { key: 'add', emoji: '📷', label: '拍照收纳' },
  { key: 'wardrobe', emoji: '👗', label: '我的衣橱' },
  { key: 'family', emoji: '👨‍👩‍👧', label: '家庭共享' },
  { key: 'outfit', emoji: '✨', label: '搭配灵感' }
];

Page({
  data: {
    avatar: AVATAR,
    greeting: '',
    todayText: '',
    quickEntries: QUICK_ENTRIES,
    stats: {
      total: 0,
      monthly: 0,
      topLabel: '—',
      topEmoji: '✨'
    },
    inspirations: []
  },

  onLoad() {
    this.setData({
      greeting: greeting(),
      todayText: `${formatMD()} ${weekLabel()}`,
      inspirations: outfits.slice(3, 7)
    });
  },

  onShow() {
    this.refreshStats();
  },

  refreshStats() {
    const items = store.getState().items;
    const prefix = monthPrefix();
    const counter = {};
    items.forEach((item) => {
      counter[item.category] = (counter[item.category] || 0) + 1;
    });
    const topKey = Object.keys(counter).sort((a, b) => counter[b] - counter[a])[0];
    const meta = topKey ? CATEGORY_META[topKey] : null;

    this.setData({
      stats: {
        total: items.length,
        monthly: items.filter((item) => item.addedAt.indexOf(prefix) === 0).length,
        topLabel: meta ? meta.label : '—',
        topEmoji: meta ? meta.emoji : '✨'
      }
    });
  },

  goOutfitDetail(event) {
    const { outfit } = event.detail;
    wx.navigateTo({ url: `/pages/outfit-detail/index?id=${outfit.id}` });
  },

  handleQuickEntry(event) {
    const key = event.currentTarget.dataset.key;
    if (key === 'add') {
      wx.navigateTo({ url: '/pages/add-clothing/index' });
      return;
    }
    if (key === 'wardrobe') {
      wx.switchTab({ url: '/pages/wardrobe/index' });
      return;
    }
    if (key === 'family') {
      wx.navigateTo({ url: '/pages/family/index' });
      return;
    }
    wx.switchTab({ url: '/pages/outfit/index' });
  },

  goMine() {
    wx.switchTab({ url: '/pages/mine/index' });
  },

  goOutfitTab() {
    wx.switchTab({ url: '/pages/outfit/index' });
  }
});
