const store = require('../../utils/store');
const { CATEGORY_LIST } = require('../../utils/category');

Page({
  data: {
    items: [],
    wardrobes: [],
    cabinetCounts: {},
    filtered: [],
    keyword: '',
    activeCategory: 'all',
    activeCabinet: 'all',
    favoriteOnly: false,
    hasFilter: false,
    categoryList: CATEGORY_LIST
  },

  onShow() {
    const app = getApp();
    const filter = app.globalData.wardrobeFilter;
    if (filter === '__favorite__') {
      app.globalData.wardrobeFilter = null;
      this.setData({
        favoriteOnly: true,
        activeCabinet: 'all',
        keyword: '',
        activeCategory: 'all'
      });
    }
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

    const activeCabinet = this.data.activeCabinet;
    const cabinetExists = wardrobes.some((cabinet) => cabinet.id === activeCabinet);
    this.setData(
      {
        items,
        activeCabinet:
          activeCabinet === 'all' || cabinetExists ? activeCabinet : 'all',
        wardrobes: wardrobes.map((cabinet) =>
          Object.assign({}, cabinet, { count: cabinetCounts[cabinet.id] || 0 })
        )
      },
      () => this.applyFilter()
    );
  },

  applyFilter() {
    const { items, keyword, activeCategory, activeCabinet, favoriteOnly } = this.data;
    const kw = keyword.trim();
    const filtered = items.filter((item) => {
      const matchCabinet = activeCabinet === 'all' || item.wardrobeId === activeCabinet;
      const matchFavorite = !favoriteOnly || !!item.favorite;
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchKeyword =
        !kw ||
        item.name.indexOf(kw) >= 0 ||
        item.color.indexOf(kw) >= 0 ||
        item.brand.indexOf(kw) >= 0;
      return matchCabinet && matchFavorite && matchCategory && matchKeyword;
    });

    this.setData({
      filtered,
      hasFilter:
        kw.length > 0 || activeCategory !== 'all' || activeCabinet !== 'all' || favoriteOnly
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

  toggleFavoriteFilter() {
    this.setData({ favoriteOnly: !this.data.favoriteOnly }, () => this.applyFilter());
  },

  resetFilter() {
    this.setData(
      { keyword: '', activeCategory: 'all', activeCabinet: 'all', favoriteOnly: false },
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

  handleLoadSample() {
    const that = this;
    wx.showModal({
      title: '载入示例数据',
      content: '将写入一组内置示例衣橱与单品，方便快速体验。确定继续吗？',
      confirmText: '载入',
      confirmColor: '#7b5bd6',
      success(res) {
        if (!res.confirm) return;
        store.loadSampleData().then(() => {
          that.refresh();
          wx.showToast({ title: '示例数据已载入', icon: 'none' });
        });
      }
    });
  },

  goManage() {
    wx.navigateTo({ url: '/pages/wardrobe-manage/index' });
  }
});
