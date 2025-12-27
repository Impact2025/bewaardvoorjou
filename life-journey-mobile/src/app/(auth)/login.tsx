import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useRouter, Link } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth-store';
import { lightTheme } from '@/lib/theme';
import { Toast } from '@/components/ui/Toast';
import { useToast } from '@/hooks/use-toast';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { toast, showSuccess, hideToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Validation
    if (!email || !password) {
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Voer een geldig e-mailadres in');
      return;
    }

    setEmailError('');
    clearError();

    try {
      await login(email.toLowerCase().trim(), password);
      showSuccess('Welkom terug! Je bent ingelogd.');
      // Navigation handled by auth guard in _layout.tsx
      setTimeout(() => router.replace('/(tabs)/dashboard'), 500);
    } catch (err) {
      // Error is already set in the store
      console.error('Login error:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            Welkom terug
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Log in om je levensverhaal te vervolgen
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="E-mailadres"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
              clearError();
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            error={!!emailError}
            mode="outlined"
            style={styles.input}
          />
          <HelperText type="error" visible={!!emailError}>
            {emailError}
          </HelperText>

          <TextInput
            label="Wachtwoord"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              clearError();
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          {error && (
            <HelperText type="error" visible={true} style={styles.errorText}>
              {error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading || !email || !password}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Inloggen
          </Button>

          <View style={styles.registerLink}>
            <Text variant="bodyMedium" style={styles.registerText}>
              Nog geen account?{' '}
            </Text>
            <Link href="/(auth)/register" asChild>
              <Text variant="bodyMedium" style={styles.link}>
                Registreer nu
              </Text>
            </Link>
          </View>
        </View>

        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={hideToast}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    color: lightTheme.colors.onBackground,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: lightTheme.colors.onSurfaceVariant,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    borderRadius: lightTheme.roundness,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: lightTheme.colors.onSurfaceVariant,
  },
  link: {
    color: lightTheme.colors.primary,
    fontWeight: 'bold',
  },
});
