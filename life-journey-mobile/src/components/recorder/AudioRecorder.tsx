import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Button, IconButton, ProgressBar } from 'react-native-paper';
import { Audio } from 'expo-av';
import type { AVPlaybackStatus } from 'expo-av';
import { lightTheme } from '@/lib/theme';
import { haptics, actionSuccess } from '@/lib/haptics';
import type { ChapterId } from '@/lib/types';

interface AudioRecorderProps {
  chapterId: ChapterId;
  onRecordingComplete?: (uri: string, duration: number) => void;
  onRecordingCanceled?: () => void;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export function AudioRecorder({
  chapterId,
  onRecordingComplete,
  onRecordingCanceled
}: AudioRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
      if (sound) {
        sound.unloadAsync().catch(console.error);
      }
    };
  }, [recording, sound]);

  const startRecording = async () => {
    try {
      // Request permissions if not granted
      if (!permissionResponse?.granted) {
        const response = await requestPermission();
        if (!response.granted) {
          alert('Permissie voor microfoon is vereist om audio op te nemen.');
          return;
        }
      }

      // Haptic feedback for starting
      await haptics.medium();

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        // High quality recording preset
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording) {
            setDuration(status.durationMillis / 1000);
          }
        },
        100 // Update interval in ms
      );

      setRecording(newRecording);
      setState('recording');
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Fout bij het starten van de opname. Probeer het opnieuw.');
    }
  };

  const pauseRecording = async () => {
    if (!recording) return;

    try {
      await recording.pauseAsync();
      setState('paused');
    } catch (error) {
      console.error('Failed to pause recording:', error);
    }
  };

  const resumeRecording = async () => {
    if (!recording) return;

    try {
      await recording.startAsync();
      setState('recording');
    } catch (error) {
      console.error('Failed to resume recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await haptics.heavy();

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // Get recording status for duration
      const status = await recording.getStatusAsync();
      const durationSeconds = status.durationMillis / 1000;

      setState('stopped');
      setRecordingUri(uri);
      setDuration(durationSeconds);
      setRecording(null);

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

    } catch (error) {
      console.error('Failed to stop recording:', error);
      alert('Fout bij het stoppen van de opname.');
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true },
        (status: AVPlaybackStatus) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis / 1000);

            if (status.didJustFinish) {
              setPosition(0);
            }
          }
        }
      );

      setSound(newSound);
    } catch (error) {
      console.error('Failed to play recording:', error);
      alert('Fout bij het afspelen van de opname.');
    }
  };

  const stopPlayback = async () => {
    if (!sound) return;

    try {
      await sound.stopAsync();
      setPosition(0);
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  };

  const saveRecording = () => {
    if (!recordingUri) return;

    onRecordingComplete?.(recordingUri, duration);
  };

  const cancelRecording = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      setRecording(null);
    }
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }

    setState('idle');
    setDuration(0);
    setPosition(0);
    setRecordingUri(null);
    onRecordingCanceled?.();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Permission not granted
  if (!permissionResponse?.granted && !permissionResponse?.canAskAgain) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={styles.errorText}>
          Microfoon toegang is geweigerd. Ga naar instellingen om dit toe te staan.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Recording/Playback Timer */}
      <View style={styles.timerContainer}>
        <Text variant="displayMedium" style={styles.timer}>
          {formatTime(state === 'recording' || state === 'paused' ? duration : position)}
        </Text>
        {state === 'stopped' && (
          <Text variant="bodySmall" style={styles.totalDuration}>
            / {formatTime(duration)}
          </Text>
        )}
      </View>

      {/* Progress Bar for Playback */}
      {state === 'stopped' && duration > 0 && (
        <ProgressBar
          progress={position / duration}
          color={lightTheme.colors.primary}
          style={styles.progressBar}
        />
      )}

      {/* Status Indicator */}
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusIndicator,
          state === 'recording' && styles.statusRecording,
          state === 'paused' && styles.statusPaused,
        ]} />
        <Text variant="bodyMedium" style={styles.statusText}>
          {state === 'idle' && 'Klaar om op te nemen'}
          {state === 'recording' && 'Opname actief...'}
          {state === 'paused' && 'Gepauzeerd'}
          {state === 'stopped' && 'Opname voltooid'}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {state === 'idle' && (
          <Button
            mode="contained"
            onPress={startRecording}
            icon="microphone"
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            accessible={true}
            accessibilityLabel="Start opname"
            accessibilityHint="Tik om te beginnen met opnemen"
            accessibilityRole="button"
          >
            Start Opname
          </Button>
        )}

        {(state === 'recording' || state === 'paused') && (
          <View style={styles.recordingControls}>
            <IconButton
              icon="stop"
              size={40}
              iconColor={lightTheme.colors.error}
              onPress={stopRecording}
              style={styles.iconButton}
              accessible={true}
              accessibilityLabel="Stop opname"
              accessibilityHint="Tik om de opname te stoppen"
              accessibilityRole="button"
            />

            <IconButton
              icon={state === 'recording' ? 'pause' : 'play'}
              size={40}
              iconColor={lightTheme.colors.primary}
              onPress={state === 'recording' ? pauseRecording : resumeRecording}
              style={styles.iconButton}
              accessible={true}
              accessibilityLabel={state === 'recording' ? 'Pauzeer opname' : 'Hervat opname'}
              accessibilityHint={state === 'recording' ? 'Tik om de opname te pauzeren' : 'Tik om de opname te hervatten'}
              accessibilityRole="button"
            />

            <IconButton
              icon="close"
              size={40}
              iconColor={lightTheme.colors.onSurfaceVariant}
              onPress={cancelRecording}
              style={styles.iconButton}
              accessible={true}
              accessibilityLabel="Annuleer opname"
              accessibilityHint="Tik om de opname te annuleren"
              accessibilityRole="button"
            />
          </View>
        )}

        {state === 'stopped' && (
          <View style={styles.stoppedControls}>
            <View style={styles.playbackButtons}>
              <Button
                mode="outlined"
                onPress={playRecording}
                icon="play"
                style={styles.button}
                accessible={true}
                accessibilityLabel="Speel opname af"
                accessibilityHint="Tik om je opname te beluisteren"
                accessibilityRole="button"
              >
                Afspelen
              </Button>

              <Button
                mode="outlined"
                onPress={stopPlayback}
                icon="stop"
                style={styles.button}
                accessible={true}
                accessibilityLabel="Stop afspelen"
                accessibilityHint="Tik om het afspelen te stoppen"
                accessibilityRole="button"
              >
                Stop
              </Button>
            </View>

            <View style={styles.finalButtons}>
              <Button
                mode="outlined"
                onPress={cancelRecording}
                style={styles.button}
                accessible={true}
                accessibilityLabel="Opnieuw opnemen"
                accessibilityHint="Tik om opnieuw te beginnen met opnemen"
                accessibilityRole="button"
              >
                Opnieuw
              </Button>

              <Button
                mode="contained"
                onPress={saveRecording}
                icon="check"
                style={styles.button}
                accessible={true}
                accessibilityLabel="Opname opslaan"
                accessibilityHint="Tik om deze opname op te slaan"
                accessibilityRole="button"
              >
                Opslaan
              </Button>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.roundness,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timer: {
    fontWeight: 'bold',
    color: lightTheme.colors.primary,
    fontVariant: ['tabular-nums'],
  },
  totalDuration: {
    marginLeft: 8,
    color: lightTheme.colors.onSurfaceVariant,
  },
  progressBar: {
    height: 4,
    marginBottom: 16,
    borderRadius: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: lightTheme.colors.onSurfaceVariant,
    marginRight: 8,
  },
  statusRecording: {
    backgroundColor: lightTheme.colors.error,
  },
  statusPaused: {
    backgroundColor: lightTheme.colors.tertiary,
  },
  statusText: {
    color: lightTheme.colors.onSurfaceVariant,
  },
  controlsContainer: {
    alignItems: 'center',
  },
  primaryButton: {
    minWidth: 200,
    borderRadius: lightTheme.roundness,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    backgroundColor: lightTheme.colors.surfaceVariant,
  },
  stoppedControls: {
    width: '100%',
    gap: 16,
  },
  playbackButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  finalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    borderRadius: lightTheme.roundness,
  },
  errorText: {
    color: lightTheme.colors.error,
    textAlign: 'center',
  },
});
