import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useWardrobeStore } from '@/store/useWardrobeStore';

const AVATAR = 'https://picsum.photos/id/64/200/200';

const MENU_LIST: Array<{ key: string; emoji: string; label: string; desc: string }> = [
  { key: 'favorites', emoji: '💖', label: '我的收藏', desc: '喜欢的搭配都在这里' },
  { key: 'wardrobe', emoji: '👚', label: '衣橱管理', desc: '拍照上传、整理与转移单品' },
  { key: 'family', emoji: '👨‍👩‍👧', label: '家庭共享', desc: '一家人共享同一个衣橱' },
  { key: 'calendar', emoji: '📅', label: '穿搭日历', desc: '记录每天的穿搭灵感' },
  { key: 'settings', emoji: '⚙️', label: '设置', desc: '偏好、通知与隐私' }
];

const MinePage: React.FC = () => {
  const items = useWardrobeStore((state) => state.items);
  const wardrobes = useWardrobeStore((state) => state.wardrobes);
  const looks = useWardrobeStore((state) => state.looks);

  const stats = useMemo(
    () => [
      { label: '衣橱单品', value: items.length },
      { label: '衣橱数量', value: wardrobes.length },
      { label: '我的搭配', value: looks.length }
    ],
    [items.length, wardrobes.length, looks.length]
  );

  const handleMenu = (key: string) => {
    if (key === 'favorites') {
      Taro.switchTab({ url: '/pages/outfit/index' });
      return;
    }
    if (key === 'calendar') {
      Taro.navigateTo({ url: '/pages/calendar/index' });
      return;
    }
    if (key === 'wardrobe') {
      Taro.navigateTo({ url: '/pages/wardrobe-manage/index' });
      return;
    }
    if (key === 'family') {
      Taro.navigateTo({ url: '/pages/family/index' });
      return;
    }
    Taro.navigateTo({ url: '/pages/settings/index' });
  };

  const handleAbout = () => {
    Taro.showModal({
      title: '关于魔法衣橱',
      content: '魔法衣橱 v1.0.0\n你的 AI 智能穿搭管家，让每天出门都像施展魔法。',
      showCancel: false,
      confirmText: '知道啦'
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.profileCard}>
        <View className={styles.profileRow}>
          <Image className={styles.avatar} src={AVATAR} mode="aspectFill" />
          <View className={styles.profileInfo}>
            <Text className={styles.name}>小魔仙</Text>
            <View className={styles.levelBadge}>
              <Text className={styles.levelText}>✨ Lv.3 穿搭魔法师</Text>
            </View>
          </View>
        </View>

        <View className={styles.statsRow}>
          {stats.map((stat, index) => (
            <React.Fragment key={stat.label}>
              {index > 0 ? <View className={styles.statDivider} /> : null}
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{stat.value}</Text>
                <Text className={styles.statLabel}>{stat.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>

      <View className={styles.menuCard}>
        {MENU_LIST.map((menu, index) => (
          <View
            key={menu.key}
            className={`${styles.menuItem} ${index === MENU_LIST.length - 1 ? styles.menuItemLast : ''}`}
            onClick={() => handleMenu(menu.key)}
          >
            <View className={styles.menuEmojiWrap}>
              <Text className={styles.menuEmoji}>{menu.emoji}</Text>
            </View>
            <View className={styles.menuTextWrap}>
              <Text className={styles.menuLabel}>{menu.label}</Text>
              <Text className={styles.menuDesc}>{menu.desc}</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>

      <View className={styles.menuCard}>
        <View className={styles.menuItem} onClick={handleAbout}>
          <View className={styles.menuEmojiWrap}>
            <Text className={styles.menuEmoji}>🪄</Text>
          </View>
          <View className={styles.menuTextWrap}>
            <Text className={styles.menuLabel}>关于魔法衣橱</Text>
            <Text className={styles.menuDesc}>版本 v1.0.0</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <Text className={styles.footer}>愿你的每一天，都被魔法点亮 ✨</Text>
    </View>
  );
};

export default MinePage;
