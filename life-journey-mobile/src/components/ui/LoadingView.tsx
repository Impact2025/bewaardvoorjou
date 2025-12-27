import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { lightTheme } from '@/lib/theme';

interface LoadingViewProps {
  message?: string;
  size?: 'small' | 'large';
}

export function LoadingView({ message = 'Laden...', size = 'large' }: LoadingViewProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={lightTheme.colors.primary} />
      {message && (
        <Text variant="bodyLarge" style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightTheme.colors.background,
    padding: 24,
  },
  message: {
    marginTop: 16,
    color: lightTheme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
