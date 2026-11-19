import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  extra?: string;
  onExtraClick?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, extra, onExtraClick }) => {
  return (
    <View className={styles.header}>
      <View className={styles.left}>
        <Text className={styles.title}>{title}</Text>
        {subtitle ? <Text className={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {extra ? (
        <View className={styles.extra} onClick={onExtraClick}>
          <Text className={styles.extraText}>{extra}</Text>
          <Text className={styles.arrow}>›</Text>
        </View>
      ) : null}
    </View>
  );
};

export default SectionHeader;
