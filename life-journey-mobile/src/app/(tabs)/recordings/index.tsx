import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Divider, IconButton, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getJourneyMedia } from '@/lib/api/media';
import { CHAPTERS } from '@/lib/chapters';
import { lightTheme } from '@/lib/theme';

interface MediaAsset {
  id: string;
  journey_id: string;
  chapter_id: string;
  modality: string;
  object_key: string;
  original_filename: string;
  duration_seconds: number;
  size_bytes: number;
  storage_state: string;
  recorded_at: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function RecordingsScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMedia = useCallback(async () => {
    if (!session?.primaryJourneyId || !session?.token) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await getJourneyMedia(session.primaryJourneyId, session.token);
      setMedia(data as MediaAsset[]);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.primaryJourneyId, session?.token]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedia();
    setRefreshing(false);
  };

  const getChapterTitle = (chapterId: string): string =>
    CHAPTERS.find((ch) => ch.id === chapterId)?.title ?? chapterId;

  const grouped = media.reduce<Record<string, MediaAsset[]>>((acc, item) => {
    if (!acc[item.chapter_id]) acc[item.chapter_id] = [];
    acc[item.chapter_id].push(item);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
      </View>
    );
  }

  if (media.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          Je hebt nog geen opnames.
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubText}>
          Begin met opnemen via het dashboard.
        </Text>
      </View>
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
      <Text variant="headlineMedium" style={styles.screenTitle}>
        Mijn opnames
      </Text>
      <Text variant="bodyMedium" style={styles.screenSubtitle}>
        {media.length} opname{media.length !== 1 ? 's' : ''}
      </Text>

      {Object.entries(grouped).map(([chapterId, assets]) => (
        <Card key={chapterId} style={styles.chapterCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.chapterTitle}>
              {getChapterTitle(chapterId)}
            </Text>
            {assets.map((asset, index) => (
              <View key={asset.id}>
                {index > 0 && <Divider style={styles.divider} />}
                <View style={styles.assetRow}>
                  <IconButton
                    icon={asset.modality === 'video' ? 'video' : 'microphone'}
                    size={20}
                    iconColor={lightTheme.colors.primary}
                  />
                  <View style={styles.assetInfo}>
                    <Text variant="bodyMedium" style={styles.assetFilename} numberOfLines={1}>
                      {asset.original_filename}
                    </Text>
                    <Text variant="bodySmall" style={styles.assetMeta}>
                      {formatDuration(asset.duration_seconds)} · {formatDate(asset.recorded_at)}
                    </Text>
                  </View>
                  <IconButton
                    icon="play-circle-outline"
                    size={28}
                    iconColor={lightTheme.colors.primary}
                    onPress={() => router.push(`/(tabs)/record/${chapterId}`)}
                    accessibilityLabel={`Open hoofdstuk ${getChapterTitle(chapterId)}`}
                  />
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      ))}
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
    gap: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: lightTheme.colors.background,
  },
  emptyText: {
    color: lightTheme.colors.onSurface,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    color: lightTheme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  screenTitle: {
    color: lightTheme.colors.onBackground,
    marginBottom: 4,
  },
  screenSubtitle: {
    color: lightTheme.colors.onSurfaceVariant,
    marginBottom: 8,
  },
  chapterCard: {
    backgroundColor: lightTheme.colors.surface,
  },
  chapterTitle: {
    color: lightTheme.colors.primary,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 4,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetInfo: {
    flex: 1,
  },
  assetFilename: {
    color: lightTheme.colors.onSurface,
  },
  assetMeta: {
    color: lightTheme.colors.onSurfaceVariant,
  },
});
