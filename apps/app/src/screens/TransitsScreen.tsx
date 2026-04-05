import React, { useState, useCallback, useLayoutEffect, useMemo, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { api } from '../lib/api';
import type { TransitAspect } from '../lib/api';
import { usePreferences } from '../lib/preferences';
import { useTranslation } from '../lib/i18n';
import { spacing } from '../constants/theme';
import TransitsSection from '../components/TransitsSection';

export default function TransitsScreen({
  navigation,
}: {
  navigation: { setOptions: (options: { title?: string }) => void };
}) {
  const { colors, language } = usePreferences();
  const t = useTranslation(language);
  const styles = useMemo(() => createStyles(), []);

  const [transits, setTransits] = useState<TransitAspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const tr = await api.dailyMessage.getTransits();
      setTransits(tr ?? []);
    } catch {
      setTransits([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('transits.title') });
  }, [navigation, t, language]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && transits.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('transits.loadingRow')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      <TransitsSection transits={transits} loading={loading && transits.length === 0} />
    </ScrollView>
  );
}

function createStyles() {
  return StyleSheet.create({
    scroll: { flex: 1 },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xl * 2,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
    },
    loadingText: {
      fontSize: 14,
    },
  });
}
