import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>({});

  const { login, isLoading, error } = useAuthStore();

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!email) {
      newErrors.email = 'Email gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Geçerli bir email giriniz';
    }
    
    if (!password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(email, password);
      // Navigation will be handled by the auth state
    } catch (err) {
      // Error is handled in the store
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>�</Text>
          </View>
          <Text style={styles.title}>Tesettür Giyim</Text>
          <Text style={styles.subtitle}>Admin Panel</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="ornek@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="email"
            error={errors.email}
          />

          <Input
            label="Şifre"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon="lock"
            error={errors.password}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            title="Giriş Yap"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            style={styles.loginButton}
          />

          <Button
            title="Hesap Oluştur"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
            fullWidth
          />
        </View>

        <Text style={styles.version}>Versiyon 1.0.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 8px rgba(0,0,0,0.12)' }
      : { elevation: 4 }) as any,
  },
  logoEmoji: {
    fontSize: 50,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  loginButton: {
    marginBottom: SPACING.md,
  },
  errorContainer: {
    backgroundColor: `${COLORS.error}15`,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  version: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
});
