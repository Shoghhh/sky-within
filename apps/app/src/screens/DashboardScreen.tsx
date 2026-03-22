import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { api } from '../lib/api';
import type { DailyMessage, TransitAspect } from '../lib/api';
import { usePreferences } from '../lib/preferences';
import { useTranslation } from '../lib/i18n';
import { spacing } from '../constants/theme';
import PlanetIcon from '../components/PlanetIcon';
import FadeInView from '../components/FadeInView';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }: { navigation: any }) {
  const { colors, language } = usePreferences();
  const t = useTranslation(language);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [message, setMessage] = useState<DailyMessage | null>(null);
  const [transits, setTransits] = useState<TransitAspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMessage = useCallback(async () => {
    try {
      const [msg, tr] = await Promise.all([
        api.dailyMessage.get(),
        api.dailyMessage.getTransits().catch(() => []),
      ]);
      setMessage(msg);
      setTransits(tr ?? []);
    } catch (e: unknown) {
      const err = e as { message?: string };
      Alert.alert(t('common.error'), err.message || t('dashboard.errorLoad'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMessage();
  }, [fetchMessage]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMessage();
  };

  const generateNew = async () => {
    try {
      setLoading(true);
      const data = await api.dailyMessage.generate();
      setMessage(data);
    } catch (e: unknown) {
      const err = e as { message?: string };
      Alert.alert(t('common.error'), err.message || t('dashboard.errorGenerate'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !message) {
    return (
      <View style={[styles.container, styles.centered, styles.gradientBg]}>
        <View style={styles.loadingOrbs}>
          <PlanetIcon name="Sun" size={48} animated />
          <PlanetIcon name="Moon" size={36} animated />
        </View>
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.gradientBg]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <FadeInView delay={0}>
          <View style={styles.header}>
            <PlanetIcon name="Sun" size={32} style={styles.headerIcon} />
            <Text style={styles.title}>{t('dashboard.title')}</Text>
            <PlanetIcon name="Moon" size={28} style={styles.headerIcon} />
          </View>
        </FadeInView>

        {message ? (
          <>
            <FadeInView delay={80}>
              <View style={styles.card}>
                <View style={styles.cardGlow} />
                <Text style={styles.message}>{message.message}</Text>
              </View>
            </FadeInView>

            <FadeInView delay={160}>
              <View style={styles.dominantEnergy}>
                <Text style={styles.dominantLabel}>{t('dashboard.dominantEnergy')}</Text>
                <Text style={styles.dominantValue}>{message.dominantLayer}</Text>
                <View style={styles.intensityRow}>
                  <View style={[styles.intensityDot, { backgroundColor: colors.accent }]} />
                  <Text style={styles.intensityLabel}>
                    {t('dashboard.intensity')}: <Text style={styles.intensityValue}>{message.intensity}</Text>
                  </Text>
                </View>
              </View>
            </FadeInView>

            {transits.length > 0 && (
              <FadeInView delay={240}>
                <Text style={styles.transitSectionTitle}>{t('dashboard.quickTransits')}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.transitScroll}
                  contentContainerStyle={styles.transitScrollContent}
                >
                  {transits.slice(0, 5).map((t, i) => (
                    <View key={i} style={styles.transitCard}>
                      <View style={styles.transitCardHeader}>
                        <PlanetIcon name={t.planet} size={18} animated={false} />
                        <PlanetIcon name={t.target} size={16} animated={false} />
                      </View>
                      <Text style={styles.transitText}>
                        {t.planet} → {t.target}
                      </Text>
                      <Text style={styles.transitAspect}>{t.aspect}</Text>
                    </View>
                  ))}
                </ScrollView>
              </FadeInView>
            )}

            <FadeInView delay={320}>
              <TouchableOpacity
                style={[styles.primaryButton, styles.buttonGradient]}
                onPress={() => navigation.navigate('Transits')}
                activeOpacity={0.8}
              >
                <PlanetIcon name="Sun" size={20} animated={false} />
                <Text style={styles.primaryButtonText}>{t('dashboard.seeAllTransits')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Journal')}
                activeOpacity={0.8}
              >
                <PlanetIcon name="Moon" size={20} animated={false} />
                <Text style={styles.secondaryButtonText}>{t('dashboard.reflect')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={generateNew}
                disabled={loading}
              >
                <Text style={styles.linkText}>{t('dashboard.regenerate')}</Text>
              </TouchableOpacity>
            </FadeInView>
          </>
        ) : (
          <FadeInView>
            <View style={styles.emptyCard}>
              <PlanetIcon name="Moon" size={48} />
              <Text style={styles.empty}>
                {t('dashboard.empty')}
              </Text>
            </View>
          </FadeInView>
        )}
      </ScrollView>
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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 3,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOrbs: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  headerIcon: {
    opacity: 0.9,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: c.primary,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: (c as any).cardTint ?? 'rgba(99, 102, 241, 0.12)',
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: (c as any).cardBorder ?? c.border,
    overflow: 'hidden',
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(129, 140, 248, 0.4)',
  },
  message: {
    fontSize: 18,
    lineHeight: 28,
    color: c.text,
  },
  dominantEnergy: {
    backgroundColor: (c as any).cardBg ?? c.surface,
    padding: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: (c as any).cardBorder ?? c.border,
  },
  dominantLabel: {
    fontSize: 12,
    color: c.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dominantValue: {
    fontSize: 22,
    fontWeight: '700',
    color: c.accentLight,
  },
  intensityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  intensityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  intensityLabel: {
    fontSize: 14,
    color: c.textSecondary,
  },
  intensityValue: {
    fontWeight: '600',
    color: c.primary,
  },
  transitSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  transitScroll: {
    marginHorizontal: -spacing.lg,
    marginBottom: spacing.lg,
  },
  transitScrollContent: {
    paddingHorizontal: spacing.lg,
  },
  transitCard: {
    backgroundColor: (c as any).cardTint ?? 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    minWidth: 120,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: (c as any).cardBorder ?? c.border,
  },
  transitCardHeader: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  transitText: {
    fontSize: 12,
    fontWeight: '600',
    color: c.primary,
  },
  transitAspect: {
    fontSize: 11,
    color: c.textSecondary,
    marginTop: 2,
  },
  primaryButton: {
    borderRadius: 16,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    shadowColor: c.accentGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: c.gradientStart,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: (c as any).secondaryButtonBg ?? c.surface,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: (c as any).secondaryButtonBorder ?? c.border,
  },
  secondaryButtonText: {
    color: c.accentLight,
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  linkText: {
    color: c.textSecondary,
    fontSize: 14,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  empty: {
    fontSize: 16,
    color: c.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
}
