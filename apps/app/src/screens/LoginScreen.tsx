import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useAuth } from '../lib/auth';
import { usePreferences } from '../lib/preferences';
import { useTranslation } from '../lib/i18n';
import { spacing } from '../constants/theme';
import PlanetIcon from '../components/PlanetIcon';

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { colors, language } = usePreferences();
  const t = useTranslation(language);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const opacity = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(t('common.error'), t('login.errorEmpty'));
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e: unknown) {
      const err = e as { message?: string };
      Alert.alert(t('login.errorTitle'), err.message || t('login.errorFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.orbHeader}>
            <Animated.View style={{ opacity }}>
              <PlanetIcon name="Sun" size={48} animated={false} />
            </Animated.View>
            <Animated.View style={{ opacity }}>
              <PlanetIcon name="Moon" size={40} animated={false} />
            </Animated.View>
          </View>
          <Text style={styles.title}>{t('login.title')}</Text>
          <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

          <TextInput
            style={styles.input}
            placeholder={t('login.email')}
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder={t('login.password')}
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.buttonWrapper, styles.button]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('login.button')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>{t('login.link')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(c: typeof import('../constants/theme').colors.light) {
  return StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: c.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  orbHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: c.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: c.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: (c as any).inputBg ?? c.surface,
    borderWidth: 1,
    borderColor: (c as any).inputBorder ?? c.border,
    borderRadius: 16,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
    color: c.text,
  },
  buttonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: spacing.sm,
    shadowColor: c.accentGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  button: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: c.gradientStart,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  link: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    color: c.accent,
    fontSize: 14,
  },
  });
}
