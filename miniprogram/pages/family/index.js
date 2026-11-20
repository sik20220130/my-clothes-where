const store = require('../../utils/store');

const INVITE_CODE = 'MAGIC-2026';
const DEFAULT_AVATAR = '/assets/avatar/default.png';

Page({
  data: {
    inviteCode: INVITE_CODE,
    members: [],
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
      members: store.getMembers(),
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
      editable: true,
      placeholderText: '输入家人称呼，如：妈妈',
      confirmText: '加入',
      cancelText: '取消',
      success(res) {
        if (!res.confirm) return;
        const name = (res.content || '').trim();
        if (!name) {
          wx.showToast({ title: '请填写家人称呼', icon: 'none' });
          return;
        }
        store.addMember({
          id: `f-${Date.now()}`,
          name,
          avatar: DEFAULT_AVATAR,
          role: '家庭成员'
        });
        that.refresh();
        wx.showToast({ title: '已加入家庭', icon: 'success' });
      }
    });
  },

  handleRemove(event) {
    const { id, name } = event.currentTarget.dataset;
    if (store.getMembers().length <= 1) {
      wx.showToast({ title: '至少保留一位成员', icon: 'none' });
      return;
    }
    const that = this;
    wx.showModal({
      title: '移除成员',
      content: `确定将「${name}」移出家庭吗？`,
      confirmText: '移除',
      confirmColor: '#f53f3f',
      success(res) {
        if (!res.confirm) return;
        if (store.removeMember(id)) {
          that.refresh();
          wx.showToast({ title: '已移除', icon: 'none' });
        }
      }
    });
  },

  toggleShare(event) {
    store.toggleCabinetShare(event.currentTarget.dataset.id);
    this.refresh();
  }
});
