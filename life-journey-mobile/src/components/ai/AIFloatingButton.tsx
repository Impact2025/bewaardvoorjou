import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { AIAssistant } from './AIAssistant';
import { lightTheme } from '@/lib/theme';
import { haptics } from '@/lib/haptics';
import type { ChapterId } from '@/lib/types';

interface AIFloatingButtonProps {
  chapterId?: ChapterId;
  position?: 'bottom-right' | 'bottom-left';
  style?: any;
}

const AnimatedFAB = Animated.createAnimatedComponent(FAB);

export function AIFloatingButton({
  chapterId,
  position = 'bottom-right',
  style,
}: AIFloatingButtonProps) {
  const [visible, setVisible] = useState(false);
  const scale = useSharedValue(1);

  const handlePress = () => {
    haptics.medium();

    // Pulse animation
    scale.value = withSequence(
      withSpring(0.9, { duration: 100 }),
      withSpring(1, { duration: 100 })
    );

    setVisible(true);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const positionStyle = position === 'bottom-right' ? styles.fabRight : styles.fabLeft;

  return (
    <>
      <AnimatedFAB
        icon="robot"
        style={[positionStyle, animatedStyle, style]}
        onPress={handlePress}
        color="white"
        customSize={60}
        accessible={true}
        accessibilityLabel="Open AI assistent"
        accessibilityHint="Tik voor hulp van de AI assistent"
        accessibilityRole="button"
      />

      <AIAssistant
        visible={visible}
        onDismiss={() => setVisible(false)}
        chapterId={chapterId}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fabRight: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: lightTheme.colors.tertiary,
    borderRadius: 30,
  },
  fabLeft: {
    position: 'absolute',
    margin: 16,
    left: 0,
    bottom: 0,
    backgroundColor: lightTheme.colors.tertiary,
    borderRadius: 30,
  },
});
