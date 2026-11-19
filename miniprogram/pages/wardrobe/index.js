const store = require('../../utils/store');
const { CATEGORY_LIST } = require('../../utils/category');
const { monthPrefix } = require('../../utils/date');

Page({
  data: {
    items: [],
    wardrobes: [],
    cabinetCounts: {},
    filtered: [],
    monthly: 0,
    keyword: '',
    activeCategory: 'all',
    activeCabinet: 'all',
    hasFilter: false,
    categoryList: CATEGORY_LIST
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const state = store.getState();
    const items = store.getSortedItems();
    const wardrobes = state.wardrobes;

    const cabinetCounts = {};
    items.forEach((item) => {
      cabinetCounts[item.wardrobeId] = (cabinetCounts[item.wardrobeId] || 0) + 1;
    });

    const prefix = monthPrefix();
    this.setData(
      {
        items,
        wardrobes: wardrobes.map((cabinet) =>
          Object.assign({}, cabinet, { count: cabinetCounts[cabinet.id] || 0 })
        ),
        monthly: items.filter((item) => item.addedAt.indexOf(prefix) === 0).length
      },
      () => this.applyFilter()
    );
  },

  applyFilter() {
    const { items, keyword, activeCategory, activeCabinet } = this.data;
    const kw = keyword.trim();
    const filtered = items.filter((item) => {
      const matchCabinet = activeCabinet === 'all' || item.wardrobeId === activeCabinet;
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchKeyword =
        !kw ||
        item.name.indexOf(kw) >= 0 ||
        item.color.indexOf(kw) >= 0 ||
        item.brand.indexOf(kw) >= 0;
      return matchCabinet && matchCategory && matchKeyword;
    });

    this.setData({
      filtered,
      hasFilter: kw.length > 0 || activeCategory !== 'all' || activeCabinet !== 'all'
    });
  },

  handleSearch(event) {
    this.setData({ keyword: event.detail.value }, () => this.applyFilter());
  },

  selectCabinet(event) {
    this.setData({ activeCabinet: event.currentTarget.dataset.id }, () => this.applyFilter());
  },

  selectCategory(event) {
    this.setData({ activeCategory: event.currentTarget.dataset.key }, () => this.applyFilter());
  },

  resetFilter() {
    this.setData(
      { keyword: '', activeCategory: 'all', activeCabinet: 'all' },
      () => this.applyFilter()
    );
  },

  handleFavorite(event) {
    const { item } = event.detail;
    const favorite = store.toggleFavorite(item.id);
    wx.showToast({ title: favorite ? '已标记喜欢' : '已取消喜欢', icon: 'none' });
    this.refresh();
  },

  goDetail(event) {
    const { item } = event.detail;
    wx.navigateTo({ url: `/pages/clothing-detail/index?id=${item.id}` });
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/add-clothing/index' });
  },

  goManage() {
    wx.navigateTo({ url: '/pages/wardrobe-manage/index' });
  }
});
