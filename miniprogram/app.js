const store = require('./utils/store');

App({
  globalData: {
    // 预留：切换微信云开发时，在此处初始化云环境
    // wx.cloud.init({ env: 'your-env-id', traceUser: true })
    cloudEnabled: false
  },

  onLaunch() {
    // 首次启动写入演示数据（仅本地存储）
    store.ensureSeeded();

    // TODO: 接入微信云开发后，将 utils/store 的数据读写替换为 wx.cloud.database()
    // if (wx.cloud) {
    //   wx.cloud.init({ env: 'your-env-id', traceUser: true });
    //   this.globalData.cloudEnabled = true;
    // }
  }
});
