import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  emoji = '✨',
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <View className={styles.empty}>
      <Text className={styles.emoji}>{emoji}</Text>
      <Text className={styles.title}>{title}</Text>
      {description ? <Text className={styles.description}>{description}</Text> : null}
      {actionText ? (
        <View className={styles.action} onClick={onAction}>
          <Text className={styles.actionText}>{actionText}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default EmptyState;
