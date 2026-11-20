const store = require('../../utils/store');
const { formatYMD } = require('../../utils/date');

const SLOTS = [
  { key: 'top', label: '上装', emoji: '👕', categories: ['top', 'dress'] },
  { key: 'bottom', label: '下装', emoji: '👖', categories: ['bottom'] },
  { key: 'outer', label: '外套', emoji: '🧥', categories: ['outer'] },
  { key: 'shoes', label: '鞋履', emoji: '👟', categories: ['shoes'] },
  { key: 'extra', label: '饰品', emoji: '💍', categories: ['bag', 'accessory'] }
];

Page({
  data: {
    slots: SLOTS,
    activeSlot: 'top',
    lookName: '',
    boardSlots: [],
    selectedCount: 0,
    pickerItems: [],
    saveDisabled: true
  },

  onLoad(options) {
    this.items = store.getSortedItems();
    this.selected = {};
    const editingLook = options && options.id ? store.getLook(options.id) : null;
    if (editingLook) {
      this.editingLook = editingLook;
      wx.setNavigationBarTitle({ title: '编辑搭配' });
      (editingLook.itemIds || []).forEach((id) => {
        const item = this.items.find((it) => it.id === id);
        if (!item) return;
        const slot = SLOTS.find((current) => current.categories.indexOf(item.category) >= 0);
        if (slot && !this.selected[slot.key]) {
          this.selected[slot.key] = id;
        }
      });
      this.setData({
        lookName: editingLook.name === '我的搭配' ? '' : editingLook.name
      });
    }
    this.syncView();
  },

  syncView() {
    const items = this.items;
    const selected = this.selected;
    const activeSlot = this.data.activeSlot;
    const activeMeta = SLOTS.find((slot) => slot.key === activeSlot) || SLOTS[0];

    const boardSlots = SLOTS.map((slot) => {
      const id = selected[slot.key];
      const item = id ? items.find((it) => it.id === id) : null;
      return {
        key: slot.key,
        label: slot.label,
        emoji: slot.emoji,
        image: item ? item.image : ''
      };
    });

    const pickerItems = items
      .filter((item) => activeMeta.categories.indexOf(item.category) >= 0)
      .map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        active: selected[activeSlot] === item.id
      }));

    const selectedCount = SLOTS.filter((slot) => selected[slot.key]).length;

    this.setData({
      boardSlots,
      pickerItems,
      selectedCount,
      saveDisabled: selectedCount < 2
    });
  },

  handleSlotTap(event) {
    const key = event.currentTarget.dataset.key;
    if (this.selected[key]) {
      delete this.selected[key];
      this.syncView();
      return;
    }
    this.setData({ activeSlot: key }, () => this.syncView());
  },

  selectSlotTab(event) {
    this.setData({ activeSlot: event.currentTarget.dataset.key }, () => this.syncView());
  },

  handlePickerSelect(event) {
    const id = event.currentTarget.dataset.id;
    const activeSlot = this.data.activeSlot;
    this.selected[activeSlot] = this.selected[activeSlot] === id ? undefined : id;
    if (!this.selected[activeSlot]) {
      delete this.selected[activeSlot];
    }
    this.syncView();
  },

  handleNameInput(event) {
    this.setData({ lookName: event.detail.value });
  },

  handleSave() {
    const selectedItems = SLOTS.map((slot) => this.selected[slot.key])
      .filter(Boolean)
      .map((id) => this.items.find((item) => item.id === id))
      .filter(Boolean);

    if (selectedItems.length < 2) {
      wx.showToast({ title: '至少选择 2 件单品', icon: 'none' });
      return;
    }

    const name = this.data.lookName.trim() || '我的搭配';
    const itemIds = selectedItems.map((item) => item.id);

    if (this.editingLook) {
      store.updateLook({ id: this.editingLook.id, name, itemIds });
      wx.showToast({ title: '搭配已更新', icon: 'success', duration: 800 });
    } else {
      store.addLook({
        id: `look-${Date.now()}`,
        name,
        itemIds,
        createdAt: formatYMD()
      });
      wx.showToast({ title: '搭配已保存', icon: 'success', duration: 800 });
    }
    setTimeout(() => wx.navigateBack(), 800);
  }
});
