import React, { useMemo, useState } from 'react';
import { View, Text, Image, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import type { ClothingCategory, ClothingItem } from '@/types/wardrobe';

type SlotKey = 'top' | 'bottom' | 'outer' | 'shoes' | 'extra';

interface SlotMeta {
  key: SlotKey;
  label: string;
  emoji: string;
  categories: ClothingCategory[];
}

const SLOTS: SlotMeta[] = [
  { key: 'top', label: '上装', emoji: '👕', categories: ['top', 'dress'] },
  { key: 'bottom', label: '下装', emoji: '👖', categories: ['bottom'] },
  { key: 'outer', label: '外套', emoji: '🧥', categories: ['outer'] },
  { key: 'shoes', label: '鞋履', emoji: '👟', categories: ['shoes'] },
  { key: 'extra', label: '饰品', emoji: '💍', categories: ['bag', 'accessory'] }
];

const BuildLookPage: React.FC = () => {
  const items = useWardrobeStore((state) => state.items);
  const addLook = useWardrobeStore((state) => state.addLook);

  const [activeSlot, setActiveSlot] = useState<SlotKey>('top');
  const [selected, setSelected] = useState<Partial<Record<SlotKey, string>>>({});
  const [lookName, setLookName] = useState('');

  const activeSlotMeta = SLOTS.find((slot) => slot.key === activeSlot) || SLOTS[0];

  const slotItems = useMemo(
    () => items.filter((item) => activeSlotMeta.categories.includes(item.category)),
    [items, activeSlotMeta]
  );

  const selectedItems = useMemo(
    () =>
      SLOTS.map((slot) => {
        const id = selected[slot.key];
        return id ? items.find((item) => item.id === id) || null : null;
      }).filter((item): item is ClothingItem => item !== null),
    [items, selected]
  );

  const handleSelect = (item: ClothingItem) => {
    setSelected((prev) => {
      const currentId = prev[activeSlot];
      if (currentId === item.id) {
        return { ...prev, [activeSlot]: undefined };
      }
      return { ...prev, [activeSlot]: item.id };
    });
    console.info('[BuildLook] 选择单品:', activeSlot, item.name);
  };

  const handleRemove = (slotKey: SlotKey) => {
    setSelected((prev) => ({ ...prev, [slotKey]: undefined }));
  };

  const handleSave = () => {
    if (selectedItems.length < 2) {
      Taro.showToast({ title: '至少选择 2 件单品', icon: 'none' });
      return;
    }
    addLook({
      id: `look-${Date.now()}`,
      name: lookName.trim() || '我的魔法搭配',
      itemIds: selectedItems.map((item) => item.id),
      createdAt: dayjs().format('YYYY-MM-DD')
    });
    Taro.showToast({ title: '搭配已保存', icon: 'success', duration: 800 });
    setTimeout(() => Taro.navigateBack(), 800);
  };

  return (
    <View className={styles.page}>
      <Text className={styles.title}>搭配工坊</Text>
      <Text className={styles.subtitle}>从上装、下装、外套、饰品中挑选单品，组合今日造型</Text>

      <View className={styles.boardCard}>
        <View className={styles.boardHeader}>
          <Text className={styles.boardTitle}>搭配画板</Text>
          <Text className={styles.boardCount}>已选 {selectedItems.length} 件</Text>
        </View>

        <View className={styles.slots}>
          {SLOTS.map((slot) => {
            const item = selected[slot.key] ? items.find((it) => it.id === selected[slot.key]) : undefined;
            return (
              <View key={slot.key} className={styles.slot}>
                <View
                  className={classnames(styles.slotBox, item && styles.slotBoxFilled)}
                  onClick={() => (item ? handleRemove(slot.key) : setActiveSlot(slot.key))}
                >
                  {item ? (
                    <Image
                      className={styles.slotImage}
                      src={item.image}
                      mode="aspectFill"
                      onError={() => console.error('[BuildLook] 图片加载失败:', item.image)}
                    />
                  ) : (
                    <Text className={styles.slotEmoji}>{slot.emoji}</Text>
                  )}
                </View>
                <Text className={classnames(styles.slotLabel, activeSlot === slot.key && styles.slotLabelActive)}>
                  {slot.label}
                </Text>
              </View>
            );
          })}
        </View>

        <Input
          className={styles.nameInput}
          value={lookName}
          maxlength={16}
          placeholder="给这套搭配起个名字（选填）"
          placeholderClass={styles.placeholder}
          onInput={(event) => setLookName(event.detail.value)}
        />
      </View>

      <ScrollView className={styles.slotTabs} scrollX enableFlex>
        {SLOTS.map((slot) => (
          <View
            key={slot.key}
            className={classnames(styles.slotTab, activeSlot === slot.key && styles.slotTabActive)}
            onClick={() => setActiveSlot(slot.key)}
          >
            {slot.emoji} {slot.label}
          </View>
        ))}
      </ScrollView>

      {slotItems.length > 0 ? (
        <View className={styles.picker}>
          {slotItems.map((item) => {
            const isActive = selected[activeSlot] === item.id;
            return (
              <View
                key={item.id}
                className={classnames(styles.pickerItem, isActive && styles.pickerItemActive)}
                onClick={() => handleSelect(item)}
              >
                <Image
                  className={styles.pickerImage}
                  src={item.image}
                  mode="aspectFill"
                  onError={() => console.error('[BuildLook] 图片加载失败:', item.image)}
                />
                <Text className={styles.pickerName}>{item.name}</Text>
                {isActive ? (
                  <View className={styles.checkBadge}>
                    <Text className={styles.checkText}>✓</Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : (
        <View className={styles.empty}>
          <Text className={styles.emptyText}>这个分类还没有单品，去衣橱添加吧</Text>
        </View>
      )}

      <View className={styles.saveBar}>
        <View
          className={classnames(styles.saveBtn, selectedItems.length < 2 && styles.saveBtnDisabled)}
          onClick={handleSave}
        >
          <Text className={styles.saveText}>保存这套搭配</Text>
        </View>
      </View>
    </View>
  );
};

export default BuildLookPage;
