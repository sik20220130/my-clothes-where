import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Input, Image, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import { CATEGORY_LIST, COLOR_OPTIONS, SEASON_LIST } from '@/utils/category';
import type { ClothingCategory, ClothingItem } from '@/types/wardrobe';

const DEFAULT_IMAGES: Record<ClothingCategory, string> = {
  top: 'https://picsum.photos/id/103/600/600',
  bottom: 'https://picsum.photos/id/230/600/600',
  dress: 'https://picsum.photos/id/119/720/900',
  outer: 'https://picsum.photos/id/220/600/600',
  shoes: 'https://picsum.photos/id/230/600/600',
  bag: 'https://picsum.photos/id/250/600/600',
  accessory: 'https://picsum.photos/id/103/600/600'
};

const AddClothingPage: React.FC = () => {
  const router = useRouter();
  const editingId = router.params.id || '';

  const items = useWardrobeStore((state) => state.items);
  const wardrobes = useWardrobeStore((state) => state.wardrobes);
  const addItem = useWardrobeStore((state) => state.addItem);
  const updateItem = useWardrobeStore((state) => state.updateItem);

  const editingItem = useMemo(
    () => items.find((item) => item.id === editingId),
    [items, editingId]
  );

  const [image, setImage] = useState(editingItem ? editingItem.image : '');
  const [name, setName] = useState(editingItem ? editingItem.name : '');
  const [category, setCategory] = useState<ClothingCategory | ''>(
    editingItem ? editingItem.category : ''
  );
  const [colorIndex, setColorIndex] = useState(() => {
    const index = COLOR_OPTIONS.findIndex((color) => color.name === editingItem?.color);
    return index >= 0 ? index : 0;
  });
  const [seasons, setSeasons] = useState<string[]>(
    editingItem ? editingItem.seasons : ['春', '秋']
  );
  const [brand, setBrand] = useState(editingItem ? editingItem.brand : '');
  const [note, setNote] = useState(editingItem && editingItem.note ? editingItem.note : '');
  const [wardrobeId, setWardrobeId] = useState(
    editingItem ? editingItem.wardrobeId : wardrobes[0]?.id || ''
  );

  useEffect(() => {
    if (editingItem) {
      Taro.setNavigationBarTitle({ title: '编辑单品' });
    }
  }, [editingItem]);

  const pickImage = async (source: 'camera' | 'album') => {
    try {
      if (process.env.TARO_ENV === 'weapp') {
        const res = await Taro.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: [source],
          sizeType: ['compressed']
        });
        if (res.tempFiles && res.tempFiles.length > 0) {
          setImage(res.tempFiles[0].tempFilePath);
          console.info('[AddClothing] 已拍摄/选择照片:', source);
        }
      } else {
        const res = await Taro.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: [source]
        });
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          setImage(res.tempFilePaths[0]);
          console.info('[AddClothing] 已选择照片:', source);
        }
      }
    } catch (error) {
      console.error('[AddClothing] 获取照片失败:', error);
    }
  };

  const toggleSeason = (season: string) => {
    setSeasons((prev) =>
      prev.includes(season) ? prev.filter((item) => item !== season) : [...prev, season]
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请填写单品名称', icon: 'none' });
      return;
    }
    if (!category) {
      Taro.showToast({ title: '请选择单品分类', icon: 'none' });
      return;
    }
    const color = COLOR_OPTIONS[colorIndex];
    const payload: ClothingItem = {
      id: editingItem ? editingItem.id : `c-${Date.now()}`,
      name: name.trim(),
      category,
      color: color.name,
      colorHex: color.hex,
      seasons: seasons.length > 0 ? seasons : ['四季'],
      image: image || DEFAULT_IMAGES[category],
      brand: brand.trim() || '未填写',
      wearCount: editingItem ? editingItem.wearCount : 0,
      addedAt: editingItem ? editingItem.addedAt : dayjs().format('YYYY-MM-DD'),
      wardrobeId: wardrobeId || wardrobes[0]?.id || '',
      note: note.trim() || undefined
    };

    if (editingItem) {
      updateItem(payload);
      Taro.showToast({ title: '修改已保存', icon: 'success', duration: 800 });
    } else {
      addItem(payload);
      Taro.showToast({ title: '已加入衣橱', icon: 'success', duration: 800 });
    }
    setTimeout(() => {
      Taro.navigateBack();
    }, 800);
  };

  const canSave = name.trim().length > 0 && category !== '';

  return (
    <View className={styles.page}>
      <View className={styles.block}>
        <Text className={styles.fieldLabel}>单品照片</Text>
        <View className={styles.imagePicker}>
          {image ? (
            <Image className={styles.imagePreview} src={image} mode="aspectFill" />
          ) : (
            <View className={styles.imageEmpty}>
              <Text className={styles.imageEmptyIcon}>📷</Text>
              <Text className={styles.imageEmptyText}>拍下你的单品</Text>
              <Text className={styles.imageEmptyHint}>直接调用相机拍摄衣物，会更清晰</Text>
            </View>
          )}
        </View>
        <View className={styles.photoActions}>
          <View className={styles.photoBtn} onClick={() => pickImage('camera')}>
            <Text className={styles.photoBtnText}>📷 拍照</Text>
          </View>
          <View className={styles.photoBtn} onClick={() => pickImage('album')}>
            <Text className={styles.photoBtnText}>🖼 从相册选择</Text>
          </View>
        </View>
      </View>

      <View className={styles.block}>
        <Text className={styles.fieldLabel}>单品名称</Text>
        <Input
          className={styles.input}
          value={name}
          maxlength={20}
          placeholder="例如：云朵针织开衫"
          placeholderClass={styles.placeholder}
          onInput={(event) => setName(event.detail.value)}
        />
      </View>

      <View className={styles.block}>
        <Text className={styles.fieldLabel}>收纳到哪个衣橱</Text>
        <View className={styles.cabinetRow}>
          {wardrobes.map((cabinet) => (
            <View
              key={cabinet.id}
              className={`${styles.cabinetChip} ${wardrobeId === cabinet.id ? styles.cabinetChipActive : ''}`}
              onClick={() => setWardrobeId(cabinet.id)}
            >
              {cabinet.name}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.block}>
        <Text className={styles.fieldLabel}>分类</Text>
        <View className={styles.categoryGrid}>
          {CATEGORY_LIST.filter((item) => item.key !== 'all').map((item) => (
            <View
              key={item.key}
              className={`${styles.categoryChip} ${
                category === item.key ? styles.categoryChipActive : ''
              }`}
              onClick={() => setCategory(item.key as ClothingCategory)}
            >
              {item.label}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.block}>
        <Text className={styles.fieldLabel}>颜色</Text>
        <View className={styles.colorRow}>
          {COLOR_OPTIONS.map((color, index) => (
            <View
              key={color.name}
              className={`${styles.colorItem} ${colorIndex === index ? styles.colorItemActive : ''}`}
              onClick={() => setColorIndex(index)}
            >
              <View className={styles.colorDot} style={{ backgroundColor: color.hex }} />
            </View>
          ))}
        </View>
        <Text className={styles.colorName}>已选：{COLOR_OPTIONS[colorIndex].name}</Text>
      </View>

      <View className={styles.block}>
        <Text className={styles.fieldLabel}>适合季节</Text>
        <View className={styles.seasonRow}>
          {SEASON_LIST.map((season) => (
            <View
              key={season}
              className={`${styles.seasonChip} ${seasons.includes(season) ? styles.seasonChipActive : ''}`}
              onClick={() => toggleSeason(season)}
            >
              {season}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.block}>
        <Text className={styles.fieldLabel}>品牌（选填）</Text>
        <Input
          className={styles.input}
          value={brand}
          maxlength={20}
          placeholder="记录品牌，便于搭配参考"
          placeholderClass={styles.placeholder}
          onInput={(event) => setBrand(event.detail.value)}
        />
      </View>

      <View className={styles.block}>
        <Text className={styles.fieldLabel}>搭配备注（选填）</Text>
        <Textarea
          className={styles.textarea}
          value={note}
          maxlength={60}
          placeholder="例如：适合搭配牛仔裤，春秋常穿"
          placeholderClass={styles.placeholder}
          onInput={(event) => setNote(event.detail.value)}
        />
      </View>

      <View className={styles.saveBar}>
        <View
          className={`${styles.saveBtn} ${!canSave ? styles.saveBtnDisabled : ''}`}
          onClick={handleSave}
        >
          <Text className={styles.saveText}>{editingItem ? '保存修改' : '加入我的衣橱'}</Text>
        </View>
      </View>
    </View>
  );
};

export default AddClothingPage;
