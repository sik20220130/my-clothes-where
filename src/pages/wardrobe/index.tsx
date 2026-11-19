import React, { useMemo, useState } from 'react';
import { View, Text, Input, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import classnames from 'classnames';
import styles from './index.module.scss';
import ClothingCard from '@/components/ClothingCard';
import EmptyState from '@/components/EmptyState';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import { CATEGORY_LIST } from '@/utils/category';
import type { ClothingCategory, ClothingItem } from '@/types/wardrobe';

const WardrobePage: React.FC = () => {
  const items = useWardrobeStore((state) => state.items);
  const wardrobes = useWardrobeStore((state) => state.wardrobes);
  const [keyword, setKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState<ClothingCategory | 'all'>('all');
  const [activeCabinet, setActiveCabinet] = useState<string>('all');

  const cabinetCounts = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((item) => {
      map[item.wardrobeId] = (map[item.wardrobeId] || 0) + 1;
    });
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    const kw = keyword.trim();
    return items.filter((item) => {
      const matchCabinet = activeCabinet === 'all' || item.wardrobeId === activeCabinet;
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchKeyword =
        !kw || item.name.includes(kw) || item.color.includes(kw) || item.brand.includes(kw);
      return matchCabinet && matchCategory && matchKeyword;
    });
  }, [items, keyword, activeCategory, activeCabinet]);

  const monthly = useMemo(() => {
    const monthPrefix = dayjs().format('YYYY-MM');
    return items.filter((item) => item.addedAt.startsWith(monthPrefix)).length;
  }, [items]);

  const goDetail = (item: ClothingItem) => {
    Taro.navigateTo({ url: `/pages/clothing-detail/index?id=${item.id}` });
  };

  const goAdd = () => {
    Taro.navigateTo({ url: '/pages/add-clothing/index' });
  };

  const goManage = () => {
    Taro.navigateTo({ url: '/pages/wardrobe-manage/index' });
  };

  const resetFilter = () => {
    setKeyword('');
    setActiveCategory('all');
    setActiveCabinet('all');
  };

  const hasFilter =
    keyword.trim().length > 0 || activeCategory !== 'all' || activeCabinet !== 'all';

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <View>
            <Text className={styles.title}>我的衣橱</Text>
            <Text className={styles.subtitle}>
              共 {items.length} 件单品 · {wardrobes.length} 个衣橱 · 本月新增 {monthly} 件
            </Text>
          </View>
          <View className={styles.manage} onClick={goManage}>
            <Text className={styles.manageText}>衣橱管理</Text>
          </View>
        </View>

        <ScrollView className={styles.cabinetScroll} scrollX enableFlex>
          <View
            className={classnames(
              styles.cabinetCard,
              styles.allCard,
              activeCabinet === 'all' && styles.cabinetCardActive
            )}
            onClick={() => setActiveCabinet('all')}
          >
            <View className={styles.allContent}>
              <Text className={styles.allTitle}>全部衣橱</Text>
              <Text className={styles.allSub}>{items.length} 件单品</Text>
            </View>
          </View>
          {wardrobes.map((cabinet) => (
            <View
              key={cabinet.id}
              className={classnames(
                styles.cabinetCard,
                activeCabinet === cabinet.id && styles.cabinetCardActive
              )}
              onClick={() => setActiveCabinet(cabinet.id)}
            >
              <Image
                className={styles.cabinetCover}
                src={cabinet.cover}
                mode="aspectFill"
                onError={() => console.error('[Wardrobe] 衣橱图片加载失败:', cabinet.cover)}
              />
              <View className={styles.cabinetMask} />
              <View className={styles.cabinetContent}>
                <Text className={styles.cabinetTitle}>{cabinet.name}</Text>
                <Text className={styles.cabinetSub}>{cabinetCounts[cabinet.id] || 0} 件</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View className={styles.searchWrap}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            value={keyword}
            placeholder="搜索单品名称 / 颜色 / 品牌"
            placeholderClass={styles.searchPlaceholder}
            confirmType="search"
            onInput={(event) => setKeyword(event.detail.value)}
          />
        </View>

        <ScrollView className={styles.chips} scrollX enableFlex>
          {CATEGORY_LIST.map((category) => (
            <View
              key={category.key}
              className={classnames(styles.chip, activeCategory === category.key && styles.chipActive)}
              onClick={() => setActiveCategory(category.key)}
            >
              {category.label}
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.summary}>
        <Text className={styles.summaryText}>{filtered.length} 件单品</Text>
        {hasFilter ? (
          <Text className={styles.clearText} onClick={resetFilter}>
            清除筛选
          </Text>
        ) : null}
      </View>

      {filtered.length > 0 ? (
        <View className={styles.grid}>
          {filtered.map((item) => (
            <View key={item.id} className={styles.gridItem}>
              <ClothingCard item={item} onClick={goDetail} />
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          emoji={items.length === 0 ? '🪄' : '🔎'}
          title={items.length === 0 ? '衣橱还空着' : '没有找到相关单品'}
          description={
            items.length === 0 ? '拍下你的第一件单品，开始施展收纳魔法' : '试试更换关键词、品类或衣橱筛选'
          }
          actionText={items.length === 0 ? '添加第一件单品' : '清除筛选'}
          onAction={items.length === 0 ? goAdd : resetFilter}
        />
      )}

      <View className={styles.fab} onClick={goAdd}>
        <Text className={styles.fabText}>+</Text>
      </View>
    </View>
  );
};

export default WardrobePage;
