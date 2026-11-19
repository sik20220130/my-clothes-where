import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import SectionHeader from '@/components/SectionHeader';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import { familyMembers } from '@/data/family';

const INVITE_CODE = 'MAGIC-2026';

const FamilyPage: React.FC = () => {
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

  const sharedCabinets = wardrobes.filter((cabinet) => cabinet.isShared);

  const handleCopy = () => {
    Taro.setClipboardData({ data: INVITE_CODE })
      .then(() => Taro.showToast({ title: '邀请码已复制', icon: 'none' }))
      .catch((error) => console.error('[Family] 复制失败:', error));
  };

  const handleInvite = () => {
    Taro.showModal({
      title: '邀请家人',
      content: `把邀请码 ${INVITE_CODE} 发给家人，打开小程序即可加入共享衣橱。\n（演示版为本地模拟共享）`,
      confirmText: '复制邀请码',
      cancelText: '稍后'
    })
      .then((res) => {
        if (res.confirm) {
          handleCopy();
        }
      })
      .catch((error) => console.error('[Family] 邀请弹窗失败:', error));
  };

  return (
    <View className={styles.page}>
      <View className={styles.hero}>
        <Text className={styles.heroTitle}>一家人的共享衣橱</Text>
        <Text className={styles.heroDesc}>互相看看今天穿什么，也能一起整理收纳</Text>
        <View className={styles.codeRow}>
          <View>
            <Text className={styles.codeLabel}>家庭邀请码</Text>
            <Text className={styles.codeValue}>{INVITE_CODE}</Text>
          </View>
          <View className={styles.copyBtn} onClick={handleCopy}>
            <Text className={styles.copyText}>复制</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <SectionHeader title="家庭成员" subtitle={`${familyMembers.length} 位`} />
        <View className={styles.membersCard}>
          {familyMembers.map((member) => (
            <View key={member.id} className={styles.member}>
              <Image
                className={styles.memberAvatar}
                src={member.avatar}
                mode="aspectFill"
                onError={() => console.error('[Family] 头像加载失败:', member.avatar)}
              />
              <Text className={styles.memberName}>{member.name}</Text>
              <Text className={styles.memberRole}>{member.role}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <SectionHeader title="共享衣橱" subtitle={`${sharedCabinets.length} 个已开启`} />
        {wardrobes.map((cabinet) => (
          <View key={cabinet.id} className={styles.cabinetCard}>
            <Image
              className={styles.cabinetCover}
              src={cabinet.cover}
              mode="aspectFill"
              onError={() => console.error('[Family] 衣橱图片加载失败:', cabinet.cover)}
            />
            <View className={styles.cabinetInfo}>
              <Text className={styles.cabinetName}>{cabinet.name}</Text>
              <Text className={styles.cabinetMeta}>
                {cabinet.location} · {counts[cabinet.id] || 0} 件
              </Text>
            </View>
            <View
              className={`${styles.switchTrack} ${cabinet.isShared ? styles.switchOn : ''}`}
              onClick={() => toggleCabinetShare(cabinet.id)}
            >
              <View className={styles.switchDot} />
            </View>
          </View>
        ))}
      </View>

      <View className={styles.noteCard}>
        <Text className={styles.noteTitle}>演示版说明</Text>
        <Text className={styles.noteText}>
          当前 Demo 使用本地数据模拟家庭共享。接入微信云开发后，家人通过邀请码加入同一家庭，
          衣橱与单品将实时同步，支持多端查看与协作整理。
        </Text>
      </View>

      <View className={styles.inviteBtn} onClick={handleInvite}>
        <Text className={styles.inviteText}>邀请家人加入</Text>
      </View>
    </View>
  );
};

export default FamilyPage;
