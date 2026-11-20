const store = require('../../utils/store');

const AVATAR = 'https://picsum.photos/id/64/200/200';

const MENU_LIST = [
  { key: 'favorites', icon: 'heart', label: '我喜欢的单品', desc: '喜欢的衣物在衣橱里优先展示' },
  { key: 'wardrobe', icon: 'hanger', label: '衣橱管理', desc: '拍照上传、整理与转移单品' },
  { key: 'settings', icon: 'gear', label: '设置', desc: '数据管理与关于' }
];

Page({
  data: {
    avatar: AVATAR,
    menuList: MENU_LIST,
    stats: [
      { label: '衣橱单品', value: 0 },
      { label: '衣橱数量', value: 0 },
      { label: '我的搭配', value: 0 }
    ]
  },

  onShow() {
    const state = store.getState();
    this.setData({
      stats: [
        { label: '衣橱单品', value: state.items.length },
        { label: '衣橱数量', value: state.wardrobes.length },
        { label: '我的搭配', value: state.looks.length }
      ]
    });
  },

  handleMenu(event) {
    const key = event.currentTarget.dataset.key;
    if (key === 'favorites') {
      getApp().globalData.wardrobeFilter = '__favorite__';
      wx.switchTab({ url: '/pages/wardrobe/index' });
      return;
    }
    if (key === 'wardrobe') {
      wx.navigateTo({ url: '/pages/wardrobe-manage/index' });
      return;
    }
    wx.navigateTo({ url: '/pages/settings/index' });
  },

  handleAbout() {
    wx.showModal({
      title: '关于我的衣服在哪',
      content: '我的衣服在哪（简称：衣服在哪）v1.0.0\n衣物收纳、搭配记录与多衣橱管理，一站式打理你的衣橱。',
      showCancel: false,
      confirmText: '知道啦'
    });
  }
});
