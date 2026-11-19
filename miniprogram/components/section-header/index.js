Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    subtitle: {
      type: String,
      value: ''
    },
    extra: {
      type: String,
      value: ''
    }
  },

  methods: {
    handleExtra() {
      this.triggerEvent('extra');
    }
  }
});
