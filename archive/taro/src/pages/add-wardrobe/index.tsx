import React, { useState } from 'react';
import { View, Text, Image, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useWardrobeStore } from '@/store/useWardrobeStore';

const DEFAULT_COVER = 'https://picsum.photos/id/582/750/400';

const AddWardrobePage: React.FC = () => {
  const addCabinet = useWardrobeStore((state) => state.addCabinet);

  const [cover, setCover] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [isShared, setIsShared] = useState(false);

  const handleChooseImage = async (source: 'camera' | 'album') => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: [source]
      });
      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        setCover(res.tempFilePaths[0]);
        console.info('[AddWardrobe] 衣橱照片已选择');
      }
    } catch (error) {
      console.error('[AddWardrobe] 选择照片失败:', error);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请填写衣橱名称', icon: 'none' });
      return;
    }
    addCabinet({
      id: `w-${Date.now()}`,
      name: name.trim(),
      location: location.trim() || '未填写位置',
      cover: cover || DEFAULT_COVER,
      isShared
    });
    Taro.showToast({ title: '衣橱已添加', icon: 'success', duration: 800 });
    setTimeout(() => Taro.navigateBack(), 800);
  };

  return (
    <View className={styles.page}>
      <View className={styles.block}>
        <Text className={styles.fieldLabel}>衣橱照片</Text>
        <View className={styles.imagePicker}>
          {cover ? (
            <Image className={styles.imagePreview} src={cover} mode="aspectFill" />
          ) : (
            <View className={styles.imageEmpty}>
              <Text className={styles.imageEmptyIcon}>🚪</Text>
              <Text className={styles.imageEmptyText}>上传你家衣橱的照片</Text>
            </View>
          )}
        </View>
        <View className={styles.photoActions}>
          <View className={styles.photoBtn} onClick={() => handleChooseImage('camera')}>
            <Text className={styles.photoBtnText}>📷 拍照</Text>
          </View>
          <View className={styles.photoBtn} onClick={() => handleChooseImage('album')}>
            <Text className={styles.photoBtnText}>🖼 从相册选择</Text>
          </View>
        </View>
      </View>

      <View className={styles.block}>
        <Text className={styles.fieldLabel}>衣橱名称</Text>
        <Input
          className={styles.input}
          value={name}
          maxlength={16}
          placeholder="例如：主卧大衣橱"
          placeholderClass={styles.placeholder}
          onInput={(event) => setName(event.detail.value)}
        />
      </View>

      <View className={styles.block}>
        <Text className={styles.fieldLabel}>摆放位置（选填）</Text>
        <Input
          className={styles.input}
          value={location}
          maxlength={20}
          placeholder="例如：主卧靠窗"
          placeholderClass={styles.placeholder}
          onInput={(event) => setLocation(event.detail.value)}
        />
      </View>

      <View className={styles.block}>
        <View className={styles.shareRow} onClick={() => setIsShared((prev) => !prev)}>
          <View className={styles.shareInfo}>
            <Text className={styles.shareTitle}>家庭共享</Text>
            <Text className={styles.shareDesc}>开启后家人可一起查看和整理这个衣橱</Text>
          </View>
          <View className={`${styles.switchTrack} ${isShared ? styles.switchOn : ''}`}>
            <View className={styles.switchDot} />
          </View>
        </View>
      </View>

      <View className={styles.saveBar}>
        <View className={styles.saveBtn} onClick={handleSave}>
          <Text className={styles.saveText}>创建衣橱</Text>
        </View>
      </View>
    </View>
  );
};

export default AddWardrobePage;
