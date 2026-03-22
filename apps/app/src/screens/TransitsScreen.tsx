import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../lib/api';
import type { TransitAspect } from '../lib/api';
import { usePreferences } from '../lib/preferences';
import { useTranslation } from '../lib/i18n';
import { spacing } from '../constants/theme';
import PlanetIcon from '../components/PlanetIcon';
import FadeInView from '../components/FadeInView';

export default function TransitsScreen({ navigation }: { navigation: any }) {
  const { colors, language } = usePreferences();
  const t = useTranslation(language);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [transits, setTransits] = useState<TransitAspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransits = useCallback(async () => {
    try {
      const data = await api.dailyMessage.getTransits();
      setTransits(data);
    } catch (e: unknown) {
      const err = e as { message?: string };
      Alert.alert(t('common.error'), err.message || t('transits.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransits();
  }, [fetchTransits]);

  const intensityColor = (i: string) => {
    if (i === 'high') return colors.error;
    if (i === 'medium') return colors.accent;
    return colors.success;
  };

  const renderItem = ({ item, index }: { item: TransitAspect; index: number }) => (
    <FadeInView delay={index * 40}>
      <View style={styles.row}>
        <View style={styles.cell}>
          <View style={styles.planetCell}>
            <PlanetIcon name={item.planet} size={20} animated={false} />
            <Text style={styles.planet}>{item.planet}</Text>
          </View>
        </View>
        <View style={styles.cell}>
          <View style={styles.planetCell}>
            <PlanetIcon name={item.target} size={18} animated={false} />
            <Text style={styles.target}>{item.target}</Text>
          </View>
        </View>
        <View style={styles.cell}>
          <Text style={styles.aspect}>{item.aspect}</Text>
        </View>
        <View style={styles.cell}>
          <View style={[styles.orbBadge, { backgroundColor: `${intensityColor(item.intensity)}20` }]}>
            <Text style={[styles.orb, { color: intensityColor(item.intensity) }]}>
              {item.orb}°
            </Text>
          </View>
        </View>
      </View>
    </FadeInView>
  );

  if (loading && transits.length === 0) {
    return (
      <View style={[styles.container, styles.centered, styles.gradientBg]}>
        <PlanetIcon name="Sun" size={48} />
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.gradientBg]}>
      <View style={styles.container}>
        <FadeInView>
          <View style={styles.header}>
            <View style={styles.headerIcons}>
              <PlanetIcon name="Sun" size={28} style={{ opacity: 0.9 }} />
              <PlanetIcon name="Moon" size={24} style={{ opacity: 0.9 }} />
            </View>
            <Text style={styles.title}>{t('transits.title')}</Text>
            <Text style={styles.subtitle}>
              {t('transits.subtitle')}
            </Text>
          </View>
        </FadeInView>

        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>{t('transits.planet')}</Text>
          <Text style={styles.headerCell}>{t('transits.target')}</Text>
          <Text style={styles.headerCell}>{t('transits.aspect')}</Text>
          <Text style={styles.headerCell}>{t('transits.orb')}</Text>
        </View>

        <FlatList
          data={transits}
          keyExtractor={(item, i) => `${item.planet}-${item.target}-${i}`}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchTransits}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <PlanetIcon name="Moon" size={48} />
              <Text style={styles.empty}>
                {t('transits.empty')}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

function createStyles(c: typeof import('../constants/theme').colors.light) {
  return StyleSheet.create({
  gradientBg: {
    flex: 1,
    backgroundColor: c.background,
  },
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: c.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: c.textSecondary,
    marginTop: spacing.xs,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: (c as any).cardBg ?? c.surface,
    borderBottomWidth: 1,
    borderBottomColor: (c as any).cardBorder ?? c.border,
  },
  headerCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: c.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
  },
  planetCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planet: {
    fontSize: 14,
    fontWeight: '600',
    color: c.primary,
  },
  aspect: {
    fontSize: 14,
    color: c.text,
  },
  target: {
    fontSize: 14,
    color: c.text,
  },
  orbBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  orb: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl * 2,
  },
  empty: {
    marginTop: spacing.lg,
    textAlign: 'center',
    color: c.textSecondary,
  },
});
}
