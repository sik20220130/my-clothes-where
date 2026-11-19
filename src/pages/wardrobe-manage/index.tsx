import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useWardrobeStore } from '@/store/useWardrobeStore';

const WardrobeManagePage: React.FC = () => {
  const wardrobes = useWardrobeStore((state) => state.wardrobes);
  const items = useWardrobeStore((state) => state.items);
  const toggleCabinetShare = useWardrobeStore((state) => state.toggleCabinetShare);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((item) => {
      map[item.wardrobeId] = (map[item.wardrobeId] || 0) + 1;
    });
    return map;
  }, [items]);

  const goAdd = () => {
    Taro.navigateTo({ url: '/pages/add-wardrobe/index' });
  };

  const goItems = () => {
    Taro.switchTab({ url: '/pages/wardrobe/index' });
  };

  const handleToggleShare = (id: string, name: string) => {
    toggleCabinetShare(id);
    Taro.showToast({ title: `${name}共享状态已更新`, icon: 'none' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View>
          <Text className={styles.title}>衣橱管理</Text>
          <Text className={styles.subtitle}>共 {wardrobes.length} 个衣橱 · 晒出你的收纳魔法</Text>
        </View>
        <View className={styles.addBtn} onClick={goAdd}>
          <Text className={styles.addBtnText}>+ 添加衣橱</Text>
        </View>
      </View>

      <View className={styles.list}>
        {wardrobes.map((cabinet) => (
          <View key={cabinet.id} className={styles.card}>
            <Image
              className={styles.cover}
              src={cabinet.cover}
              mode="aspectFill"
              onError={() => console.error('[WardrobeManage] 衣橱图片加载失败:', cabinet.cover)}
            />
            <View className={styles.info}>
              <View className={styles.nameRow}>
                <Text className={styles.name}>{cabinet.name}</Text>
                {cabinet.isShared ? (
                  <View className={styles.sharedBadge}>
                    <Text className={styles.sharedText}>家庭共享</Text>
                  </View>
                ) : null}
              </View>
              <Text className={styles.meta}>{cabinet.location} · {counts[cabinet.id] || 0} 件单品</Text>
              <View className={styles.cardBottom}>
                <Text className={styles.viewText} onClick={goItems}>
                  查看单品 ›
                </Text>
                <View className={styles.shareRow} onClick={() => handleToggleShare(cabinet.id, cabinet.name)}>
                  <Text className={styles.shareLabel}>共享</Text>
                  <View className={`${styles.switchTrack} ${cabinet.isShared ? styles.switchOn : ''}`}>
                    <View className={styles.switchDot} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.tipCard}>
        <Text className={styles.tipTitle}>收纳小提示</Text>
        <Text className={styles.tipText}>
          1. 衣橱照片支持拍照上传，真实还原家里的收纳空间{'\n'}
          2. 在单品详情页点击「转移衣橱」，即可把衣物移动到其他衣橱{'\n'}
          3. 开启家庭共享后，家人可以一起查看与整理
        </Text>
      </View>
    </View>
  );
};

export default WardrobeManagePage;
