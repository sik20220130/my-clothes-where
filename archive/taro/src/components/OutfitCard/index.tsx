import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import type { OutfitItem } from '@/types/wardrobe';
import { SCENE_META } from '@/utils/category';
import styles from './index.module.scss';

interface OutfitCardProps {
  outfit: OutfitItem;
  variant?: 'list' | 'grid';
  onClick?: (outfit: OutfitItem) => void;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, variant = 'list', onClick }) => {
  const handleError = () => {
    console.error('[OutfitCard] 图片加载失败:', outfit.cover);
  };

  return (
    <View className={classnames(styles.card, variant === 'grid' && styles.gridCard)} onClick={() => onClick?.(outfit)}>
      <View className={styles.coverWrap}>
        <Image className={styles.cover} src={outfit.cover} mode="aspectFill" onError={handleError} />
        <View className={styles.mask} />
        <View className={styles.coverBottom}>
          <Text className={styles.scene}>
            {SCENE_META[outfit.scene].emoji} {SCENE_META[outfit.scene].label}
          </Text>
          <Text className={styles.likes}>♥ {outfit.likes}</Text>
        </View>
      </View>
      <View className={styles.info}>
        <Text className={styles.title}>{outfit.title}</Text>
        <View className={styles.tags}>
          {outfit.tags.map((tag) => (
            <Text key={tag} className={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

export default OutfitCard;
