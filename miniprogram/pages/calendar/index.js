const store = require('../../utils/store');
const { formatMD, weekLabel } = require('../../utils/date');
const { CATEGORY_META } = require('../../utils/category');

Page({
  data: {
    groups: [],
    total: 0
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const items = store
      .getState()
      .items.slice()
      .sort((a, b) => String(b.addedAt).localeCompare(String(a.addedAt)));

    const map = {};
    const dates = [];
    items.forEach((item) => {
      const key = item.addedAt || '未记录';
      if (!map[key]) {
        map[key] = [];
        dates.push(key);
      }
      map[key].push(item);
    });

    const groups = dates.map((date) => {
      const parsed = new Date(String(date).replace(/-/g, '/'));
      const valid = !isNaN(parsed.getTime());
      return {
        date,
        label: valid ? formatMD(parsed) : '未记录日期',
        week: valid ? weekLabel(parsed) : '',
        items: map[date].map((item) =>
          Object.assign({}, item, {
            categoryLabel: (CATEGORY_META[item.category] || {}).label || item.category
          })
        )
      };
    });

    this.setData({ groups, total: items.length });
  },

  goDetail(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/clothing-detail/index?id=${id}` });
  }
});
