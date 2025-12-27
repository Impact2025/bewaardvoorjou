import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/lib/stores/auth-store';
import { lightTheme, darkTheme } from '@/lib/theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const paperTheme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  const { session, isLoading, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Initialize database and auth on mount
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize WatermelonDB
      const { initializeDatabase } = await import('@/lib/db');
      await initializeDatabase();
      console.log('Database initialized');

      // Initialize auth
      await initialize();
    };

    initializeApp();
  }, []);

  // Initialize sync manager when logged in
  useEffect(() => {
    const setupSync = async () => {
      if (session?.token && session?.primaryJourneyId) {
        const { syncManager } = await import('@/lib/sync/manager');
        await syncManager.initialize(session.token, session.primaryJourneyId);
        console.log('Sync manager initialized');
      }
    };

    setupSync();

    // Cleanup on logout
    return () => {
      if (!session) {
        import('@/lib/sync/manager').then(({ syncManager }) => {
          syncManager.cleanup();
        });
      }
    };
  }, [session?.token, session?.primaryJourneyId]);

  // Auth guard - redirect based on auth state
  useEffect(() => {
    if (isLoading) return; // Wait for auth to initialize

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Redirect to dashboard if authenticated and on auth screens
      router.replace('/(tabs)/dashboard');
    }
  }, [session, segments, isLoading]);

  // Show nothing while loading auth state
  if (isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={navigationTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
