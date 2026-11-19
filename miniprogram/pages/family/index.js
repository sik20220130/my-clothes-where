const store = require('../../utils/store');
const { familyMembers } = require('../../data/family');

const INVITE_CODE = 'MAGIC-2026';

Page({
  data: {
    inviteCode: INVITE_CODE,
    members: familyMembers,
    wardrobes: [],
    counts: {},
    sharedCount: 0
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const state = store.getState();
    const counts = {};
    state.items.forEach((item) => {
      counts[item.wardrobeId] = (counts[item.wardrobeId] || 0) + 1;
    });
    this.setData({
      wardrobes: state.wardrobes.map((cabinet) =>
        Object.assign({}, cabinet, { count: counts[cabinet.id] || 0 })
      ),
      sharedCount: state.wardrobes.filter((cabinet) => cabinet.isShared).length
    });
  },

  handleCopy() {
    wx.setClipboardData({
      data: INVITE_CODE,
      success() {
        wx.showToast({ title: '邀请码已复制', icon: 'none' });
      },
      fail(error) {
        console.error('[Family] 复制失败:', error);
      }
    });
  },

  handleInvite() {
    const that = this;
    wx.showModal({
      title: '邀请家人',
      content: `把邀请码 ${INVITE_CODE} 发给家人，打开小程序即可加入共享衣橱。\n（演示版为本地模拟共享）`,
      confirmText: '复制邀请码',
      cancelText: '稍后',
      success(res) {
        if (res.confirm) {
          that.handleCopy();
        }
      }
    });
  },

  toggleShare(event) {
    store.toggleCabinetShare(event.currentTarget.dataset.id);
    this.refresh();
  }
});
