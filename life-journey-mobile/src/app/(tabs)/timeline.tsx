import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { Text, Card, Chip, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getPhases, CHAPTERS } from '@/lib/chapters';
import { getAllChaptersProgress } from '@/lib/api/chapters';
import { lightTheme, semanticColors, shadows } from '@/lib/theme';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import type { ChapterId } from '@/lib/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMELINE_WIDTH = SCREEN_WIDTH - 80;

interface TimelineChapter {
  id: ChapterId;
  title: string;
  phase: string;
  phaseColor: string;
  mediaCount: number;
  status: 'locked' | 'available' | 'completed';
  completionPercentage: number;
}

export default function TimelineScreen() {
  const router = useRouter();
  const { session } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [chapters, setChapters] = useState<TimelineChapter[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  const phases = getPhases();

  useEffect(() => {
    loadTimelineData();
  }, []);

  const loadTimelineData = async () => {
    if (!session?.primaryJourneyId || !session?.token) {
      setIsLoading(false);
      return;
    }

    try {
      const progressData = await getAllChaptersProgress(
        session.primaryJourneyId,
        session.token
      );

      const timelineChapters: TimelineChapter[] = CHAPTERS.map((chapter) => {
        const progress = progressData[chapter.id];
        const phase = phases.find((p) => p.id === chapter.phase);

        return {
          id: chapter.id,
          title: chapter.title,
          phase: chapter.phase,
          phaseColor: getPhaseColor(chapter.phase),
          mediaCount: progress?.media_count || 0,
          status: progress?.status || 'available',
          completionPercentage: progress?.completion_percentage || 0,
        };
      });

      setChapters(timelineChapters);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPhaseColor = (phaseId: string): string => {
    const colors: Record<string, string> = {
      intro: lightTheme.colors.primary,
      youth: '#4A90E2',
      love: '#E94B7D',
      work: '#7C3AED',
      future: '#10B981',
      bonus: '#F59E0B',
    };
    return colors[phaseId] || lightTheme.colors.primary;
  };

  const getPhaseIcon = (phaseId: string): string => {
    const icons: Record<string, string> = {
      intro: '🌱',
      youth: '🎓',
      love: '❤️',
      work: '💼',
      future: '🌟',
      bonus: '🎁',
    };
    return icons[phaseId] || '📖';
  };

  const handleChapterPress = (chapterId: ChapterId) => {
    router.push(`/(tabs)/record/${chapterId}`);
  };

  const filteredChapters = selectedPhase
    ? chapters.filter((ch) => ch.phase === selectedPhase)
    : chapters;

  const totalCompleted = chapters.filter((ch) => ch.status === 'completed').length;
  const overallProgress = (totalCompleted / chapters.length) * 100;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <DashboardSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <Animated.View
        entering={FadeInDown.duration(600).springify()}
        style={styles.header}
      >
        <Card style={styles.statsCard}>
          <Card.Content>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="displaySmall" style={styles.statNumber}>
                  {totalCompleted}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Voltooid
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text variant="displaySmall" style={styles.statNumber}>
                  {chapters.reduce((sum, ch) => sum + ch.mediaCount, 0)}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Opnames
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text variant="displaySmall" style={styles.statNumber}>
                  {Math.round(overallProgress)}%
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Compleet
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>

      {/* Phase Filter */}
      <Animated.View entering={FadeInUp.delay(200).duration(600).springify()}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.phaseFilter}
          contentContainerStyle={styles.phaseFilterContent}
        >
          <Chip
            selected={selectedPhase === null}
            onPress={() => setSelectedPhase(null)}
            style={[
              styles.phaseChip,
              selectedPhase === null && styles.phaseChipSelected,
            ]}
          >
            Alles
          </Chip>

          {phases.map((phase) => {
            const phaseChapters = chapters.filter((ch) => ch.phase === phase.id);
            const completedCount = phaseChapters.filter(
              (ch) => ch.status === 'completed'
            ).length;

            return (
              <Chip
                key={phase.id}
                selected={selectedPhase === phase.id}
                onPress={() => setSelectedPhase(phase.id)}
                icon={() => <Text style={styles.phaseIcon}>{getPhaseIcon(phase.id)}</Text>}
                style={[
                  styles.phaseChip,
                  selectedPhase === phase.id && styles.phaseChipSelected,
                ]}
              >
                {phase.title.replace(/Fase \d+: /, '')} ({completedCount}/{phaseChapters.length})
              </Chip>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Timeline */}
      <ScrollView
        style={styles.timeline}
        contentContainerStyle={styles.timelineContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredChapters.map((chapter, index) => (
          <Animated.View
            key={chapter.id}
            entering={FadeInDown.delay(index * 50).duration(500).springify()}
            layout={Layout.springify()}
          >
            <Pressable
              onPress={() => handleChapterPress(chapter.id)}
              accessible={true}
              accessibilityLabel={`Hoofdstuk: ${chapter.title}. ${chapter.mediaCount} opnames. Status: ${chapter.status}`}
              accessibilityRole="button"
            >
              <View style={styles.timelineItem}>
                {/* Timeline Line */}
                <View style={styles.timelineLineContainer}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor: chapter.status === 'completed'
                          ? chapter.phaseColor
                          : lightTheme.colors.outlineVariant,
                      },
                      chapter.status === 'completed' && styles.timelineDotCompleted,
                    ]}
                  />
                  {index < filteredChapters.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor:
                            chapter.status === 'completed'
                              ? chapter.phaseColor
                              : lightTheme.colors.outlineVariant,
                        },
                      ]}
                    />
                  )}
                </View>

                {/* Chapter Card */}
                <Card
                  style={[
                    styles.chapterCard,
                    chapter.status === 'completed' && styles.chapterCardCompleted,
                  ]}
                >
                  <Card.Content>
                    <View style={styles.chapterHeader}>
                      <Text
                        variant="titleMedium"
                        style={[
                          styles.chapterTitle,
                          { color: chapter.phaseColor },
                        ]}
                      >
                        {chapter.title}
                      </Text>

                      {chapter.mediaCount > 0 && (
                        <Chip
                          compact
                          icon="play-circle"
                          style={[
                            styles.mediaChip,
                            { backgroundColor: `${chapter.phaseColor}20` },
                          ]}
                          textStyle={{ color: chapter.phaseColor }}
                        >
                          {chapter.mediaCount}
                        </Chip>
                      )}
                    </View>

                    {chapter.status === 'completed' && chapter.completionPercentage > 0 && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${chapter.completionPercentage}%`,
                                backgroundColor: chapter.phaseColor,
                              },
                            ]}
                          />
                        </View>
                        <Text variant="bodySmall" style={styles.progressText}>
                          {chapter.completionPercentage}% voltooid
                        </Text>
                      </View>
                    )}

                    {chapter.status === 'available' && (
                      <Text variant="bodySmall" style={styles.availableText}>
                        Tik om je verhaal te vertellen →
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>

      {/* FAB voor quick record */}
      <FAB
        icon="microphone"
        style={styles.fab}
        onPress={() => {
          const nextChapter = chapters.find((ch) => ch.status === 'available');
          if (nextChapter) {
            router.push(`/(tabs)/record/${nextChapter.id}`);
          }
        }}
        label="Opnemen"
        accessible={true}
        accessibilityLabel="Start opname"
        accessibilityHint="Tik om direct te beginnen met opnemen"
        accessibilityRole="button"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  statsCard: {
    backgroundColor: lightTheme.colors.primaryContainer,
    elevation: 4,
    borderRadius: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: lightTheme.colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    color: lightTheme.colors.onPrimaryContainer,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: lightTheme.colors.primary,
    opacity: 0.2,
  },
  phaseFilter: {
    maxHeight: 60,
    marginBottom: 8,
  },
  phaseFilterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  phaseChip: {
    backgroundColor: lightTheme.colors.surfaceVariant,
  },
  phaseChipSelected: {
    backgroundColor: lightTheme.colors.primaryContainer,
  },
  phaseIcon: {
    fontSize: 16,
  },
  timeline: {
    flex: 1,
  },
  timelineContent: {
    padding: 16,
    paddingTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLineContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: lightTheme.colors.background,
    ...shadows.md,
  },
  timelineDotCompleted: {
    ...shadows.lg,
  },
  timelineLine: {
    width: 3,
    flex: 1,
    marginVertical: 4,
  },
  chapterCard: {
    flex: 1,
    backgroundColor: lightTheme.colors.surface,
    borderRadius: 12,
    ...shadows.sm,
  },
  chapterCardCompleted: {
    ...shadows.md,
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chapterTitle: {
    flex: 1,
    fontWeight: 'bold',
  },
  mediaChip: {
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: lightTheme.colors.surfaceVariant,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: lightTheme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  availableText: {
    color: lightTheme.colors.primary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: lightTheme.colors.primary,
  },
});
