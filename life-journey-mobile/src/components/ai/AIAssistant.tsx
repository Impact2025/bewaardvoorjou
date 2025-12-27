import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  TextInput,
  IconButton,
  Card,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useAIChat, useAISuggestions } from '@/hooks/use-ai';
import { lightTheme, semanticColors } from '@/lib/theme';
import { haptics } from '@/lib/haptics';
import type { ChapterId } from '@/lib/types';

interface AIAssistantProps {
  visible: boolean;
  onDismiss: () => void;
  chapterId?: ChapterId;
  initialPrompt?: string;
}

export function AIAssistant({
  visible,
  onDismiss,
  chapterId,
  initialPrompt,
}: AIAssistantProps) {
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    messages,
    streamingMessage,
    isStreaming,
    error,
    streamMessage,
    cancelStream,
    clearMessages,
  } = useAIChat();

  const { suggestions, loadSuggestions } = useAISuggestions(chapterId || ('intro-welcome' as ChapterId));

  useEffect(() => {
    if (visible && chapterId) {
      loadSuggestions();
    }
  }, [visible, chapterId]);

  useEffect(() => {
    if (visible && initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [visible, initialPrompt]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0 || streamingMessage) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, streamingMessage]);

  const handleSendMessage = async (message?: string) => {
    const textToSend = message || input.trim();

    if (!textToSend) return;

    await haptics.light();
    setInput('');

    await streamMessage(textToSend, chapterId);
  };

  const handleSuggestionPress = (suggestion: string) => {
    haptics.light();
    setInput(suggestion);
  };

  const handleClose = () => {
    haptics.medium();
    if (isStreaming) {
      cancelStream();
    }
    onDismiss();
  };

  const handleClearChat = () => {
    haptics.light();
    clearMessages();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={styles.modal}
      >
        <Animated.View
          entering={SlideInDown.springify()}
          exiting={SlideOutDown.springify()}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.aiIcon}>
                <Text style={styles.aiEmoji}>🤖</Text>
              </View>
              <View style={styles.headerText}>
                <Text variant="titleLarge" style={styles.title}>
                  AI Assistent
                </Text>
                <Text variant="bodySmall" style={styles.subtitle}>
                  Stel me alles over je levensverhaal
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              {messages.length > 0 && (
                <IconButton
                  icon="delete-outline"
                  size={20}
                  onPress={handleClearChat}
                  accessible={true}
                  accessibilityLabel="Wis chat"
                />
              )}
              <IconButton
                icon="close"
                size={24}
                onPress={handleClose}
                accessible={true}
                accessibilityLabel="Sluit assistent"
              />
            </View>
          </View>

          {/* Suggestions */}
          {messages.length === 0 && suggestions.length > 0 && (
            <Animated.View entering={FadeIn.delay(300)} style={styles.suggestions}>
              <Text variant="labelMedium" style={styles.suggestionsLabel}>
                Suggesties om te beginnen:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsContent}
              >
                {suggestions.map((suggestion, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    <Chip
                      mode="outlined"
                      icon="lightbulb-outline"
                      style={styles.suggestionChip}
                    >
                      {suggestion}
                    </Chip>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 && !streamingMessage && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>💬</Text>
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  Welkom bij je AI Assistent
                </Text>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  Ik help je bij het vertellen van je levensverhaal. Stel me vragen,
                  vraag om inspiratie, of deel je gedachten!
                </Text>
              </View>
            )}

            {messages.map((message, index) => (
              <Animated.View
                key={index}
                entering={FadeIn.delay(index * 50)}
                style={[
                  styles.messageBubble,
                  message.role === 'user'
                    ? styles.userBubble
                    : styles.assistantBubble,
                ]}
              >
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.messageText,
                    message.role === 'user'
                      ? styles.userText
                      : styles.assistantText,
                  ]}
                >
                  {message.content}
                </Text>
              </Animated.View>
            ))}

            {streamingMessage && (
              <Animated.View
                entering={FadeIn}
                style={[styles.messageBubble, styles.assistantBubble]}
              >
                <Text variant="bodyMedium" style={styles.assistantText}>
                  {streamingMessage}
                  <Text style={styles.cursor}>▋</Text>
                </Text>
              </Animated.View>
            )}

            {error && (
              <Card style={styles.errorCard}>
                <Card.Content>
                  <Text variant="bodySmall" style={styles.errorText}>
                    ⚠️ {error}
                  </Text>
                </Card.Content>
              </Card>
            )}
          </ScrollView>

          {/* Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                value={input}
                onChangeText={setInput}
                placeholder="Typ je vraag of gedachte..."
                multiline
                maxLength={500}
                style={styles.input}
                disabled={isStreaming}
                onSubmitEditing={() => handleSendMessage()}
                accessible={true}
                accessibilityLabel="Chat invoer"
                accessibilityHint="Typ je bericht aan de AI assistent"
              />

              {isStreaming ? (
                <IconButton
                  icon="stop-circle"
                  size={28}
                  iconColor={lightTheme.colors.error}
                  onPress={cancelStream}
                  style={styles.sendButton}
                  accessible={true}
                  accessibilityLabel="Stop streaming"
                />
              ) : (
                <IconButton
                  icon="send"
                  size={28}
                  iconColor={lightTheme.colors.primary}
                  onPress={() => handleSendMessage()}
                  disabled={!input.trim()}
                  style={styles.sendButton}
                  accessible={true}
                  accessibilityLabel="Verstuur bericht"
                  accessibilityHint="Tik om je vraag te sturen"
                />
              )}
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: lightTheme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.outlineVariant,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: lightTheme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiEmoji: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: lightTheme.colors.onSurface,
  },
  subtitle: {
    color: lightTheme.colors.onSurfaceVariant,
  },
  headerActions: {
    flexDirection: 'row',
  },
  suggestions: {
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: lightTheme.colors.outlineVariant,
  },
  suggestionsLabel: {
    color: lightTheme.colors.onSurfaceVariant,
    marginBottom: 8,
  },
  suggestionsContent: {
    paddingRight: 16,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: lightTheme.colors.surfaceVariant,
  },
  messages: {
    flex: 1,
    maxHeight: 500,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: 'bold',
    color: lightTheme.colors.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: lightTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: lightTheme.colors.primaryContainer,
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: lightTheme.colors.surfaceVariant,
    alignSelf: 'flex-start',
  },
  messageText: {
    lineHeight: 20,
  },
  userText: {
    color: lightTheme.colors.onPrimaryContainer,
  },
  assistantText: {
    color: lightTheme.colors.onSurface,
  },
  cursor: {
    color: lightTheme.colors.primary,
    fontWeight: 'bold',
  },
  errorCard: {
    backgroundColor: semanticColors.errorLight,
    marginTop: 8,
  },
  errorText: {
    color: lightTheme.colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: lightTheme.colors.outlineVariant,
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
  },
  sendButton: {
    margin: 0,
  },
});
