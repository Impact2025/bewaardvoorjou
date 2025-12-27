import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { Skeleton } from './Skeleton';
import { lightTheme } from '@/lib/theme';

export function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Welcome Card Skeleton */}
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <View style={styles.welcomeHeader}>
            <Skeleton width={56} height={56} borderRadius={28} />
            <View style={styles.welcomeText}>
              <Skeleton width="60%" height={20} style={styles.line} />
              <Skeleton width="80%" height={24} />
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Progress Card Skeleton */}
      <Card style={styles.card}>
        <Card.Content>
          <Skeleton width="40%" height={20} style={styles.line} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Skeleton width={60} height={40} style={styles.line} />
              <Skeleton width={70} height={16} />
            </View>
            <View style={styles.statItem}>
              <Skeleton width={60} height={40} style={styles.line} />
              <Skeleton width={70} height={16} />
            </View>
            <View style={styles.statItem}>
              <Skeleton width={60} height={40} style={styles.line} />
              <Skeleton width={70} height={16} />
            </View>
          </View>
          <Skeleton width="100%" height={8} borderRadius={4} />
        </Card.Content>
      </Card>

      {/* Continue Card Skeleton */}
      <Card style={styles.card}>
        <Card.Content>
          <Skeleton width="60%" height={20} style={styles.line} />
          <Skeleton width="40%" height={14} style={styles.line} />
          <Skeleton width="80%" height={24} style={styles.line} />
          <Skeleton width="100%" height={16} style={styles.line} />
          <Skeleton width="100%" height={48} borderRadius={8} />
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  welcomeCard: {
    backgroundColor: lightTheme.colors.primaryContainer,
    elevation: 2,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  welcomeText: {
    flex: 1,
  },
  card: {
    backgroundColor: lightTheme.colors.surface,
    elevation: 2,
  },
  line: {
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
});
