import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { NatalChartDetail } from '../lib/api';
import { usePreferences } from '../lib/preferences';
import { useTranslation } from '../lib/i18n';
import {
  translateAspect,
  translateDignityLine,
  translatePlanet,
  translateSign,
} from '../lib/astro-labels';
import { spacing } from '../constants/theme';
import ChartWheel from '../components/ChartWheel';
import ChartImage from '../components/ChartImage';
import PlanetIcon from '../components/PlanetIcon';
import FadeInView from '../components/FadeInView';

const { width } = Dimensions.get('window');

const ELEMENT_KEYS = ['water', 'earth', 'air', 'fire'] as const;
const QUALITY_KEYS = ['fixed', 'mutable', 'cardinal'] as const;
const DIGNITY_KEYS = ['domicile', 'exaltation', 'detriment', 'fall'] as const;

function safeInterpretation(val: unknown): string | null {
  return typeof val === 'string' ? val : null;
}

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

export default function NatalChartScreen() {
  const navigation = useNavigation();
  const { colors, language, theme, refreshPreferences } = usePreferences();
  const { token } = useAuth();
  const t = useTranslation(language);
  const isDark = theme === 'dark';
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [detail, setDetail] = useState<NatalChartDetail | null>(null);
  /** True while any natal-chart request is in flight (initial load or refetch). */
  const [fetchInFlight, setFetchInFlight] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showExplainWhy, setShowExplainWhy] = useState(false);

  const languageRef = useRef(language);
  languageRef.current = language;

  const fetchDetail = useCallback(async (opts?: { refresh?: boolean }) => {
    setFetchInFlight(true);
    try {
      const allowed = new Set(['en', 'ru', 'hy']);
      const raw = languageRef.current;
      const lang = allowed.has(raw) ? raw : 'en';
      const data = await api.user.getNatalChartDetail({
        refresh: opts?.refresh,
        language: lang,
      });
      setDetail(data);
    } catch (e: unknown) {
      const err = e as { message?: string };
      Alert.alert(t('common.error'), err.message || t('natal.errorLoad'));
    } finally {
      setFetchInFlight(false);
      setRefreshing(false);
    }
  }, [t]);

  const onRefresh = () => {
    setRefreshing(true);
    void fetchDetail({ refresh: true });
  };

  // Sync preferences from server, then load chart text for that language (incl. after Profile save).
  useFocusEffect(
    useCallback(() => {
      void (async () => {
        await refreshPreferences();
        await fetchDetail();
      })();
    }, [fetchDetail, refreshPreferences]),
  );

  /** Skip first run — useFocusEffect handles initial load; then refetch only when `language` changes while mounted. */
  const skipFirstLanguageEffect = useRef(true);
  useEffect(() => {
    if (skipFirstLanguageEffect.current) {
      skipFirstLanguageEffect.current = false;
      return;
    }
    void fetchDetail({ refresh: true });
  }, [language, fetchDetail]);

  if (fetchInFlight && !detail) {
    return (
      <View style={[styles.container, styles.centered, styles.gradientBg]}>
        <PlanetIcon name="Sun" size={48} />
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 24 }} />
        <Text style={styles.loadingTitle}>{t('natal.loading')}</Text>
        <Text style={styles.loadingHint}>{t('natal.loadingHint')}</Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={[styles.container, styles.centered, styles.gradientBg]}>
        <Text style={styles.emptyText}>{t('natal.noChart')}</Text>
        <Text style={styles.emptySubtext}>{t('natal.noChartHint')}</Text>
      </View>
    );
  }

  const ascendant = detail.houses[0]?.longitude ?? 0;
  const layout = detail.layout;

  return (
    <ScrollView
      style={[styles.container, styles.gradientBg]}
      contentContainerStyle={styles.content}
      accessibilityState={{ busy: fetchInFlight }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      <FadeInView>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{t('natal.title')}</Text>
            {fetchInFlight ? (
              <ActivityIndicator size="small" color={colors.accent} style={styles.titleSpinner} />
            ) : null}
          </View>
          <Text style={styles.subtitle}>
            {detail.birthPlace} · {detail.birthDate} {detail.birthTime}
          </Text>
          <TouchableOpacity
            style={styles.rawDataButton}
            onPress={() => navigation.navigate('AstrologyBasics' as never)}
            activeOpacity={0.7}
          >
            <Text style={styles.rawDataButtonText}>{t('natal.openBasics')}</Text>
          </TouchableOpacity>
        </View>
      </FadeInView>

      {/* Chart image (AstroAPI) or wheel */}
      <FadeInView delay={50}>
        <View style={styles.chartContainer}>
          {detail.chartImageUrl && token ? (
            <ChartImage
              imageUrl={detail.chartImageUrl}
              token={token}
              width={Math.min(width - 48, 320)}
              height={Math.min(width - 48, 320)}
              accentColor={colors.accent}
            />
          ) : (
            <ChartWheel
              size={Math.min(width - 48, 320)}
              planets={detail.planets}
              houses={detail.houses}
              ascendant={ascendant}
              textColor={isDark ? colors.text : colors.text}
              lineColor={colors.accent}
            />
          )}
        </View>
      </FadeInView>

      {/* Personality Summary (AI-formatted from structured data) */}
      {detail.personalityProse && (
        <FadeInView delay={60}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('natal.personalitySummary')}</Text>
            <View style={styles.interpretBlock}>
              <Text style={styles.interpretText}>{detail.personalityProse}</Text>
            </View>
          </View>
        </FadeInView>
      )}

      {layout &&
        (layout.dominant.element ||
          layout.dominant.quality ||
          layout.dominant.strongestSign) && (
          <FadeInView delay={95}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('natal.section.dominant')}</Text>
              <View style={styles.highlightChips}>
                {layout.dominant.element ? (
                  <View style={[styles.chip, { borderColor: colors.border }]}>
                    <Text style={[styles.chipLabel, { color: colors.textSecondary }]}>
                      {t('natal.dominantElement')}
                    </Text>
                    <Text style={[styles.chipValue, { color: colors.text }]}>
                      {t(`natal.element.${layout.dominant.element}`)}
                    </Text>
                  </View>
                ) : null}
                {layout.dominant.quality ? (
                  <View style={[styles.chip, { borderColor: colors.border }]}>
                    <Text style={[styles.chipLabel, { color: colors.textSecondary }]}>
                      {t('natal.dominantQuality')}
                    </Text>
                    <Text style={[styles.chipValue, { color: colors.text }]}>
                      {t(`natal.quality.${layout.dominant.quality}`)}
                    </Text>
                  </View>
                ) : null}
                {layout.dominant.strongestSign ? (
                  <View style={[styles.chip, { borderColor: colors.border }]}>
                    <Text style={[styles.chipLabel, { color: colors.textSecondary }]}>
                      {t('natal.dominantSign')}
                    </Text>
                    <Text style={[styles.chipValue, { color: colors.text }]}>
                      {translateSign(layout.dominant.strongestSign.sign, t)} × {layout.dominant.strongestSign.count}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </FadeInView>
        )}

      {layout ? (
        <>
          <FadeInView delay={100}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('natal.section.corePersonality')}</Text>
              {[layout.corePersonality.sun, layout.corePersonality.moon]
                .filter(Boolean)
                .map((p) => (
                  <View key={`core-${p!.planet}`} style={styles.interpretBlock}>
                    <View style={styles.interpretHeader}>
                      <PlanetIcon name={p!.planet} size={18} animated={false} />
                      <Text style={styles.interpretTitle}>
                        {translatePlanet(p!.planet, t)} {t('natal.in')} {translateSign(p!.sign, t)} ·{' '}
                        {ROMAN[p!.house - 1]} {t('natal.house')} (
                        {p!.degreesInSign.toFixed(0)}°)
                      </Text>
                    </View>
                    {safeInterpretation(p!.interpretation) ? (
                      <Text style={styles.interpretText}>{safeInterpretation(p!.interpretation)}</Text>
                    ) : null}
                  </View>
                ))}
              {layout.corePersonality.ascendant ? (
                <View style={styles.interpretBlock}>
                  <Text style={styles.interpretTitle}>
                    {t('natal.ascendantLabel')}: {translateSign(layout.corePersonality.ascendant.sign, t)}
                  </Text>
                  {safeInterpretation(layout.corePersonality.ascendant.interpretation) ? (
                    <Text style={styles.interpretText}>
                      {safeInterpretation(layout.corePersonality.ascendant.interpretation)}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          </FadeInView>

          <FadeInView delay={110}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('natal.section.characterBehavior')}</Text>
              {layout.characterBehavior.map((p) => (
                <View key={`char-${p.planet}`} style={styles.interpretBlock}>
                  <View style={styles.interpretHeader}>
                    <PlanetIcon name={p.planet} size={18} animated={false} />
                    <Text style={styles.interpretTitle}>
                      {translatePlanet(p.planet, t)} {t('natal.in')} {translateSign(p.sign, t)} ·{' '}
                      {ROMAN[p.house - 1]} {t('natal.house')}
                    </Text>
                  </View>
                  {safeInterpretation(p.interpretation) ? (
                    <Text style={styles.interpretText}>{safeInterpretation(p.interpretation)}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          </FadeInView>
        </>
      ) : null}

      {/* Elements */}
      <FadeInView delay={115}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('natal.elements')}</Text>
          <View style={styles.elementRow}>
            {ELEMENT_KEYS.map((k) => (
              <View key={k} style={styles.elementItem}>
                <Text style={styles.elementLabel}>{t(`natal.element.${k}`)}</Text>
                <Text style={styles.elementValue}>{detail.elements[k]}</Text>
              </View>
            ))}
          </View>
        </View>
      </FadeInView>

      {/* Qualities */}
      <FadeInView delay={120}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('natal.qualities')}</Text>
          <View style={styles.elementRow}>
            {QUALITY_KEYS.map((k) => (
              <View key={k} style={styles.elementItem}>
                <Text style={styles.elementLabel}>{t(`natal.quality.${k}`)}</Text>
                <Text style={styles.elementValue}>{detail.qualities[k]}</Text>
              </View>
            ))}
          </View>
        </View>
      </FadeInView>

      {/* Dignities */}
      <FadeInView delay={125}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('natal.dignities')}</Text>
          <View style={styles.dignityGrid}>
            {DIGNITY_KEYS.map((k) => (
              <View key={k} style={styles.dignityCol}>
                <Text style={styles.dignityLabel}>{t(`natal.dignity.${k}`)}</Text>
                {(detail.dignities[k] || []).map((s, i) => (
                  <Text key={i} style={styles.dignityItem}>
                    {translateDignityLine(s, t)}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </View>
      </FadeInView>

      {layout && layout.keyAspects.length > 0 ? (
        <FadeInView delay={130}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('natal.section.keyPatterns')}</Text>
            {layout.keyAspects.map(({ aspect: a }) => (
              <View key={`key-${a.planetA}-${a.planetB}-${a.aspect}`} style={styles.aspectBlock}>
                <View style={styles.aspectHeader}>
                  <PlanetIcon name={a.planetA} size={16} animated={false} />
                  <Text style={styles.aspectSymbol}>{a.symbol}</Text>
                  <PlanetIcon name={a.planetB} size={16} animated={false} />
                </View>
                <Text style={styles.aspectTitle}>
                  {translateAspect(a.aspect, t)} {translatePlanet(a.planetA, t)}–{translatePlanet(a.planetB, t)} (orb{' '}
                  {a.orb.toFixed(1)}°)
                </Text>
                {safeInterpretation(a.interpretation) ? (
                  <Text style={styles.interpretText}>{safeInterpretation(a.interpretation)}</Text>
                ) : null}
              </View>
            ))}
          </View>
        </FadeInView>
      ) : null}

      {layout ? (
        <FadeInView delay={140}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('natal.section.deeperLayers')}</Text>
            <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
              {t('natal.planetsInSigns')}
            </Text>
            {layout.deeperLayers.planets.map((p) => (
              <View key={`deep-${p.planet}-${p.sign}`} style={styles.interpretBlock}>
                <View style={styles.interpretHeader}>
                  <PlanetIcon name={p.planet} size={18} animated={false} />
                  <Text style={styles.interpretTitle}>
                    {translatePlanet(p.planet, t)} {t('natal.in')} {translateSign(p.sign, t)} ·{' '}
                    {ROMAN[p.house - 1]} {t('natal.house')}
                  </Text>
                </View>
                {safeInterpretation(p.interpretation) ? (
                  <Text style={styles.interpretText}>{safeInterpretation(p.interpretation)}</Text>
                ) : null}
              </View>
            ))}
            <Text style={[styles.sectionHint, { color: colors.textSecondary, marginTop: spacing.md }]}>
              {t('natal.housesInSigns')}
            </Text>
            {layout.deeperLayers.houses
              .filter((h) => h.house !== 1)
              .map((h) => {
              const rom = ROMAN[h.house - 1];
              return (
                <View key={`deep-house-${h.house}`} style={styles.interpretBlock}>
                  <Text style={styles.interpretTitle}>
                    {rom} {t('natal.house')} {t('natal.in')} {translateSign(h.sign, t)}
                  </Text>
                  {safeInterpretation(h.interpretation) ? (
                    <Text style={styles.interpretText}>{safeInterpretation(h.interpretation)}</Text>
                  ) : null}
                </View>
              );
            })}
            {layout.deeperLayers.aspects.length > 0 ? (
              <>
                <Text style={[styles.sectionHint, { color: colors.textSecondary, marginTop: spacing.md }]}>
                  {t('natal.aspects')}
                </Text>
                {layout.deeperLayers.aspects.map(({ aspect: a }) => (
                  <View key={`deep-${a.planetA}-${a.planetB}-${a.aspect}`} style={styles.aspectBlock}>
                    <View style={styles.aspectHeader}>
                      <PlanetIcon name={a.planetA} size={16} animated={false} />
                      <Text style={styles.aspectSymbol}>{a.symbol}</Text>
                      <PlanetIcon name={a.planetB} size={16} animated={false} />
                    </View>
                    <Text style={styles.aspectTitle}>
                      {translateAspect(a.aspect, t)} {translatePlanet(a.planetA, t)}–{translatePlanet(a.planetB, t)} (orb{' '}
                  {a.orb.toFixed(1)}°)
                    </Text>
                    {safeInterpretation(a.interpretation) ? (
                      <Text style={styles.interpretText}>{safeInterpretation(a.interpretation)}</Text>
                    ) : null}
                  </View>
                ))}
              </>
            ) : null}
            <Text style={[styles.sectionHint, { color: colors.textSecondary, marginTop: spacing.md }]}>
              {t('natal.houseInfo')}
            </Text>
            {layout.deeperLayers.houses.map((h) => {
              const planetsInHouse = detail.planets.filter((p) => p.house === h.house);
              return (
                <View key={`info-${h.house}`} style={styles.houseInfoBlock}>
                  <Text style={styles.houseInfoTitle}>
                    {ROMAN[h.house - 1]} {t('natal.house')}{' '}
                    {h.house === 1 ? `(${t('natal.ascendant')}) ` : ''}
                    {t('natal.in')} {translateSign(h.sign, t)}
                  </Text>
                  {planetsInHouse.length > 0 && (
                    <View style={styles.planetList}>
                      {planetsInHouse.map((p) => (
                        <View key={p.planet} style={styles.planetInHouse}>
                          <PlanetIcon name={p.planet} size={14} animated={false} />
                          <Text style={styles.planetInHouseText}>{translatePlanet(p.planet, t)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </FadeInView>
      ) : (
        <>
          <FadeInView delay={160}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('natal.planetsInSigns')}</Text>
              {detail.planets.map((p) => (
                <View key={`${p.planet}-${p.sign}`} style={styles.interpretBlock}>
                  <View style={styles.interpretHeader}>
                    <PlanetIcon name={p.planet} size={18} animated={false} />
                    <Text style={styles.interpretTitle}>
                      {translatePlanet(p.planet, t)} {t('natal.in')} {translateSign(p.sign, t)} (
                      {p.degreesInSign.toFixed(0)}°)
                    </Text>
                  </View>
                  {safeInterpretation(p.interpretation) ? (
                    <Text style={styles.interpretText}>{safeInterpretation(p.interpretation)}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          </FadeInView>
          <FadeInView delay={180}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('natal.housesInSigns')}</Text>
              {detail.houses.map((h) => {
                const rom = ROMAN[h.house - 1];
                return (
                  <View key={`house-${h.house}`} style={styles.interpretBlock}>
                    <Text style={styles.interpretTitle}>
                      {rom} {t('natal.house')} {t('natal.in')} {translateSign(h.sign, t)}
                      {h.house === 1 ? ` (${t('natal.ascendant')})` : ''}
                    </Text>
                    {safeInterpretation(h.interpretation) ? (
                      <Text style={styles.interpretText}>{safeInterpretation(h.interpretation)}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </FadeInView>
          <FadeInView delay={200}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('natal.aspects')}</Text>
              {detail.aspects.map((a) => (
                <View key={`${a.planetA}-${a.planetB}-${a.aspect}`} style={styles.aspectBlock}>
                  <View style={styles.aspectHeader}>
                    <PlanetIcon name={a.planetA} size={16} animated={false} />
                    <Text style={styles.aspectSymbol}>{a.symbol}</Text>
                    <PlanetIcon name={a.planetB} size={16} animated={false} />
                  </View>
                  <Text style={styles.aspectTitle}>
                    {translateAspect(a.aspect, t)} {translatePlanet(a.planetA, t)}–{translatePlanet(a.planetB, t)} (orb{' '}
                  {a.orb.toFixed(1)}°)
                  </Text>
                  {safeInterpretation(a.interpretation) ? (
                    <Text style={styles.interpretText}>{safeInterpretation(a.interpretation)}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          </FadeInView>
        </>
      )}

      {/* Explain Why - transparency: which rules were used */}
      {detail.structuredInterpretation && (
        <FadeInView delay={260}>
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.explainWhyButton}
              onPress={() => setShowExplainWhy(!showExplainWhy)}
              activeOpacity={0.7}
            >
              <Text style={styles.explainWhyButtonText}>
                {t('natal.explainWhy')} {showExplainWhy ? '▾' : '▸'}
              </Text>
            </TouchableOpacity>
            {showExplainWhy && (
              <View style={styles.explainWhyContent}>
                <Text style={styles.explainWhyLabel}>{t('natal.explainWhyPersonalityRules')}</Text>
                <Text style={styles.explainWhyText}>
                  {translatePlanet('Sun', t)} → {detail.structuredInterpretation.personalitySummary.identity || '—'}
                </Text>
                <Text style={styles.explainWhyText}>
                  {translatePlanet('Moon', t)} → {detail.structuredInterpretation.personalitySummary.emotions || '—'}
                </Text>
                <Text style={styles.explainWhyText}>
                  {translatePlanet('Ascendant', t)} → {detail.structuredInterpretation.personalitySummary.outerSelf || '—'}
                </Text>
                <Text style={[styles.explainWhyLabel, { marginTop: 12 }]}>
                  {t('natal.explainWhyPlanetInSignsRules')}
                </Text>
                {detail.structuredInterpretation.blocks.planetInSign
                  .filter((b) => b.meaning)
                  .slice(0, 5)
                  .map((b, i) => (
                    <Text key={i} style={styles.explainWhyText}>
                      {translatePlanet(b.planet, t)} {t('natal.in')} {translateSign(b.sign, t)} ✓
                    </Text>
                  ))}
                {detail.structuredInterpretation.blocks.aspects
                  .filter((b) => b.meaning)
                  .slice(0, 3)
                  .map((b, i) => (
                    <Text key={`a-${i}`} style={styles.explainWhyText}>
                      {translatePlanet(b.planetA, t)}–{translatePlanet(b.planetB, t)} {translateAspect(b.aspect, t)} ✓
                    </Text>
                  ))}
              </View>
            )}
          </View>
        </FadeInView>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function createStyles(colors: typeof import('../constants/theme').colors.light, isDark?: boolean) {
  return StyleSheet.create({
    container: { flex: 1 },
    gradientBg: { backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xl },
    centered: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg },
    loadingTitle: {
      marginTop: 20,
      fontSize: 17,
      fontWeight: '600',
      color: colors.primary,
      textAlign: 'center',
    },
    loadingHint: {
      marginTop: 10,
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      maxWidth: 280,
    },
    header: { marginBottom: spacing.lg },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    titleSpinner: { marginTop: 2 },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      flexShrink: 1,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    rawDataButton: {
      marginTop: 12,
      paddingVertical: 8,
      paddingHorizontal: 14,
      backgroundColor: colors.cardBg || colors.surface,
      borderRadius: 10,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: colors.cardBorder || colors.border,
    },
    rawDataButtonText: {
      fontSize: 13,
      color: colors.accent,
      fontWeight: '600',
    },
    explainWhyButton: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      backgroundColor: colors.cardBg || colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.cardBorder || colors.border,
    },
    explainWhyButtonText: {
      fontSize: 13,
      color: colors.accent,
      fontWeight: '600',
    },
    explainWhyContent: {
      marginTop: 12,
      padding: spacing.md,
      backgroundColor: colors.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    explainWhyLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    explainWhyText: {
      fontSize: 13,
      color: colors.text,
      marginBottom: 2,
    },
    chartContainer: {
      alignItems: 'center',
      marginVertical: spacing.lg,
    },
    chartImage: {
      borderRadius: 8,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: spacing.md,
    },
    sectionHint: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: spacing.sm,
    },
    highlightChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    chip: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      minWidth: 108,
    },
    chipLabel: {
      fontSize: 11,
      marginBottom: 4,
    },
    chipValue: {
      fontSize: 15,
      fontWeight: '600',
    },
    elementRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    elementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colors.cardBg || colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.cardBorder || colors.border,
    },
    elementLabel: { fontSize: 14, color: colors.textSecondary },
    elementValue: { fontSize: 16, fontWeight: '700', color: colors.accent },
    dignityGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    dignityCol: {
      minWidth: 100,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.cardBg || colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.cardBorder || colors.border,
    },
    dignityLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.accent,
      marginBottom: 6,
    },
    dignityItem: { fontSize: 13, color: colors.text, marginBottom: 2 },
    interpretBlock: {
      marginBottom: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.cardBg || colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder || colors.border,
    },
    interpretHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    interpretTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    interpretText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 22,
    },
    interpretPlaceholder: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    aspectBlock: {
      marginBottom: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.cardBg || colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder || colors.border,
    },
    aspectHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    aspectSymbol: { fontSize: 18, color: colors.accent },
    aspectTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 4,
    },
    houseInfoBlock: {
      marginBottom: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.cardBg || colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder || colors.border,
    },
    houseInfoTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primary,
    },
    planetList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    planetInHouse: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    planetInHouseText: { fontSize: 13, color: colors.text },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: 'center',
    },
  });
}
