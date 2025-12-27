import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Chip } from 'react-native-paper';
import { lightTheme } from '@/lib/theme';
import type { ChapterId } from '@/lib/types';

interface TextRecorderProps {
  chapterId: ChapterId;
  onTextComplete?: (text: string) => void;
  onTextCanceled?: () => void;
}

export function TextRecorder({
  chapterId,
  onTextComplete,
  onTextCanceled,
}: TextRecorderProps) {
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const minWords = 50; // Minimum voor een betekenisvol verhaal

  const handleSave = () => {
    if (wordCount < minWords) {
      alert(`Schrijf minimaal ${minWords} woorden voor een betekenisvol verhaal.`);
      return;
    }

    setIsSaving(true);
    onTextComplete?.(text);
  };

  const handleCancel = () => {
    if (text.length > 0) {
      const confirmed = confirm('Weet je zeker dat je dit verhaal wilt annuleren? Je tekst gaat verloren.');
      if (!confirmed) return;
    }
    setText('');
    onTextCanceled?.();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            Schrijf je verhaal
          </Text>

          <View style={styles.stats}>
            <Chip
              compact
              icon="text"
              style={[
                styles.statChip,
                wordCount >= minWords && styles.statChipValid,
              ]}
            >
              {wordCount} woorden
            </Chip>
            <Chip compact icon="format-letter-case" style={styles.statChip}>
              {charCount} tekens
            </Chip>
          </View>
        </View>

        <TextInput
          mode="outlined"
          multiline
          numberOfLines={15}
          value={text}
          onChangeText={setText}
          placeholder="Begin hier met het vertellen van je verhaal... Neem de tijd, deel je herinneringen en emoties."
          style={styles.textInput}
          outlineStyle={styles.textInputOutline}
          disabled={isSaving}
          accessible={true}
          accessibilityLabel="Tekst invoer voor je verhaal"
          accessibilityHint="Schrijf hier je levensverhaal"
        />

        {wordCount > 0 && wordCount < minWords && (
          <Text variant="bodySmall" style={styles.hint}>
            💡 Schrijf nog {minWords - wordCount} woorden voor een betekenisvol verhaal
          </Text>
        )}

        <View style={styles.tips}>
          <Text variant="labelLarge" style={styles.tipsTitle}>
            Tips voor een goed verhaal:
          </Text>
          <Text variant="bodySmall" style={styles.tip}>
            • Schrijf alsof je tegen je kleinkinderen praat
          </Text>
          <Text variant="bodySmall" style={styles.tip}>
            • Deel details: geuren, geluiden, emoties
          </Text>
          <Text variant="bodySmall" style={styles.tip}>
            • Wees eerlijk en authentiek
          </Text>
          <Text variant="bodySmall" style={styles.tip}>
            • Geen perfectie vereist - je echte stem is het belangrijkst
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.button}
            disabled={isSaving}
            accessible={true}
            accessibilityLabel="Annuleer tekst"
            accessibilityHint="Tik om dit verhaal te annuleren"
            accessibilityRole="button"
          >
            Annuleren
          </Button>

          <Button
            mode="contained"
            onPress={handleSave}
            icon="check"
            style={styles.button}
            loading={isSaving}
            disabled={isSaving || wordCount < minWords}
            accessible={true}
            accessibilityLabel="Sla verhaal op"
            accessibilityHint={`Tik om je verhaal van ${wordCount} woorden op te slaan`}
            accessibilityRole="button"
          >
            Opslaan
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.surface,
    borderRadius: lightTheme.roundness,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    color: lightTheme.colors.onSurface,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    backgroundColor: lightTheme.colors.surfaceVariant,
  },
  statChipValid: {
    backgroundColor: lightTheme.colors.primaryContainer,
  },
  textInput: {
    minHeight: 240,
    textAlignVertical: 'top',
    fontSize: 16,
    lineHeight: 24,
  },
  textInputOutline: {
    borderRadius: lightTheme.roundness,
  },
  hint: {
    color: lightTheme.colors.primary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  tips: {
    backgroundColor: lightTheme.colors.surfaceVariant,
    padding: 16,
    borderRadius: lightTheme.roundness,
    marginTop: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    fontWeight: 'bold',
    color: lightTheme.colors.onSurface,
    marginBottom: 8,
  },
  tip: {
    color: lightTheme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: lightTheme.roundness,
  },
});
