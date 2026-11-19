import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import EmptyState from '@/components/EmptyState';
import { outfits } from '@/data/outfits';
import { SCENE_META } from '@/utils/category';

const OutfitDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id || '';
  const outfit = outfits.find((item) => item.id === id);
  const [liked, setLiked] = useState(false);

  if (!outfit) {
    return (
      <View className={styles.page}>
        <EmptyState
          emoji="🔮"
          title="搭配不存在"
          description="这套搭配可能已经飞走了"
          actionText="返回灵感"
          onAction={() => Taro.navigateBack()}
        />
      </View>
    );
  }

  const handleToggleLike = () => {
    setLiked((prev) => !prev);
    console.info('[OutfitDetail] 收藏状态:', !liked);
  };

  return (
    <View className={styles.page}>
      <Image
        className={styles.cover}
        src={outfit.cover}
        mode="aspectFill"
        onError={() => console.error('[OutfitDetail] 图片加载失败:', outfit.cover)}
      />

      <View className={styles.content}>
        <View className={styles.card}>
          <View className={styles.sceneBadge}>
            <Text className={styles.sceneText}>
              {SCENE_META[outfit.scene].emoji} {SCENE_META[outfit.scene].label}
            </Text>
          </View>
          <Text className={styles.title}>{outfit.title}</Text>
          <Text className={styles.author}>来自 {outfit.author}</Text>

          <View className={styles.tags}>
            {outfit.tags.map((tag) => (
              <Text key={tag} className={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.sectionTitle}>搭配灵感</Text>
          <Text className={styles.description}>{outfit.description}</Text>
        </View>

        <View className={styles.card}>
          <Text className={styles.sectionTitle}>单品清单</Text>
          {outfit.itemNames.map((name, index) => (
            <View key={name} className={styles.itemRow}>
              <View className={styles.itemIndex}>
                <Text className={styles.itemIndexText}>{index + 1}</Text>
              </View>
              <Text className={styles.itemName}>{name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.actionBar}>
        <View className={styles.likeBtn} onClick={handleToggleLike}>
          <Text className={styles.likeText}>
            {liked ? '❤️' : '🤍'} {liked ? '已收藏' : '收藏这套搭配'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default OutfitDetailPage;
