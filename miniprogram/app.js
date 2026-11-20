const store = require('./utils/store');

App({
  globalData: {
    // 衣橱管理页跳转衣橱列表时携带的筛选条件
    wardrobeFilter: null,
    // 微信云开发环境
    cloudEnv: 'cloud1-d5ghmekgecd229e76',
    cloudEnabled: false,
    // 隐私授权等待中的 resolve 回调
    privacyResolve: null,
    // 数据初始化（含云端合并）完成信号
    readyPromise: null
  },

  onLaunch() {
    this.listenPrivacyAuthorization();
    // 初始化云开发并把云端数据同步到本地缓存
    this.globalData.readyPromise = store.init().then((ready) => {
      this.globalData.cloudEnabled = ready;
      if (ready) {
        console.info('[Wardrobe] 云开发已连接:', this.globalData.cloudEnv);
      }
      return ready;
    });
  },

  // 需要隐私授权时，通知当前页面展示自定义隐私弹窗
  listenPrivacyAuthorization() {
    if (!wx.onNeedPrivacyAuthorization) return;
    wx.onNeedPrivacyAuthorization((resolve) => {
      this.globalData.privacyResolve = resolve;
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      if (current && typeof current.showPrivacyPopup === 'function') {
        current.showPrivacyPopup();
        return;
      }
      // 页面没有隐私弹窗时直接拒绝，避免流程卡住
      resolve({ event: 'disagree' });
    });
  },

  resolvePrivacy(agree) {
    const resolve = this.globalData.privacyResolve;
    if (!resolve) return;
    this.globalData.privacyResolve = null;
    resolve({ event: agree ? 'agree' : 'disagree' });
  }
});
