import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Button, IconButton, ProgressBar } from 'react-native-paper';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
import type { AVPlaybackStatus } from 'expo-av';
import { lightTheme, semanticColors } from '@/lib/theme';
import type { ChapterId } from '@/lib/types';

interface VideoRecorderProps {
  chapterId: ChapterId;
  onRecordingComplete?: (uri: string, duration: number) => void;
  onRecordingCanceled?: () => void;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

const MAX_DURATION = 600; // 10 minutes in seconds

export function VideoRecorder({
  chapterId,
  onRecordingComplete,
  onRecordingCanceled,
}: VideoRecorderProps) {
  const cameraRef = useRef<CameraView>(null);
  const videoRef = useRef<Video>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [state, setState] = useState<RecordingState>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  // Duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prev) => {
          const newDuration = prev + 1;

          // Auto-stop at max duration
          if (newDuration >= MAX_DURATION) {
            stopRecording();
            return MAX_DURATION;
          }

          return newDuration;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setState('recording');
      setIsRecording(true);
      setDuration(0);

      const video = await cameraRef.current.recordAsync({
        maxDuration: MAX_DURATION,
        // High quality settings
        mute: false,
      });

      if (video) {
        setRecordingUri(video.uri);
        setState('stopped');
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      setState('idle');
      setIsRecording(false);
      alert('Fout bij het starten van de video-opname. Probeer het opnieuw.');
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;

    try {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const playRecording = async () => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.playAsync();
    } catch (error) {
      console.error('Failed to play video:', error);
      alert('Fout bij het afspelen van de video.');
    }
  };

  const pausePlayback = async () => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.pauseAsync();
    } catch (error) {
      console.error('Failed to pause video:', error);
    }
  };

  const saveRecording = () => {
    if (!recordingUri) return;
    onRecordingComplete?.(recordingUri, duration);
  };

  const cancelRecording = () => {
    setState('idle');
    setIsRecording(false);
    setRecordingUri(null);
    setDuration(0);
    setPosition(0);
    onRecordingCanceled?.();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);

      if (status.didJustFinish) {
        setPosition(0);
      }
    }
  };

  // Permission not granted
  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text variant="titleMedium" style={styles.permissionTitle}>
          Camera toegang vereist
        </Text>
        <Text variant="bodyMedium" style={styles.permissionText}>
          Bewaardvoorjou heeft toegang tot je camera nodig om videoverhalen op te nemen.
        </Text>
        <Button
          mode="contained"
          onPress={requestPermission}
          style={styles.permissionButton}
          accessible={true}
          accessibilityLabel="Sta camera toegang toe"
          accessibilityHint="Tik om camera permissies te geven"
          accessibilityRole="button"
        >
          Sta camera toe
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera Preview or Video Playback */}
      {state !== 'stopped' ? (
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            mode="video"
          >
            {/* Timer Overlay */}
            {isRecording && (
              <View style={styles.timerOverlay}>
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text variant="titleLarge" style={styles.timerText}>
                    {formatTime(duration)}
                  </Text>
                </View>
              </View>
            )}

            {/* Camera Controls Overlay */}
            {!isRecording && (
              <View style={styles.cameraControls}>
                <IconButton
                  icon="camera-flip"
                  size={32}
                  iconColor="white"
                  onPress={toggleCameraFacing}
                  style={styles.flipButton}
                  accessible={true}
                  accessibilityLabel="Draai camera"
                  accessibilityHint="Tik om tussen voor- en achtercamera te wisselen"
                  accessibilityRole="button"
                />
              </View>
            )}
          </CameraView>
        </View>
      ) : (
        // Video Preview
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: recordingUri! }}
            style={styles.video}
            useNativeControls={false}
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            shouldPlay={false}
          />

          {/* Playback Timer */}
          <View style={styles.playbackOverlay}>
            <Text variant="titleMedium" style={styles.playbackTime}>
              {formatTime(position)} / {formatTime(duration)}
            </Text>
          </View>
        </View>
      )}

      {/* Progress Bar */}
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
          isRecording && styles.statusRecording,
        ]} />
        <Text variant="bodyMedium" style={styles.statusText}>
          {state === 'idle' && 'Klaar om op te nemen'}
          {state === 'recording' && 'Video opname actief...'}
          {state === 'stopped' && 'Video voltooid'}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {state === 'idle' && (
          <Button
            mode="contained"
            onPress={startRecording}
            icon="video"
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            accessible={true}
            accessibilityLabel="Start video-opname"
            accessibilityHint="Tik om te beginnen met video opnemen"
            accessibilityRole="button"
          >
            Start Video Opname
          </Button>
        )}

        {isRecording && (
          <View style={styles.recordingControls}>
            <IconButton
              icon="stop"
              size={56}
              iconColor="white"
              onPress={stopRecording}
              style={styles.stopButton}
              accessible={true}
              accessibilityLabel="Stop video-opname"
              accessibilityHint="Tik om de video-opname te stoppen"
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
                accessibilityLabel="Speel video af"
                accessibilityHint="Tik om je video te bekijken"
                accessibilityRole="button"
              >
                Afspelen
              </Button>

              <Button
                mode="outlined"
                onPress={pausePlayback}
                icon="pause"
                style={styles.button}
                accessible={true}
                accessibilityLabel="Pauzeer video"
                accessibilityHint="Tik om het afspelen te pauzeren"
                accessibilityRole="button"
              >
                Pauzeer
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
                accessibilityLabel="Video opslaan"
                accessibilityHint="Tik om deze video op te slaan"
                accessibilityRole="button"
              >
                Opslaan
              </Button>
            </View>
          </View>
        )}
      </View>

      {/* Max Duration Warning */}
      {isRecording && duration > MAX_DURATION - 60 && (
        <View style={styles.warningContainer}>
          <Text variant="bodySmall" style={styles.warningText}>
            ⚠️ Nog {MAX_DURATION - duration} seconden resterend
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.roundness,
    overflow: 'hidden',
  },
  cameraContainer: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: '#000',
    borderRadius: lightTheme.roundness,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: '#000',
    borderRadius: lightTheme.roundness,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    flex: 1,
  },
  timerOverlay: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: lightTheme.colors.error,
    marginRight: 8,
  },
  timerText: {
    color: 'white',
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  playbackOverlay: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  playbackTime: {
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontVariant: ['tabular-nums'],
  },
  cameraControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  progressBar: {
    height: 4,
    marginTop: 12,
    borderRadius: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 16,
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
  statusText: {
    color: lightTheme.colors.onSurfaceVariant,
  },
  controlsContainer: {
    alignItems: 'center',
    padding: 16,
  },
  primaryButton: {
    minWidth: 220,
    borderRadius: lightTheme.roundness,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  recordingControls: {
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: lightTheme.colors.error,
    width: 80,
    height: 80,
    borderRadius: 40,
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
  warningContainer: {
    backgroundColor: semanticColors.warningLight,
    padding: 12,
    marginTop: 8,
    borderRadius: lightTheme.roundness,
  },
  warningText: {
    color: semanticColors.warning,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  permissionTitle: {
    color: lightTheme.colors.onSurface,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionText: {
    color: lightTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    borderRadius: lightTheme.roundness,
  },
});
