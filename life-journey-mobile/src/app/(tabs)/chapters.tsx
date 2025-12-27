import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth-store';
import { CHAPTERS, getPhases } from '@/lib/chapters';
import { getAllChaptersProgress } from '@/lib/api/chapters';
import { lightTheme } from '@/lib/theme';
import { SkeletonCard } from '@/components/ui/Skeleton';
import type { ChapterId } from '@/lib/types';

interface ChapterProgress {
  status: 'locked' | 'available' | 'completed';
  mediaCount: number;
  completionPercentage: number;
}

export default function ChaptersScreen() {
  const router = useRouter();
  const { session } = useAuthStore();

  const [progress, setProgress] = useState<Record<ChapterId, ChapterProgress>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string>('intro');

  const phases = getPhases();

  useEffect(() => {
    loadChaptersProgress();
  }, []);

  const loadChaptersProgress = async () => {
    if (!session?.primaryJourneyId || !session?.token) {
      setIsLoading(false);
      return;
    }

    try {
      const progressData = await getAllChaptersProgress(
        session.primaryJourneyId,
        session.token
      );

      // Transform backend format to our format
      const transformed: Record<ChapterId, ChapterProgress> = {};
      Object.entries(progressData).forEach(([chapterId, data]) => {
        transformed[chapterId as ChapterId] = {
          status: data.status,
          mediaCount: data.media_count,
          completionPercentage: data.completion_percentage,
        };
      });

      setProgress(transformed);
    } catch (error) {
      console.error('Failed to load chapters progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChaptersProgress();
    setRefreshing(false);
  };

  const getChapterStatus = (chapterId: ChapterId): ChapterProgress => {
    return progress[chapterId] || {
      status: 'available', // Default to available for now
      mediaCount: 0,
      completionPercentage: 0,
    };
  };

  const getStatusColor = (status: 'locked' | 'available' | 'completed') => {
    switch (status) {
      case 'completed':
        return lightTheme.colors.primary;
      case 'available':
        return lightTheme.colors.secondary;
      case 'locked':
        return lightTheme.colors.outlineVariant;
      default:
        return lightTheme.colors.outline;
    }
  };

  const getStatusLabel = (status: 'locked' | 'available' | 'completed') => {
    switch (status) {
      case 'completed':
        return 'Voltooid';
      case 'available':
        return 'Beschikbaar';
      case 'locked':
        return 'Vergrendeld';
      default:
        return '';
    }
  };

  const handleChapterPress = (chapterId: ChapterId) => {
    const status = getChapterStatus(chapterId);

    if (status.status === 'locked') {
      return; // Don't navigate if locked
    }

    router.push(`/(tabs)/record/${chapterId}`);
  };

  const filteredChapters = CHAPTERS.filter((ch) => ch.phase === selectedPhase);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.chaptersList} contentContainerStyle={styles.chaptersContent}>
          <Text variant="headlineMedium" style={styles.phaseTitle}>
            Hoofdstukken laden...
          </Text>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Phase Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.phaseFilter}
        contentContainerStyle={styles.phaseFilterContent}
      >
        {phases.map((phase) => {
          const phaseChapters = CHAPTERS.filter((ch) => ch.phase === phase.id);
          const completedCount = phaseChapters.filter(
            (ch) => getChapterStatus(ch.id).status === 'completed'
          ).length;

          return (
            <Chip
              key={phase.id}
              selected={selectedPhase === phase.id}
              onPress={() => setSelectedPhase(phase.id)}
              style={[
                styles.phaseChip,
                selectedPhase === phase.id && styles.phaseChipSelected,
              ]}
            >
              {phase.title.replace(/Fase \d+: /, '')}{' '}
              ({completedCount}/{phaseChapters.length})
            </Chip>
          );
        })}
      </ScrollView>

      {/* Chapters List */}
      <ScrollView
        style={styles.chaptersList}
        contentContainerStyle={styles.chaptersContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[lightTheme.colors.primary]}
            tintColor={lightTheme.colors.primary}
          />
        }
      >
        <Text variant="headlineMedium" style={styles.phaseTitle}>
          {phases.find((p) => p.id === selectedPhase)?.title}
        </Text>

        <Text variant="bodyMedium" style={styles.phaseDescription}>
          {phases.find((p) => p.id === selectedPhase)?.description}
        </Text>

        {filteredChapters.map((chapter) => {
          const chapterStatus = getChapterStatus(chapter.id);
          const isLocked = chapterStatus.status === 'locked';

          return (
            <Pressable
              key={chapter.id}
              onPress={() => handleChapterPress(chapter.id)}
              disabled={isLocked}
              accessible={true}
              accessibilityLabel={`Hoofdstuk: ${chapter.title}. ${chapterStatus.mediaCount > 0 ? `${chapterStatus.mediaCount} opname${chapterStatus.mediaCount > 1 ? 's' : ''}. ` : ''}Status: ${getStatusLabel(chapterStatus.status)}`}
              accessibilityHint={isLocked ? 'Dit hoofdstuk is vergrendeld' : 'Tik om dit hoofdstuk op te nemen'}
              accessibilityRole="button"
              accessibilityState={{ disabled: isLocked }}
            >
              <Card
                style={[
                  styles.chapterCard,
                  isLocked && styles.chapterCardLocked,
                ]}
              >
                <Card.Content>
                  <View style={styles.chapterHeader}>
                    <View style={styles.chapterTitleContainer}>
                      <Text variant="titleMedium" style={styles.chapterTitle}>
                        {chapter.title}
                      </Text>

                      <Chip
                        compact
                        style={[
                          styles.statusChip,
                          { backgroundColor: getStatusColor(chapterStatus.status) },
                        ]}
                        textStyle={styles.statusChipText}
                      >
                        {getStatusLabel(chapterStatus.status)}
                      </Chip>
                    </View>

                    {chapterStatus.mediaCount > 0 && (
                      <Text variant="bodySmall" style={styles.mediaCount}>
                        {chapterStatus.mediaCount} opname{chapterStatus.mediaCount > 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>

                  <Text variant="bodyMedium" style={styles.chapterDescription}>
                    {chapter.description}
                  </Text>

                  <Text variant="bodySmall" style={styles.chapterQuestion} numberOfLines={2}>
                    "{chapter.question}"
                  </Text>

                  <View style={styles.chapterFooter}>
                    <Chip compact icon="book-open-variant" style={styles.modalityChip}>
                      {chapter.defaultModalities.join(', ')}
                    </Chip>

                    {chapterStatus.completionPercentage > 0 && (
                      <Text variant="bodySmall" style={styles.completionText}>
                        {chapterStatus.completionPercentage}% voltooid
                      </Text>
                    )}
                  </View>
                </Card.Content>
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  phaseFilter: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.outlineVariant,
    backgroundColor: lightTheme.colors.surface,
  },
  phaseFilterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  phaseChip: {
    backgroundColor: lightTheme.colors.surfaceVariant,
  },
  phaseChipSelected: {
    backgroundColor: lightTheme.colors.primaryContainer,
  },
  chaptersList: {
    flex: 1,
  },
  chaptersContent: {
    padding: 16,
    gap: 16,
  },
  phaseTitle: {
    fontWeight: 'bold',
    color: lightTheme.colors.onBackground,
    marginBottom: 8,
  },
  phaseDescription: {
    color: lightTheme.colors.onSurfaceVariant,
    marginBottom: 16,
  },
  chapterCard: {
    backgroundColor: lightTheme.colors.surface,
    marginBottom: 12,
    elevation: 2,
  },
  chapterCardLocked: {
    opacity: 0.6,
  },
  chapterHeader: {
    marginBottom: 12,
  },
  chapterTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chapterTitle: {
    flex: 1,
    fontWeight: 'bold',
    color: lightTheme.colors.onSurface,
  },
  statusChip: {
    marginLeft: 8,
  },
  statusChipText: {
    color: lightTheme.colors.surface,
    fontSize: 11,
  },
  mediaCount: {
    color: lightTheme.colors.onSurfaceVariant,
  },
  chapterDescription: {
    color: lightTheme.colors.onSurface,
    marginBottom: 8,
  },
  chapterQuestion: {
    color: lightTheme.colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  chapterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalityChip: {
    backgroundColor: lightTheme.colors.tertiaryContainer,
  },
  completionText: {
    color: lightTheme.colors.primary,
    fontWeight: 'bold',
  },
});
