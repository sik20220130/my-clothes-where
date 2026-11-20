import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import EmptyState from '@/components/EmptyState';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import { CATEGORY_META } from '@/utils/category';

const ClothingDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id || '';
  const items = useWardrobeStore((state) => state.items);
  const wardrobes = useWardrobeStore((state) => state.wardrobes);
  const recordWear = useWardrobeStore((state) => state.recordWear);
  const removeItem = useWardrobeStore((state) => state.removeItem);
  const moveItem = useWardrobeStore((state) => state.moveItem);

  const item = items.find((clothing) => clothing.id === id);

  if (!item) {
    return (
      <View className={styles.page}>
        <EmptyState
          emoji="🪄"
          title="单品不见了"
          description="这件单品可能已经被删除"
          actionText="返回衣橱"
          onAction={() => Taro.navigateBack()}
        />
      </View>
    );
  }

  const cabinet = wardrobes.find((wardrobe) => wardrobe.id === item.wardrobeId);

  const handleRecordWear = () => {
    recordWear(item.id);
    Taro.showToast({ title: '已记录今日穿着', icon: 'none' });
  };

  const handleEdit = () => {
    Taro.navigateTo({ url: `/pages/add-clothing/index?id=${item.id}` });
  };

  const handleTransfer = () => {
    if (wardrobes.length < 2) {
      Taro.showToast({ title: '只有一个衣橱，先去添加更多衣橱吧', icon: 'none' });
      return;
    }
    Taro.showActionSheet({ itemList: wardrobes.map((wardrobe) => wardrobe.name) })
      .then((res) => {
        const target = wardrobes[res.tapIndex];
        if (!target || target.id === item.wardrobeId) {
          return;
        }
        moveItem(item.id, target.id);
        Taro.showToast({ title: `已转移到${target.name}`, icon: 'none' });
      })
      .catch((error) => {
        console.info('[ClothingDetail] 转移衣橱取消或失败:', error);
      });
  };

  const handleDelete = () => {
    Taro.showModal({
      title: '删除单品',
      content: `确定要从衣橱中删除「${item.name}」吗？`,
      confirmText: '删除',
      confirmColor: '#f53f3f'
    })
      .then((res) => {
        if (res.confirm) {
          removeItem(item.id);
          Taro.showToast({ title: '已删除', icon: 'none' });
          setTimeout(() => Taro.navigateBack(), 500);
        }
      })
      .catch((error) => {
        console.error('[ClothingDetail] 删除确认失败:', error);
      });
  };

  return (
    <View className={styles.page}>
      <Image
        className={styles.image}
        src={item.image}
        mode="aspectFill"
        onError={() => console.error('[ClothingDetail] 图片加载失败:', item.image)}
      />

      <View className={styles.content}>
        <View className={styles.card}>
          <View className={styles.nameRow}>
            <Text className={styles.name}>{item.name}</Text>
            <View className={styles.categoryBadge}>
              <Text className={styles.categoryText}>
                {CATEGORY_META[item.category].emoji} {CATEGORY_META[item.category].label}
              </Text>
            </View>
          </View>
          <Text className={styles.brand}>{item.brand}</Text>
          <View className={styles.chips}>
            {item.seasons.map((season) => (
              <Text key={season} className={styles.chip}>
                {season}
              </Text>
            ))}
          </View>

          <View className={styles.infoRow}>
            <View className={styles.infoItem}>
              <Text className={styles.infoValue}>{item.wearCount}</Text>
              <Text className={styles.infoLabel}>穿着次数</Text>
            </View>
            <View className={styles.infoDivider} />
            <View className={styles.infoItem}>
              <Text className={styles.infoValue}>{item.color}</Text>
              <Text className={styles.infoLabel}>颜色</Text>
            </View>
            <View className={styles.infoDivider} />
            <View className={styles.infoItem}>
              <Text className={styles.infoValue}>{item.addedAt}</Text>
              <Text className={styles.infoLabel}>加入日期</Text>
            </View>
          </View>

          <View className={styles.cabinetRow} onClick={handleTransfer}>
            <Text className={styles.cabinetLabel}>所在衣橱</Text>
            <Text className={styles.cabinetValue}>
              {cabinet ? cabinet.name : '未分配'} · 点击转移 ›
            </Text>
          </View>
        </View>

        {item.note ? (
          <View className={styles.noteCard}>
            <Text className={styles.noteLabel}>搭配备注</Text>
            <Text className={styles.noteText}>{item.note}</Text>
          </View>
        ) : null}

        <Text className={styles.deleteText} onClick={handleDelete}>
          删除这件单品
        </Text>
      </View>

      <View className={styles.actionBar}>
        <View className={styles.ghostBtn} onClick={handleEdit}>
          <Text className={styles.ghostBtnText}>编辑</Text>
        </View>
        <View className={styles.ghostBtn} onClick={handleTransfer}>
          <Text className={styles.ghostBtnText}>转移</Text>
        </View>
        <View className={styles.primaryBtn} onClick={handleRecordWear}>
          <Text className={styles.primaryBtnText}>记录穿着</Text>
        </View>
      </View>
    </View>
  );
};

export default ClothingDetailPage;
