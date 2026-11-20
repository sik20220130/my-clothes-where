import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import type { ClothingItem } from '@/types/wardrobe';
import { CATEGORY_META } from '@/utils/category';
import styles from './index.module.scss';

interface ClothingCardProps {
  item: ClothingItem;
  onClick?: (item: ClothingItem) => void;
}

const ClothingCard: React.FC<ClothingCardProps> = ({ item, onClick }) => {
  const handleError = () => {
    console.error('[ClothingCard] 图片加载失败:', item.image);
  };

  return (
    <View className={styles.card} onClick={() => onClick?.(item)}>
      <View className={styles.imageWrap}>
        <Image className={styles.image} src={item.image} mode="aspectFill" onError={handleError} />
        <View className={styles.badge}>
          <Text className={styles.badgeText}>{CATEGORY_META[item.category].label}</Text>
        </View>
      </View>
      <View className={styles.info}>
        <Text className={styles.name}>{item.name}</Text>
        <View className={styles.metaRow}>
          <View className={styles.colorDot} style={{ backgroundColor: item.colorHex }} />
          <Text className={styles.colorName}>{item.color}</Text>
          <Text className={styles.wearCount}>穿过 {item.wearCount} 次</Text>
        </View>
      </View>
    </View>
  );
};

export default ClothingCard;
