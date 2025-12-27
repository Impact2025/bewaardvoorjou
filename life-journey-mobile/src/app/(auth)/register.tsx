import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, SegmentedButtons } from 'react-native-paper';
import { useRouter, Link } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth-store';
import { lightTheme } from '@/lib/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleRegister = async () => {
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setDisplayNameError('');
    clearError();

    // Validation
    let hasErrors = false;

    if (!email || !validateEmail(email)) {
      setEmailError('Voer een geldig e-mailadres in');
      hasErrors = true;
    }

    if (!displayName || displayName.trim().length < 2) {
      setDisplayNameError('Voer een naam in (minimaal 2 tekens)');
      hasErrors = true;
    }

    if (!password || !validatePassword(password)) {
      setPasswordError('Wachtwoord moet minimaal 8 tekens bevatten');
      hasErrors = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Wachtwoorden komen niet overeen');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      await register({
        email: email.toLowerCase().trim(),
        password,
        displayName: displayName.trim(),
        country: 'NL',
        locale: 'nl',
        birthYear: birthYear ? parseInt(birthYear) : undefined,
      });

      // Navigation handled by auth guard
      router.replace('/(tabs)/dashboard');
    } catch (err) {
      // Error is already set in the store
      console.error('Registration error:', err);
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
            Begin je reis
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Creëer je account om je levensverhaal vast te leggen
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Naam"
            value={displayName}
            onChangeText={(text) => {
              setDisplayName(text);
              setDisplayNameError('');
            }}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            error={!!displayNameError}
            mode="outlined"
            style={styles.input}
          />
          <HelperText type="error" visible={!!displayNameError}>
            {displayNameError}
          </HelperText>

          <TextInput
            label="E-mailadres"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
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
              setPasswordError('');
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            textContentType="newPassword"
            error={!!passwordError}
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          <HelperText type="error" visible={!!passwordError}>
            {passwordError}
          </HelperText>

          <TextInput
            label="Bevestig wachtwoord"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setConfirmPasswordError('');
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            textContentType="newPassword"
            error={!!confirmPasswordError}
            mode="outlined"
            style={styles.input}
          />
          <HelperText type="error" visible={!!confirmPasswordError}>
            {confirmPasswordError}
          </HelperText>

          <TextInput
            label="Geboortejaar (optioneel)"
            value={birthYear}
            onChangeText={setBirthYear}
            keyboardType="number-pad"
            maxLength={4}
            mode="outlined"
            style={styles.input}
            placeholder="bijv. 1975"
          />

          {error && (
            <HelperText type="error" visible={true} style={styles.errorText}>
              {error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Account aanmaken
          </Button>

          <View style={styles.loginLink}>
            <Text variant="bodyMedium" style={styles.loginText}>
              Heb je al een account?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Text variant="bodyMedium" style={styles.link}>
                Log in
              </Text>
            </Link>
          </View>
        </View>
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
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 24,
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
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: lightTheme.colors.onSurfaceVariant,
  },
  link: {
    color: lightTheme.colors.primary,
    fontWeight: 'bold',
  },
});
