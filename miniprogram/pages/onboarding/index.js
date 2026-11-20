const store = require('../../utils/store');

const CARDS = [
  {
    type: 'home',
    page: '首页',
    title: '一眼看到衣橱概况',
    desc: '本月新增、分类结构和常穿单品都在这里，点卡片直接进详情。'
  },
  {
    type: 'wardrobe',
    page: '衣橱',
    title: '分类收纳，一搜就到',
    desc: '按衣橱、分类、颜色筛选，输入名字或品牌，几秒找到想穿的那件。'
  },
  {
    type: 'add',
    page: '添加单品',
    title: '拍一张，就入库',
    desc: '拍照后填好名称、分类和衣橱就能保存，品牌和备注可以以后再补。'
  },
  {
    type: 'look',
    page: '搭配',
    title: '搭好一套，直接出门',
    desc: '把常穿的单品组合成搭配保存下来，早上打开就能照着穿。'
  }
];

Page({
  data: {
    cards: CARDS,
    current: 0,
    lastIndex: CARDS.length - 1,
    statusBarHeight: 20,
    skipRight: 40,
    preview: false
  },

  onLoad(options) {
    let statusBarHeight = 20;
    let skipRight = 40;
    try {
      const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      statusBarHeight = info.statusBarHeight || 20;
      // 跳过按钮放在胶囊按钮左侧，避免被遮挡
      if (wx.getMenuButtonBoundingClientRect) {
        const menu = wx.getMenuButtonBoundingClientRect();
        skipRight = Math.max((info.windowWidth || 375) - menu.left + 8, 40);
      }
    } catch (error) {
      console.error('[Onboarding] 读取窗口信息失败:', error);
    }
    this.setData({
      statusBarHeight,
      skipRight,
      preview: !!(options && options.preview === '1')
    });
  },

  handleSwiperChange(event) {
    this.setData({ current: event.detail.current });
  },

  handleNext() {
    if (this.data.current >= this.data.lastIndex) {
      this.handleStart();
      return;
    }
    this.setData({ current: this.data.current + 1 });
  },

  // 跳过：视为完成，写入标记后关闭
  handleSkip() {
    if (!this.data.preview) {
      store.completeOnboarding();
    }
    this.close();
  },

  // 开始使用：写入完成标记并进入首页
  handleStart() {
    if (!this.data.preview) {
      store.completeOnboarding();
    }
    this.close();
  },

  close() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack();
      return;
    }
    wx.switchTab({ url: '/pages/index/index' });
  }
});
