import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { api } from '../lib/api';
import type { DailyMessage, TransitAspect } from '../lib/api';
import { usePreferences } from '../lib/preferences';
import { useTranslation } from '../lib/i18n';
import { spacing, colors as themeColors } from '../constants/theme';
import PlanetIcon from '../components/PlanetIcon';
import FadeInView from '../components/FadeInView';
import QuickTransitStrip from '../components/QuickTransitStrip';

const { width } = Dimensions.get('window');

function translateDashboardLayer(layer: string, tr: (k: string) => string): string {
  const k = `dashboard.layer.${layer}`;
  const v = tr(k);
  return v === k ? layer : v;
}

function translateIntensityLevel(level: string, tr: (k: string) => string): string {
  const k = `dashboard.intensityLevel.${level}`;
  const v = tr(k);
  return v === k ? level : v;
}

function translateAdviceType(value: string, tr: (k: string) => string): string {
  const k = `dashboard.adviceType.${value}`;
  const v = tr(k);
  return v === k ? value : v;
}

function translateTone(value: string, tr: (k: string) => string): string {
  const k = `dashboard.tone.${value}`;
  const v = tr(k);
  return v === k ? value : v;
}

export default function DashboardScreen({ navigation }: { navigation: { navigate: (name: string) => void } }) {
  const { colors, language } = usePreferences();
  const t = useTranslation(language);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [message, setMessage] = useState<DailyMessage | null>(null);
  const [transits, setTransits] = useState<TransitAspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMessage = useCallback(async (refresh = false) => {
    try {
      const [msg, tr] = await Promise.all([
        api.dailyMessage.get(undefined, refresh ? { refresh: true } : undefined),
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
  }, [t]);

  useEffect(() => {
    fetchMessage();
  }, [fetchMessage]);

  const skipLanguageRefresh = useRef(true);
  useEffect(() => {
    if (skipLanguageRefresh.current) {
      skipLanguageRefresh.current = false;
      return;
    }
    void fetchMessage(true);
  }, [language, fetchMessage]);

  const onRefresh = () => {
    setRefreshing(true);
    void fetchMessage(true);
  };

  const generateNew = async () => {
    try {
      setLoading(true);
      const data = await api.dailyMessage.generate();
      setMessage(data);
      const tr = await api.dailyMessage.getTransits().catch(() => []);
      setTransits(tr ?? []);
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
        <Text style={styles.loadingTitle}>{t('dashboard.loading')}</Text>
        <Text style={styles.loadingHint}>{t('dashboard.loadingHint')}</Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        <FadeInView delay={0}>
          <View style={styles.header}>
            <PlanetIcon name="Sun" size={32} style={styles.headerIcon} />
            <View style={styles.headerTitleBlock}>
              <Text style={styles.title}>{t('dashboard.title')}</Text>
              <Text style={styles.screenSubtitle}>{t('dashboard.subtitle')}</Text>
            </View>
            <PlanetIcon name="Moon" size={28} style={styles.headerIcon} />
          </View>
        </FadeInView>

        {message ? (
          <>
            <FadeInView delay={80}>
              <View style={styles.card}>
                <View style={styles.cardGlow} />
                <Text style={styles.messageKicker}>{t('dashboard.messageLabel')}</Text>
                <Text style={styles.message}>{message.message}</Text>
                {(() => {
                  const rr = message.ruleResult;
                  const hasDetails =
                    !!rr &&
                    !!(rr.focus || rr.opportunity || (rr.risk && rr.risk !== 'none'));
                  return hasDetails ? (
                    <View style={styles.messageDetails}>
                      {rr?.focus ? (
                        <View style={styles.detailBlock}>
                          <Text style={styles.detailLabel}>{t('dashboard.detailFocus')}</Text>
                          <Text style={styles.detailBody}>{rr.focus}</Text>
                        </View>
                      ) : null}
                      {rr?.opportunity ? (
                        <View style={styles.detailBlock}>
                          <Text style={styles.detailLabel}>{t('dashboard.detailOpportunity')}</Text>
                          <Text style={styles.detailBody}>{rr.opportunity}</Text>
                        </View>
                      ) : null}
                      {rr?.risk && rr.risk !== 'none' ? (
                        <View style={styles.detailBlock}>
                          <Text style={styles.detailLabel}>{t('dashboard.detailRisk')}</Text>
                          <Text style={styles.detailBody}>{rr.risk}</Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null;
                })()}
                <Text style={styles.messageMeta}>
                  {translateAdviceType(message.adviceType, t)} · {translateTone(message.tone, t)}
                </Text>
              </View>
            </FadeInView>

            <FadeInView delay={160}>
              <View style={styles.dominantEnergy}>
                <Text style={styles.dominantLabel}>{t('dashboard.dominantEnergy')}</Text>
                <Text style={styles.dominantValue}>
                  {translateDashboardLayer(message.dominantLayer, t)}
                </Text>
                <View style={styles.intensityRow}>
                  <View style={[styles.intensityDot, { backgroundColor: colors.accent }]} />
                  <Text style={styles.intensityLabel}>
                    {t('dashboard.intensity')}:{' '}
                    <Text style={styles.intensityValue}>
                      {translateIntensityLevel(message.intensity, t)}
                    </Text>
                  </Text>
                </View>
              </View>
            </FadeInView>

            {transits.length > 0 ? (
              <FadeInView delay={200}>
                <QuickTransitStrip transits={transits} maxItems={6} />
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => navigation.navigate('Transits' as never)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.seeAllButtonText}>{t('dashboard.seeAllTransits')}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.accent} />
                </TouchableOpacity>
              </FadeInView>
            ) : null}

            <FadeInView delay={320}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Journal')}
                activeOpacity={0.8}
              >
                <PlanetIcon name="Moon" size={20} animated={false} />
                <Text style={styles.secondaryButtonText}>{t('dashboard.reflect')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkButton} onPress={generateNew} disabled={loading}>
                <Text style={styles.linkText}>{t('dashboard.regenerate')}</Text>
              </TouchableOpacity>
            </FadeInView>
          </>
        ) : (
          <FadeInView>
            <View style={styles.emptyCard}>
              <PlanetIcon name="Moon" size={48} />
              <Text style={styles.empty}>{t('dashboard.empty')}</Text>
            </View>
          </FadeInView>
        )}
      </ScrollView>
    </View>
  );
}

type ThemeColors = typeof themeColors.light;

function createStyles(c: ThemeColors) {
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
      maxWidth: Math.min(width, 560),
      width: '100%',
      alignSelf: 'center',
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
    loadingTitle: {
      marginTop: 20,
      fontSize: 17,
      fontWeight: '600',
      color: c.primary,
      textAlign: 'center',
    },
    loadingHint: {
      marginTop: 10,
      fontSize: 14,
      color: c.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      maxWidth: 280,
      paddingHorizontal: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    headerTitleBlock: {
      alignItems: 'center',
      flex: 1,
    },
    headerIcon: {
      opacity: 0.9,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: c.primary,
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    screenSubtitle: {
      fontSize: 14,
      color: c.textSecondary,
      marginTop: 6,
      textAlign: 'center',
      lineHeight: 20,
    },
    card: {
      backgroundColor: c.cardTint,
      borderRadius: 20,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: c.cardBorder,
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
    messageKicker: {
      fontSize: 11,
      fontWeight: '700',
      color: c.accent,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: spacing.sm,
    },
    message: {
      fontSize: 17,
      lineHeight: 27,
      color: c.text,
      fontWeight: '500',
    },
    messageDetails: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      gap: spacing.md,
    },
    detailBlock: {
      gap: spacing.xs,
    },
    detailLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: c.accent,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    detailBody: {
      fontSize: 15,
      lineHeight: 22,
      color: c.textSecondary,
    },
    messageMeta: {
      marginTop: spacing.md,
      fontSize: 13,
      color: c.textSecondary,
      fontStyle: 'italic',
    },
    dominantEnergy: {
      backgroundColor: c.cardBg,
      padding: spacing.lg,
      borderRadius: 16,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: c.cardBorder,
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
    seeAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.cardBorder,
      backgroundColor: c.surface,
    },
    seeAllButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: c.accent,
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: c.secondaryButtonBg,
      padding: spacing.md,
      borderRadius: 16,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: c.secondaryButtonBorder,
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
