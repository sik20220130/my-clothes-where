import React, { useMemo, useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import OutfitCard from '@/components/OutfitCard';
import SectionHeader from '@/components/SectionHeader';
import { outfits } from '@/data/outfits';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import type { ClothingCategory, OutfitItem } from '@/types/wardrobe';
import { CATEGORY_META } from '@/utils/category';

const AVATAR = 'https://picsum.photos/id/64/200/200';

const QUICK_ENTRIES: Array<{ key: string; emoji: string; label: string }> = [
  { key: 'add', emoji: '📷', label: '拍照收纳' },
  { key: 'wardrobe', emoji: '👗', label: '我的衣橱' },
  { key: 'family', emoji: '👨‍👩‍👧', label: '家庭共享' },
  { key: 'outfit', emoji: '✨', label: '搭配灵感' }
];

const WEEK_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function getGreeting(): string {
  const hour = dayjs().hour();
  if (hour < 6) return '夜深了';
  if (hour < 11) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

const HomePage: React.FC = () => {
  const items = useWardrobeStore((state) => state.items);
  const [heroIndex, setHeroIndex] = useState(0);

  const heroList = useMemo<OutfitItem[]>(() => outfits.slice(0, 3), []);
  const inspirations = useMemo(() => outfits.slice(3, 7), []);
  const greeting = useMemo(() => getGreeting(), []);
  const hero = heroList[heroIndex];

  const todayText = `${dayjs().format('M月D日')} ${WEEK_LABELS[dayjs().day()]}`;

  const stats = useMemo(() => {
    const monthPrefix = dayjs().format('YYYY-MM');
    const monthly = items.filter((item) => item.addedAt.startsWith(monthPrefix)).length;
    const counter: Record<string, number> = {};
    items.forEach((item) => {
      counter[item.category] = (counter[item.category] ?? 0) + 1;
    });
    const topKey = Object.keys(counter).sort((a, b) => counter[b] - counter[a])[0] as
      | ClothingCategory
      | undefined;
    return {
      total: items.length,
      monthly,
      topLabel: topKey ? CATEGORY_META[topKey].label : '—',
      topEmoji: topKey ? CATEGORY_META[topKey].emoji : '✨'
    };
  }, [items]);

  const goOutfitDetail = (outfit: OutfitItem) => {
    Taro.navigateTo({ url: `/pages/outfit-detail/index?id=${outfit.id}` });
  };

  const handleSwitchHero = () => {
    setHeroIndex((index) => (index + 1) % heroList.length);
  };

  const handleQuickEntry = (key: string) => {
    if (key === 'add') {
      Taro.navigateTo({ url: '/pages/add-clothing/index' });
      return;
    }
    if (key === 'wardrobe') {
      Taro.switchTab({ url: '/pages/wardrobe/index' });
      return;
    }
    if (key === 'family') {
      Taro.navigateTo({ url: '/pages/family/index' });
      return;
    }
    Taro.switchTab({ url: '/pages/outfit/index' });
  };

  const goMine = () => {
    Taro.switchTab({ url: '/pages/mine/index' });
  };

  const goOutfitTab = () => {
    Taro.switchTab({ url: '/pages/outfit/index' });
  };

  const handleHeroError = () => {
    console.error('[Home] 今日搭配图片加载失败:', hero.cover);
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.topRow}>
          <View className={styles.greetWrap}>
            <Text className={styles.greeting}>{greeting}，小魔仙 ✨</Text>
            <Text className={styles.subText}>{todayText} · 上海 · 晴 18°C</Text>
          </View>
          <View className={styles.avatarWrap} onClick={goMine}>
            <Image className={styles.avatar} src={AVATAR} mode="aspectFill" />
          </View>
        </View>
      </View>

      <View className={styles.body}>
        <View className={styles.hero} onClick={() => goOutfitDetail(hero)}>
          <Image className={styles.heroImage} src={hero.cover} mode="aspectFill" onError={handleHeroError} />
          <View className={styles.heroMask} />
          <View className={styles.heroContent}>
            <View className={styles.heroBadge}>
              <Text className={styles.heroBadgeText}>✨ AI 今日魔法搭配</Text>
            </View>
            <Text className={styles.heroTitle}>{hero.title}</Text>
            <View className={styles.heroTags}>
              {hero.tags.map((tag) => (
                <Text key={tag} className={styles.heroTag}>
                  #{tag}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.heroActions}>
          <View className={styles.heroBtnGhost} onClick={handleSwitchHero}>
            <Text className={styles.heroBtnGhostText}>换一套</Text>
          </View>
          <View className={styles.heroBtn} onClick={() => goOutfitDetail(hero)}>
            <Text className={styles.heroBtnText}>查看详情</Text>
          </View>
        </View>

        <View className={styles.quickCard}>
          {QUICK_ENTRIES.map((entry) => (
            <View key={entry.key} className={styles.quickItem} onClick={() => handleQuickEntry(entry.key)}>
              <View className={styles.quickEmojiWrap}>
                <Text className={styles.quickEmoji}>{entry.emoji}</Text>
              </View>
              <Text className={styles.quickLabel}>{entry.label}</Text>
            </View>
          ))}
        </View>

        <View className={styles.statsCard}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.total}</Text>
            <Text className={styles.statLabel}>衣橱单品</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.monthly}</Text>
            <Text className={styles.statLabel}>本月新增</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.topEmoji}</Text>
            <Text className={styles.statLabel}>常穿 {stats.topLabel}</Text>
          </View>
        </View>

        <View className={styles.section}>
          <SectionHeader title="今日灵感" subtitle="魔镜说这样穿最好看" extra="更多" onExtraClick={goOutfitTab} />
          <View className={styles.inspirationGrid}>
            {inspirations.map((outfit) => (
              <View key={outfit.id} className={styles.gridItem}>
                <OutfitCard outfit={outfit} variant="grid" onClick={goOutfitDetail} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomePage;
