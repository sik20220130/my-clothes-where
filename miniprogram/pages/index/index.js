const store = require('../../utils/store');
const { greeting, formatMD, weekLabel, monthPrefix } = require('../../utils/date');

const AVATAR = 'https://picsum.photos/id/64/200/200';

const QUICK_ENTRIES = [
  { key: 'add', icon: 'camera', label: '拍照收纳' },
  { key: 'wardrobe', icon: 'hanger', label: '我的衣橱' },
  { key: 'outfit', icon: 'sparkle', label: '我的搭配' }
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
      wardrobeCount: 0
    },
    recentItems: [],
    isEmpty: true
  },

  onLoad() {
    this.setData({
      greeting: greeting(),
      todayText: `${formatMD()} ${weekLabel()}`
    });
    this.maybeShowOnboarding();
  },

  // 首次进入：未完成引导且没有单品时展示教学卡片
  maybeShowOnboarding() {
    if (this.onboardingChecked) return;
    this.onboardingChecked = true;
    const app = getApp();
    const ready = app.globalData && app.globalData.readyPromise;
    const check = () => {
      if (store.isOnboardingNeeded()) {
        wx.navigateTo({ url: '/pages/onboarding/index' });
      }
    };
    if (ready && typeof ready.then === 'function') {
      ready.then(check, check);
      return;
    }
    setTimeout(check, 300);
  },

  onShow() {
    this.refreshStats();
  },

  refreshStats() {
    const state = store.getState();
    const items = state.items;
    const prefix = monthPrefix();
    const recentItems = items
      .slice()
      .sort((a, b) => String(b.addedAt).localeCompare(String(a.addedAt)))
      .slice(0, 6);

    this.setData({
      isEmpty: items.length === 0,
      recentItems,
      stats: {
        total: items.length,
        monthly: items.filter((item) => item.addedAt.indexOf(prefix) === 0).length,
        wardrobeCount: state.wardrobes.length
      }
    });
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
    wx.switchTab({ url: '/pages/outfit/index' });
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/add-clothing/index' });
  },

  goItemDetail(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/clothing-detail/index?id=${id}` });
  },

  goWardrobe() {
    wx.switchTab({ url: '/pages/wardrobe/index' });
  },

  goMine() {
    wx.switchTab({ url: '/pages/mine/index' });
  }
});
