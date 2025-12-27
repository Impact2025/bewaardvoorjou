import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { lightTheme } from '@/lib/theme';

export type RecordingModality = 'audio' | 'video' | 'text';

interface ModalitySelectorProps {
  value: RecordingModality;
  onChange: (modality: RecordingModality) => void;
  availableModalities?: RecordingModality[];
}

export function ModalitySelector({
  value,
  onChange,
  availableModalities = ['audio', 'video', 'text'],
}: ModalitySelectorProps) {
  const buttons = [
    {
      value: 'audio',
      label: 'Audio',
      icon: 'microphone',
      disabled: !availableModalities.includes('audio'),
    },
    {
      value: 'video',
      label: 'Video',
      icon: 'video',
      disabled: !availableModalities.includes('video'),
    },
    {
      value: 'text',
      label: 'Tekst',
      icon: 'text',
      disabled: !availableModalities.includes('text'),
    },
  ];

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel="Kies opname type"
      accessibilityRole="radiogroup"
    >
      <SegmentedButtons
        value={value}
        onValueChange={(value) => onChange(value as RecordingModality)}
        buttons={buttons}
        style={styles.segmentedButtons}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  segmentedButtons: {
    borderRadius: lightTheme.roundness,
  },
});
