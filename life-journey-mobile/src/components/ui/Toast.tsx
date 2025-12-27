import React, { useEffect, useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { lightTheme, semanticColors } from '@/lib/theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  action,
}: ToastProps) {
  const backgroundColor = {
    success: semanticColors.success,
    error: lightTheme.colors.error,
    warning: semanticColors.warning,
    info: semanticColors.info,
  }[type];

  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={duration}
      action={action}
      style={[
        styles.snackbar,
        { backgroundColor },
      ]}
      wrapperStyle={styles.wrapper}
    >
      {message}
    </Snackbar>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  wrapper: {
    zIndex: 1000,
  },
});
