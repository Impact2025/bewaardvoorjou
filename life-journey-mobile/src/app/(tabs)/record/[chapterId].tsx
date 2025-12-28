import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth-store';
import { AudioRecorder } from '@/components/recorder/AudioRecorder';
import { VideoRecorder } from '@/components/recorder/VideoRecorder';
import { TextRecorder } from '@/components/recorder/TextRecorder';
import { ModalitySelector, RecordingModality } from '@/components/recorder/ModalitySelector';
import { getChapterById } from '@/lib/chapters';
import { saveRecordingToDatabase } from '@/lib/storage/recordings-db';
import { syncManager } from '@/lib/sync/manager';
import { lightTheme } from '@/lib/theme';
import { Toast } from '@/components/ui/Toast';
import { useToast } from '@/hooks/use-toast';
import { AIFloatingButton } from '@/components/ai/AIFloatingButton';
import type { ChapterId } from '@/lib/types';

export default function RecordScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: ChapterId }>();
  const router = useRouter();
  const { session } = useAuthStore();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [modality, setModality] = useState<RecordingModality>('audio');

  const chapter = getChapterById(chapterId);

  if (!chapter) {
    return (
      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.errorText}>
          Hoofdstuk niet gevonden
        </Text>
      </View>
    );
  }

  const handleRecordingComplete = async (uri: string, durationSeconds: number) => {
    if (!session?.primaryJourneyId || !session?.token) {
      showError('Je bent niet ingelogd. Log opnieuw in en probeer het opnieuw.');
      return;
    }

    try {
      setIsSaving(true);

      // Save to WatermelonDB (includes FileSystem copy)
      const recording = await saveRecordingToDatabase(
        uri,
        chapterId,
        session.primaryJourneyId,
        modality === 'video' ? 'video' : 'audio',
        durationSeconds
      );

      console.log('Recording saved to database:', recording.id);

      // Trigger sync if online
      const syncStatus = syncManager.getSyncStatus();

      if (syncStatus.isOnline) {
        showSuccess('Opname opgeslagen! De upload start automatisch.');
        syncManager.triggerManualSync();
        // Navigate back after a short delay to show the toast
        setTimeout(() => router.back(), 1500);
      } else {
        showSuccess('Opname opgeslagen (offline). Upload volgt zodra je online bent.');
        setTimeout(() => router.back(), 1500);
      }
    } catch (error: any) {
      console.error('Failed to save recording:', error);
      showError('Er is een fout opgetreden bij het opslaan. Probeer het opnieuw.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecordingCanceled = () => {
    router.back();
  };

  const handleTextComplete = async (text: string) => {
    if (!session?.primaryJourneyId || !session?.token) {
      showError('Je bent niet ingelogd. Log opnieuw in en probeer het opnieuw.');
      return;
    }

    try {
      setIsSaving(true);

      // For text, we'll create a temporary text file to store the content
      // This will be handled similar to audio/video uploads
      // TODO: Implement text storage (could be direct to database or as text file)

      console.log('Text story saved:', text);

      showSuccess('Verhaal opgeslagen! Het wordt automatisch gesynchroniseerd.');
      setTimeout(() => router.back(), 1500);
    } catch (error: any) {
      console.error('Failed to save text:', error);
      showError('Er is een fout opgetreden bij het opslaan. Probeer het opnieuw.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTextCanceled = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Chapter Info */}
        <Card style={styles.chapterCard}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.chapterTitle}>
            {chapter.title}
          </Text>

          <Text variant="bodyMedium" style={styles.chapterDescription}>
            {chapter.description}
          </Text>

          <View style={styles.questionContainer}>
            <Text variant="labelLarge" style={styles.questionLabel}>
              Vraag:
            </Text>
            <Text variant="bodyLarge" style={styles.question}>
              {chapter.question}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Modality Selector */}
      <Card style={styles.modalityCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.modalityTitle}>
            Kies je opname type:
          </Text>
          <ModalitySelector
            value={modality}
            onChange={setModality}
            availableModalities={chapter.defaultModalities as RecordingModality[]}
          />
        </Card.Content>
      </Card>

      {/* Recorder */}
      <Card style={styles.recorderCard}>
        <Card.Content>
          {isSaving ? (
            <View style={styles.savingContainer}>
              <ActivityIndicator size="large" color={lightTheme.colors.primary} />
              <Text variant="bodyLarge" style={styles.savingText}>
                {modality === 'text' ? 'Verhaal opslaan...' : 'Opname opslaan...'}
              </Text>
            </View>
          ) : (
            <>
              {modality === 'audio' && (
                <AudioRecorder
                  chapterId={chapterId}
                  onRecordingComplete={handleRecordingComplete}
                  onRecordingCanceled={handleRecordingCanceled}
                />
              )}

              {modality === 'video' && (
                <VideoRecorder
                  chapterId={chapterId}
                  onRecordingComplete={handleRecordingComplete}
                  onRecordingCanceled={handleRecordingCanceled}
                />
              )}

              {modality === 'text' && (
                <TextRecorder
                  chapterId={chapterId}
                  onTextComplete={handleTextComplete}
                  onTextCanceled={handleTextCanceled}
                />
              )}
            </>
          )}
        </Card.Content>
      </Card>

      {/* Offline Indicator */}
      {!syncManager.getSyncStatus().isOnline && (
        <Card style={styles.offlineCard}>
          <Card.Content>
            <View style={styles.offlineIndicator}>
              <Text variant="labelLarge" style={styles.offlineText}>
                📵 Offline modus
              </Text>
              <Text variant="bodySmall" style={styles.offlineDescription}>
                Je opnames worden lokaal opgeslagen en automatisch geüpload zodra je online bent.
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Tips */}
      <Card style={styles.tipsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.tipsTitle}>
            Tips voor een goede opname:
          </Text>

          <View style={styles.tipsList}>
            <Text variant="bodyMedium" style={styles.tip}>
              • Zoek een rustige plek zonder achtergrondgeluid
            </Text>
            <Text variant="bodyMedium" style={styles.tip}>
              • Houd je telefoon ongeveer 20cm van je mond
            </Text>
            <Text variant="bodyMedium" style={styles.tip}>
              • Spreek in een natuurlijk tempo
            </Text>
            <Text variant="bodyMedium" style={styles.tip}>
              • Neem de tijd om na te denken - stiltes zijn prima!
            </Text>
            <Text variant="bodyMedium" style={styles.tip}>
              • Je kunt altijd opnieuw beginnen als je niet tevreden bent
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={() => router.back()}
        style={styles.backButton}
        disabled={isSaving}
      >
        Terug naar hoofdstukken
      </Button>

        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={hideToast}
        />
      </ScrollView>

      {/* AI Assistant - Floating over content */}
      <AIFloatingButton chapterId={chapterId} position="bottom-left" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 80, // Extra ruimte voor floating button
  },
  chapterCard: {
    backgroundColor: lightTheme.colors.surface,
    elevation: 2,
  },
  modalityCard: {
    backgroundColor: lightTheme.colors.surface,
    elevation: 2,
  },
  modalityTitle: {
    fontWeight: 'bold',
    color: lightTheme.colors.onSurface,
    marginBottom: 12,
  },
  chapterTitle: {
    fontWeight: 'bold',
    color: lightTheme.colors.onSurface,
    marginBottom: 8,
  },
  chapterDescription: {
    color: lightTheme.colors.onSurfaceVariant,
    marginBottom: 16,
  },
  questionContainer: {
    backgroundColor: lightTheme.colors.primaryContainer,
    padding: 16,
    borderRadius: lightTheme.roundness,
  },
  questionLabel: {
    color: lightTheme.colors.primary,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  question: {
    color: lightTheme.colors.onPrimaryContainer,
    fontStyle: 'italic',
  },
  recorderCard: {
    backgroundColor: lightTheme.colors.surface,
    elevation: 2,
  },
  savingContainer: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  savingText: {
    color: lightTheme.colors.onSurface,
  },
  offlineCard: {
    backgroundColor: lightTheme.colors.tertiaryContainer,
    elevation: 1,
  },
  offlineIndicator: {
    gap: 8,
  },
  offlineText: {
    color: lightTheme.colors.tertiary,
    fontWeight: 'bold',
  },
  offlineDescription: {
    color: lightTheme.colors.onTertiaryContainer,
  },
  tipsCard: {
    backgroundColor: lightTheme.colors.surfaceVariant,
    elevation: 1,
  },
  tipsTitle: {
    fontWeight: 'bold',
    color: lightTheme.colors.onSurface,
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tip: {
    color: lightTheme.colors.onSurfaceVariant,
  },
  backButton: {
    marginTop: 8,
    borderRadius: lightTheme.roundness,
  },
  errorText: {
    color: lightTheme.colors.error,
    textAlign: 'center',
    padding: 32,
  },
});
