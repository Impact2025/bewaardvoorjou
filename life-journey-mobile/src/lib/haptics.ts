import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utilities for premium feel
 * Only works on physical devices, not simulators
 */

export const haptics = {
  /**
   * Light impact - for subtle interactions
   * Use for: Toggling switches, selecting items
   */
  light: async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Haptics not available, fail silently
      }
    }
  },

  /**
   * Medium impact - for standard interactions
   * Use for: Button presses, navigation
   */
  medium: async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        // Haptics not available, fail silently
      }
    }
  },

  /**
   * Heavy impact - for important actions
   * Use for: Saving, completing, deleting
   */
  heavy: async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (error) {
        // Haptics not available, fail silently
      }
    }
  },

  /**
   * Success notification - positive feedback
   * Use for: Successful saves, completions
   */
  success: async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        // Haptics not available, fail silently
      }
    }
  },

  /**
   * Warning notification - cautionary feedback
   * Use for: Warnings, required fields
   */
  warning: async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (error) {
        // Haptics not available, fail silently
      }
    }
  },

  /**
   * Error notification - negative feedback
   * Use for: Errors, failed actions
   */
  error: async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (error) {
        // Haptics not available, fail silently
      }
    }
  },

  /**
   * Selection feedback - for precise selections
   * Use for: Picker changes, scrolling through items
   */
  selection: async () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        await Haptics.selectionAsync();
      } catch (error) {
        // Haptics not available, fail silently
      }
    }
  },
};

/**
 * Convenience wrapper for button presses
 */
export const buttonPress = () => haptics.medium();

/**
 * Convenience wrapper for successful actions
 */
export const actionSuccess = () => haptics.success();

/**
 * Convenience wrapper for errors
 */
export const actionError = () => haptics.error();
