Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    handleAgree() {
      this.triggerEvent('agree');
    },

    handleDisagree() {
      this.triggerEvent('disagree');
    },

    openContract() {
      if (wx.openPrivacyContract) {
        wx.openPrivacyContract({
          fail() {
            wx.showToast({ title: '暂时无法打开协议，请稍后再试', icon: 'none' });
          }
        });
        return;
      }
      wx.showToast({ title: '当前版本暂不支持查看协议', icon: 'none' });
    },

    noop() {}
  }
});
