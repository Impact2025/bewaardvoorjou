import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, ProgressBar, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth-store';
import { CHAPTERS } from '@/lib/chapters';
import { getAllChaptersProgress } from '@/lib/api/chapters';
import { lightTheme } from '@/lib/theme';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import type { ChapterId } from '@/lib/types';

export default function DashboardScreen() {
  const router = useRouter();
  const { session, logout } = useAuthStore();

  const [progress, setProgress] = useState<Record<ChapterId, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    if (!session?.primaryJourneyId || !session?.token) {
      setIsLoading(false);
      return;
    }

    try {
      const progressData = await getAllChaptersProgress(
        session.primaryJourneyId,
        session.token
      );
      setProgress(progressData);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgress();
    setRefreshing(false);
  };

  const totalChapters = CHAPTERS.length;
  const completedChapters = Object.values(progress).filter(
    (p: any) => p.status === 'completed'
  ).length;
  const overallProgress = totalChapters > 0 ? completedChapters / totalChapters : 0;

  const availableChapters = CHAPTERS.filter((ch) => {
    const chapterProgress = progress[ch.id];
    return chapterProgress?.status === 'available' || !chapterProgress;
  });

  const nextChapter = availableChapters[0];

  if (isLoading) {
    return (
      <ScrollView style={styles.container}>
        <DashboardSkeleton />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[lightTheme.colors.primary]}
          tintColor={lightTheme.colors.primary}
        />
      }
    >
      {/* Welcome Card */}
      <Card
        style={styles.welcomeCard}
        accessible={true}
        accessibilityLabel={`Welkom terug, ${session?.user.displayName}`}
        accessibilityRole="text"
      >
        <Card.Content>
          <View style={styles.welcomeHeader}>
            <Avatar.Text
              size={56}
              label={session?.user.displayName?.charAt(0) || 'U'}
              style={styles.avatar}
              accessible={true}
              accessibilityLabel={`Profiel avatar voor ${session?.user.displayName}`}
            />
            <View style={styles.welcomeText}>
              <Text variant="headlineSmall" style={styles.welcomeTitle}>
                Welkom terug,
              </Text>
              <Text variant="titleLarge" style={styles.userName}>
                {session?.user.displayName}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Overall Progress */}
      <Card
        style={styles.progressCard}
        accessible={true}
        accessibilityLabel={`Je voortgang: ${completedChapters} van ${totalChapters} hoofdstukken voltooid, ${Math.round(overallProgress * 100)} procent compleet`}
        accessibilityRole="summary"
      >
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Je voortgang
          </Text>

          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text variant="displaySmall" style={styles.statNumber}>
                {completedChapters}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Voltooid
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text variant="displaySmall" style={styles.statNumber}>
                {totalChapters}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Totaal
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text variant="displaySmall" style={styles.statNumber}>
                {Math.round(overallProgress * 100)}%
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Compleet
              </Text>
            </View>
          </View>

          <ProgressBar
            progress={overallProgress}
            color={lightTheme.colors.primary}
            style={styles.progressBar}
          />
        </Card.Content>
      </Card>

      {/* Continue Recording */}
      {nextChapter && (
        <Card style={styles.continueCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Ga verder met opnemen
            </Text>

            <View style={styles.nextChapterContainer}>
              <Text variant="labelMedium" style={styles.nextChapterLabel}>
                Volgend hoofdstuk:
              </Text>
              <Text variant="titleLarge" style={styles.nextChapterTitle}>
                {nextChapter.title}
              </Text>
              <Text variant="bodyMedium" style={styles.nextChapterDescription}>
                {nextChapter.description}
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={() => router.push(`/(tabs)/record/${nextChapter.id}`)}
              icon="microphone"
              style={styles.continueButton}
              contentStyle={styles.continueButtonContent}
              accessible={true}
              accessibilityLabel={`Begin opname voor hoofdstuk ${nextChapter.title}`}
              accessibilityHint="Tik om het volgende hoofdstuk op te nemen"
              accessibilityRole="button"
            >
              Begin opname
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Snelle acties
          </Text>

          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => router.push('/(tabs)/chapters')}
              icon="book-open-variant"
              style={styles.actionButton}
              accessible={true}
              accessibilityLabel="Alle hoofdstukken bekijken"
              accessibilityHint="Tik om de lijst met alle hoofdstukken te openen"
              accessibilityRole="button"
            >
              Alle hoofdstukken
            </Button>

            <Button
              mode="outlined"
              onPress={() => {
                /* TODO: Navigate to recordings */
              }}
              icon="play-circle-outline"
              style={styles.actionButton}
              accessible={true}
              accessibilityLabel="Mijn opnames bekijken"
              accessibilityHint="Tik om je opgeslagen opnames te bekijken"
              accessibilityRole="button"
            >
              Mijn opnames
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Button
        mode="text"
        onPress={async () => {
          await logout();
          router.replace('/(auth)/login');
        }}
        style={styles.logoutButton}
        accessible={true}
        accessibilityLabel="Uitloggen"
        accessibilityHint="Tik om uit te loggen van je account"
        accessibilityRole="button"
      >
        Uitloggen
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  content: {
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
  avatar: {
    backgroundColor: lightTheme.colors.primary,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    color: lightTheme.colors.onPrimaryContainer,
  },
  userName: {
    color: lightTheme.colors.primary,
    fontWeight: 'bold',
  },
  progressCard: {
    backgroundColor: lightTheme.colors.surface,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: lightTheme.colors.onSurface,
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: lightTheme.colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    color: lightTheme.colors.onSurfaceVariant,
  },
  statDivider: {
    width: 1,
    backgroundColor: lightTheme.colors.outlineVariant,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  continueCard: {
    backgroundColor: lightTheme.colors.surface,
    elevation: 2,
  },
  nextChapterContainer: {
    marginBottom: 16,
  },
  nextChapterLabel: {
    color: lightTheme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  nextChapterTitle: {
    color: lightTheme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nextChapterDescription: {
    color: lightTheme.colors.onSurfaceVariant,
  },
  continueButton: {
    borderRadius: lightTheme.roundness,
  },
  continueButtonContent: {
    paddingVertical: 8,
  },
  actionsCard: {
    backgroundColor: lightTheme.colors.surface,
    elevation: 2,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    borderRadius: lightTheme.roundness,
  },
  logoutButton: {
    marginTop: 8,
  },
});
