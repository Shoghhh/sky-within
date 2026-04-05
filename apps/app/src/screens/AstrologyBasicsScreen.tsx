import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api, mapLanguageForAstrologyBasicsApi, type AstrologyBasicsPayload } from '../lib/api';
import { usePreferences } from '../lib/preferences';
import { useTranslation } from '../lib/i18n';
import { spacing } from '../constants/theme';
import FadeInView from '../components/FadeInView';

type RootStackParamList = {
  MainTabs: undefined;
  AstrologyBasics: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AstrologyBasics'>;
};

export default function AstrologyBasicsScreen({ navigation }: Props) {
  const { colors, language } = usePreferences();
  const t = useTranslation(language);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [payload, setPayload] = useState<AstrologyBasicsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const lang = mapLanguageForAstrologyBasicsApi(language);
      const data = await api.education.getAstrologyBasics(lang);
      setPayload(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [language]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('education.title'),
      headerTintColor: colors.primary,
      headerStyle: { backgroundColor: colors.surface },
    });
  }, [navigation, t, language, colors.primary, colors.surface]);

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  if (loading && !payload) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.hint, { marginTop: spacing.md }]}>{t('education.loading')}</Text>
      </View>
    );
  }

  if (error && !payload) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, padding: spacing.lg }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{t('education.errorLoad')}</Text>
        <Text style={[styles.hint, { marginTop: spacing.sm }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryBtn, { borderColor: colors.accent }]}
          onPress={() => {
            setLoading(true);
            void load();
          }}
        >
          <Text style={[styles.retryBtnText, { color: colors.accent }]}>{t('education.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const concepts = payload?.concepts ?? [];

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      {error && payload ? (
        <Text style={[styles.banner, { color: colors.textSecondary, borderColor: colors.border }]}>
          {t('education.errorLoad')}
        </Text>
      ) : null}

      {concepts.map((c, idx) => (
        <FadeInView key={c.id} delay={idx * 40}>
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{c.title}</Text>

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('education.definition')}</Text>
            <Text style={[styles.body, { color: colors.text }]}>{c.definition}</Text>

            <Text style={[styles.label, { color: colors.textSecondary, marginTop: spacing.sm }]}>
              {t('education.explanation')}
            </Text>
            <Text style={[styles.body, { color: colors.text }]}>{c.explanation}</Text>

            <Text style={[styles.label, { color: colors.textSecondary, marginTop: spacing.sm }]}>
              {t('education.example')}
            </Text>
            <Text style={[styles.body, { color: colors.text }]}>{c.example}</Text>

            <Text style={[styles.label, { color: colors.textSecondary, marginTop: spacing.sm }]}>
              {t('education.summary')}
            </Text>
            <Text style={[styles.summary, { color: colors.accent }]}>{c.summary}</Text>

            {c.id === 'aspects' && c.aspectTypes ? (
              <View style={styles.aspectBlock}>
                <Text style={[styles.label, { color: colors.textSecondary, marginTop: spacing.md }]}>
                  {t('education.aspectTypes')}
                </Text>
                <AspectRow label={t('education.aspect.conjunction')} text={c.aspectTypes.conjunction} colors={colors} styles={styles} />
                <AspectRow label={t('education.aspect.trine')} text={c.aspectTypes.trine} colors={colors} styles={styles} />
                <AspectRow label={t('education.aspect.square')} text={c.aspectTypes.square} colors={colors} styles={styles} />
                <AspectRow label={t('education.aspect.opposition')} text={c.aspectTypes.opposition} colors={colors} styles={styles} />
              </View>
            ) : null}
          </View>
        </FadeInView>
      ))}
    </ScrollView>
  );
}

function AspectRow({
  label,
  text,
  colors,
  styles,
}: {
  label: string;
  text: string;
  colors: { text: string; textSecondary: string };
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.aspectRow}>
      <Text style={[styles.aspectLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );
}

function createStyles(colors: { border: string; surface: string; text: string; textSecondary: string; accent: string; background: string }) {
  return StyleSheet.create({
    scroll: { flex: 1 },
    content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    hint: { color: colors.textSecondary, fontSize: 14 },
    errorText: { fontSize: 16, textAlign: 'center', fontWeight: '600' },
    retryBtn: {
      marginTop: spacing.lg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: 12,
      borderWidth: 1,
    },
    retryBtnText: { fontWeight: '600' },
    banner: {
      marginBottom: spacing.md,
      padding: spacing.sm,
      borderWidth: 1,
      borderRadius: 8,
      fontSize: 13,
    },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: spacing.sm },
    label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
    body: { fontSize: 15, lineHeight: 22 },
    summary: { fontSize: 15, lineHeight: 22, fontWeight: '600', fontStyle: 'italic' },
    aspectBlock: { marginTop: spacing.xs },
    aspectRow: { marginTop: spacing.sm },
    aspectLabel: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  });
}
