import React, { useMemo, useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import OutfitCard from '@/components/OutfitCard';
import { outfits } from '@/data/outfits';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import { SCENE_LIST, CATEGORY_META } from '@/utils/category';
import type { ClothingCategory, ClothingItem, CustomLook, OutfitItem, OutfitScene } from '@/types/wardrobe';

interface MagicLook {
  key: string;
  items: ClothingItem[];
}

const OutfitPage: React.FC = () => {
  const wardrobe = useWardrobeStore((state) => state.items);
  const looks = useWardrobeStore((state) => state.looks);
  const removeLook = useWardrobeStore((state) => state.removeLook);
  const [scene, setScene] = useState<OutfitScene | 'all'>('all');
  const [magic, setMagic] = useState<MagicLook | null>(null);

  const filtered = useMemo(
    () => outfits.filter((outfit) => scene === 'all' || outfit.scene === scene),
    [scene]
  );

  const pickRandom = (category: ClothingCategory): ClothingItem | null => {
    const pool = wardrobe.filter((item) => item.category === category);
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleMagic = () => {
    const picked = [pickRandom('top'), pickRandom('bottom'), pickRandom('shoes')].filter(
      Boolean
    ) as ClothingItem[];
    if (picked.length < 2) {
      Taro.showToast({ title: '衣橱单品不足，先添加几件吧', icon: 'none' });
      return;
    }
    setMagic({ key: `${Date.now()}`, items: picked });
    console.info('[Outfit] 生成魔法搭配:', picked.map((item) => item.name).join(' + '));
  };

  const goDetail = (outfit: OutfitItem) => {
    Taro.navigateTo({ url: `/pages/outfit-detail/index?id=${outfit.id}` });
  };

  const goClothing = (item: ClothingItem) => {
    Taro.navigateTo({ url: `/pages/clothing-detail/index?id=${item.id}` });
  };

  const goBuildLook = () => {
    Taro.navigateTo({ url: '/pages/build-look/index' });
  };

  const lookItems = (look: CustomLook): ClothingItem[] =>
    look.itemIds
      .map((itemId) => wardrobe.find((item) => item.id === itemId))
      .filter((item): item is ClothingItem => Boolean(item));

  const handleRemoveLook = (look: CustomLook) => {
    Taro.showModal({
      title: '删除搭配',
      content: `确定删除「${look.name}」吗？`,
      confirmText: '删除',
      confirmColor: '#f53f3f'
    })
      .then((res) => {
        if (res.confirm) {
          removeLook(look.id);
          Taro.showToast({ title: '已删除', icon: 'none' });
        }
      })
      .catch((error) => console.error('[Outfit] 删除搭配失败:', error));
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>搭配灵感</Text>
        <Text className={styles.subtitle}>让魔镜为你生成今日造型</Text>
      </View>

      <View className={styles.looksSection}>
        <View className={styles.looksHeader}>
          <Text className={styles.looksTitle}>我的搭配</Text>
          <Text className={styles.looksMore} onClick={goBuildLook}>
            去搭配 ›
          </Text>
        </View>
        <ScrollView className={styles.lookScroll} scrollX enableFlex>
          <View className={styles.createCard} onClick={goBuildLook}>
            <Text className={styles.createIcon}>＋</Text>
            <Text className={styles.createText}>新建搭配</Text>
          </View>
          {looks.map((look) => {
            const items = lookItems(look);
            return (
              <View key={look.id} className={styles.lookCard}>
                <View className={styles.lookImages}>
                  {items.slice(0, 3).map((item) => (
                    <Image
                      key={item.id}
                      className={styles.lookImage}
                      src={item.image}
                      mode="aspectFill"
                      onError={() => console.error('[Outfit] 搭配图片加载失败:', item.image)}
                    />
                  ))}
                </View>
                <View className={styles.lookFooter}>
                  <Text className={styles.lookName}>{look.name}</Text>
                  <Text className={styles.lookDelete} onClick={() => handleRemoveLook(look)}>
                    删除
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View className={styles.magicBanner}>
        <View className={styles.magicBannerText}>
          <Text className={styles.magicTitle}>✨ 魔法搭配</Text>
          <Text className={styles.magicDesc}>基于你的衣橱，随机组合一套今日造型</Text>
        </View>
        <View className={styles.magicBtn} onClick={handleMagic}>
          <Text className={styles.magicBtnText}>一键搭配</Text>
        </View>
      </View>

      {magic ? (
        <View className={styles.magicResult}>
          <View className={styles.magicResultHeader}>
            <Text className={styles.magicResultTitle}>今日魔法造型</Text>
            <Text className={styles.magicRefresh} onClick={handleMagic}>
              换一组
            </Text>
          </View>
          <View className={styles.magicList}>
            {magic.items.map((item) => (
              <View key={`${magic.key}-${item.id}`} className={styles.magicItem} onClick={() => goClothing(item)}>
                <Image
                  className={styles.magicImage}
                  src={item.image}
                  mode="aspectFill"
                  onError={() => console.error('[Outfit] 搭配单品图片加载失败:', item.image)}
                />
                <Text className={styles.magicName}>{item.name}</Text>
                <Text className={styles.magicCategory}>{CATEGORY_META[item.category].label}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <ScrollView className={styles.chips} scrollX enableFlex>
        {SCENE_LIST.map((item) => (
          <View
            key={item.key}
            className={`${styles.chip} ${scene === item.key ? styles.chipActive : ''}`}
            onClick={() => setScene(item.key)}
          >
            {item.label}
          </View>
        ))}
      </ScrollView>

      <View className={styles.list}>
        {filtered.map((outfit) => (
          <View key={outfit.id} className={styles.listItem}>
            <OutfitCard outfit={outfit} onClick={goDetail} />
          </View>
        ))}
      </View>
    </View>
  );
};

export default OutfitPage;
