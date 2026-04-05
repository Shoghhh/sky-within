import React, { useState, useCallback, useMemo, useRef, Fragment } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { api, mapLanguageForAstrologyBasicsApi } from '../lib/api';
import type { TransitAspect } from '../lib/api';
import { usePreferences } from '../lib/preferences';
import { useTranslation } from '../lib/i18n';
import { spacing } from '../constants/theme';
import PlanetIcon from './PlanetIcon';
import FadeInView from './FadeInView';
import { buildHighTransitExplanation } from '../lib/transit-explanation';
import { translateAspect, translatePlanet } from '../lib/astro-labels';

type ExplainRowState = {
  expanded: boolean;
  loading?: boolean;
  fetched?: boolean;
  aiText?: string | null;
  source?: 'ai' | 'unavailable';
};

function transitRowKey(item: TransitAspect, index: number) {
  return `${item.planet}|${item.target}|${item.aspect}|${item.orb}|${index}`;
}

const CHEVRON_SIZE = 22;

function TransitExplainChevron({ expanded, color }: { expanded: boolean; color: string }) {
  return (
    <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
      <Svg width={CHEVRON_SIZE} height={CHEVRON_SIZE} viewBox="0 0 24 24">
        <Path
          d="M6 9l6 6 6-6"
          stroke={color}
          strokeWidth={2.25}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export interface TransitsSectionProps {
  transits: TransitAspect[];
  loading?: boolean;
}

export default function TransitsSection({ transits, loading = false }: TransitsSectionProps) {
  const { colors, language } = usePreferences();
  const t = useTranslation(language);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [guideOpen, setGuideOpen] = useState(false);
  const [explainState, setExplainState] = useState<Record<string, ExplainRowState>>({});
  const explainRef = useRef(explainState);
  explainRef.current = explainState;

  const intensityColor = (i: string) => {
    if (i === 'high') return colors.error;
    if (i === 'medium') return colors.accent;
    return colors.success;
  };

  const handleExplainToggle = useCallback(
    async (item: TransitAspect, index: number) => {
      if (item.intensity !== 'high') return;
      const key = transitRowKey(item, index);
      const s = explainRef.current[key] ?? {};

      if (s.expanded) {
        setExplainState((p) => ({ ...p, [key]: { ...s, expanded: false } }));
        return;
      }

      if (s.fetched) {
        setExplainState((p) => ({ ...p, [key]: { ...s, expanded: true } }));
        return;
      }

      setExplainState((p) => ({ ...p, [key]: { ...s, expanded: true, loading: true } }));

      try {
        const lang = mapLanguageForAstrologyBasicsApi(language);
        const res = await api.dailyMessage.explainTransit({
          planet: item.planet,
          target: item.target,
          aspect: item.aspect,
          orb: item.orb,
          intensity: 'high',
          language: lang,
        });
        setExplainState((p) => ({
          ...p,
          [key]: {
            expanded: true,
            loading: false,
            fetched: true,
            aiText: res.explanation,
            source: res.source,
          },
        }));
      } catch {
        setExplainState((p) => ({
          ...p,
          [key]: {
            expanded: true,
            loading: false,
            fetched: true,
            aiText: null,
            source: 'unavailable',
          },
        }));
      }
    },
    [language],
  );

  const renderRow = (item: TransitAspect, index: number) => {
    const key = transitRowKey(item, index);
    const ex = explainState[key];
    const fallbackText = buildHighTransitExplanation(item, t);
    const showPanel = item.intensity === 'high';
    const aiText = (ex?.aiText ?? '').trim();
    const useAi = !!(ex?.fetched && aiText.length > 0 && ex.source === 'ai');
    const displayBody =
      ex?.loading ? null : ex?.fetched ? (useAi ? aiText : fallbackText) : null;

    return (
      <Fragment key={key}>
        <FadeInView delay={Math.min(index * 30, 240)}>
          <View style={styles.rowBlock}>
          <View style={styles.rowOuter}>
            <View style={[styles.row, showPanel && styles.rowPadForChevron]}>
              <View style={[styles.cell, styles.cellTransit]}>
                <View style={styles.planetCell}>
                  <PlanetIcon name={item.planet} size={20} animated={false} />
                  <Text style={styles.planet} numberOfLines={2}>
                    {translatePlanet(item.planet, t)}
                  </Text>
                </View>
              </View>
              <View style={[styles.cell, styles.cellTarget]}>
                <View style={styles.planetCell}>
                  <PlanetIcon name={item.target} size={18} animated={false} />
                  <Text style={styles.target} numberOfLines={2}>
                    {translatePlanet(item.target, t)}
                  </Text>
                </View>
              </View>
              <View style={[styles.cell, styles.cellAspect]}>
                <Text style={styles.aspect} numberOfLines={2}>
                  {translateAspect(item.aspect, t)}
                </Text>
              </View>
              <View style={[styles.cell, styles.cellOrb]}>
                <View style={[styles.orbBadge, { backgroundColor: `${intensityColor(item.intensity)}20` }]}>
                  <Text style={[styles.orb, { color: intensityColor(item.intensity) }]}>
                    {item.orb}°
                  </Text>
                </View>
              </View>
            </View>

            {showPanel ? (
              <View style={styles.chevronOverlay} pointerEvents="box-none">
                <TouchableOpacity
                  style={styles.explainChevronHit}
                  onPress={() => void handleExplainToggle(item, index)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={ex?.expanded ? t('transits.hideExplain') : t('transits.showExplain')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <TransitExplainChevron expanded={!!ex?.expanded} color={colors.accent} />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {showPanel && ex?.expanded ? (
            <View
              style={[
                styles.explainBox,
                { borderLeftColor: colors.accent, backgroundColor: colors.cardBg ?? `${colors.accent}08` },
              ]}
            >
              {ex.loading ? (
                <ActivityIndicator size="small" color={colors.accent} style={styles.explainSpinner} />
              ) : (
                <>
                  {displayBody ? (
                    <Text style={[styles.explainText, { color: colors.text }]}>{displayBody}</Text>
                  ) : null}
                </>
              )}
            </View>
          ) : null}
        </View>
        </FadeInView>
      </Fragment>
    );
  };

  const sectionHeader = (
    <View style={styles.sectionIntro}>
      <Text style={styles.sectionTitle}>{t('transits.title')}</Text>
      <Text style={styles.sectionSubtitle}>{t('transits.subtitle')}</Text>
      <Text style={styles.intro}>{t('transits.intro')}</Text>
      <Text style={styles.sortCaption}>{t('transits.sortCaption')}</Text>
      <TouchableOpacity onPress={() => setGuideOpen(true)} style={styles.guideLinkWrap} activeOpacity={0.7}>
        <Text style={[styles.guideLink, { color: colors.accent }]}>{t('transits.openGuide')}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && transits.length === 0) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={[styles.loadingInline, { color: colors.textSecondary }]}>{t('transits.loadingRow')}</Text>
      </View>
    );
  }

  if (transits.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <PlanetIcon name="Moon" size={40} animated={false} />
        <Text style={[styles.empty, { color: colors.textSecondary }]}>{t('transits.empty')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {sectionHeader}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.headerCellTransit]}>{t('transits.planet')}</Text>
        <Text style={[styles.headerCell, styles.headerCellTarget]}>{t('transits.target')}</Text>
        <Text style={[styles.headerCell, styles.headerCellAspect]}>{t('transits.aspect')}</Text>
        <Text style={[styles.headerCell, styles.headerCellOrb]}>{t('transits.orb')}</Text>
      </View>
      {transits.map((item, index) => renderRow(item, index))}

      <Modal visible={guideOpen} transparent animationType="fade" onRequestClose={() => setGuideOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setGuideOpen(false)}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.primary }]}>{t('transits.helpAllTitle')}</Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator>
              <Text style={[styles.modalBody, { color: colors.text }]}>{t('transits.helpAllBody')}</Text>
              <Text style={[styles.modalSubtitle, { color: colors.primary }]}>{t('transits.helpTitle')}</Text>
              <Text style={[styles.modalBody, { color: colors.text, marginTop: spacing.sm }]}>
                <Text style={{ fontWeight: '700' }}>{t('transits.planet')}: </Text>
                {t('transits.helpPlanet')}
              </Text>
              <Text style={[styles.modalBody, { color: colors.text, marginTop: spacing.sm }]}>
                <Text style={{ fontWeight: '700' }}>{t('transits.target')}: </Text>
                {t('transits.helpTarget')}
              </Text>
              <Text style={[styles.modalBody, { color: colors.text, marginTop: spacing.sm }]}>
                <Text style={{ fontWeight: '700' }}>{t('transits.aspect')}: </Text>
                {t('transits.helpAspect')}
              </Text>
              <Text style={[styles.modalBody, { color: colors.text, marginTop: spacing.sm }]}>
                <Text style={{ fontWeight: '700' }}>{t('transits.orb')}: </Text>
                {t('transits.helpOrb')}
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setGuideOpen(false)}>
              <Text style={[styles.modalCloseText, { color: colors.accent }]}>{t('common.close')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function createStyles(c: typeof import('../constants/theme').colors.light) {
  return StyleSheet.create({
    wrap: {
      marginTop: spacing.sm,
    },
    sectionIntro: {
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: c.primary,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: c.textSecondary,
      marginTop: 4,
    },
    intro: {
      fontSize: 14,
      color: c.text,
      marginTop: spacing.sm,
      lineHeight: 21,
    },
    sortCaption: {
      fontSize: 12,
      color: c.accent,
      marginTop: spacing.sm,
      fontWeight: '600',
    },
    guideLinkWrap: {
      marginTop: spacing.md,
      alignSelf: 'flex-start',
    },
    guideLink: {
      fontSize: 15,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
    loadingBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.lg,
      justifyContent: 'center',
    },
    loadingInline: {
      fontSize: 14,
    },
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    empty: {
      marginTop: spacing.md,
      textAlign: 'center',
      fontSize: 15,
    },
    tableHeader: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: (c as { cardBg?: string }).cardBg ?? c.surface,
      borderBottomWidth: 1,
      borderBottomColor: (c as { cardBorder?: string }).cardBorder ?? c.border,
      alignItems: 'flex-start',
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    headerCell: {
      fontSize: 10,
      fontWeight: '700',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    headerCellTransit: {
      flex: 1.55,
      flexBasis: 0,
      minWidth: 0,
      paddingRight: 6,
    },
    headerCellTarget: {
      flex: 1.55,
      flexBasis: 0,
      minWidth: 0,
      paddingRight: 6,
    },
    headerCellAspect: {
      flex: 1.35,
      flexBasis: 0,
      minWidth: 0,
      paddingRight: 6,
    },
    headerCellOrb: {
      flex: 0.55,
      flexGrow: 0,
      minWidth: 50,
      maxWidth: 58,
      textAlign: 'right',
    },
    rowBlock: {
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(51, 65, 85, 0.5)',
    },
    rowOuter: {
      position: 'relative',
    },
    row: {
      flexDirection: 'row',
      padding: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
    },
    rowPadForChevron: {
      paddingRight: spacing.lg + CHEVRON_SIZE + 10,
    },
    chevronOverlay: {
      position: 'absolute',
      right: spacing.lg,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
    },
    cell: {
      justifyContent: 'center',
    },
    cellTransit: {
      flex: 1.55,
      flexBasis: 0,
      minWidth: 0,
      paddingRight: 4,
    },
    cellTarget: {
      flex: 1.55,
      flexBasis: 0,
      minWidth: 0,
      paddingRight: 4,
    },
    cellAspect: {
      flex: 1.35,
      flexBasis: 0,
      minWidth: 0,
      paddingRight: 4,
    },
    cellOrb: {
      flex: 0.55,
      flexGrow: 0,
      minWidth: 50,
      maxWidth: 58,
      alignItems: 'flex-end',
    },
    planetCell: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      flexWrap: 'wrap',
    },
    planet: {
      fontSize: 14,
      fontWeight: '600',
      color: c.primary,
      flex: 1,
      flexShrink: 1,
    },
    aspect: {
      fontSize: 14,
      color: c.text,
      flexShrink: 1,
    },
    target: {
      fontSize: 14,
      color: c.text,
      flex: 1,
      flexShrink: 1,
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
    explainChevronHit: {
      paddingVertical: 2,
      paddingLeft: 8,
    },
    explainBox: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderLeftWidth: 3,
      borderRadius: 8,
    },
    explainSpinner: {
      alignSelf: 'flex-start',
    },
    explainText: {
      fontSize: 14,
      lineHeight: 20,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    modalCard: {
      borderRadius: 16,
      borderWidth: 1,
      maxHeight: '80%',
      padding: spacing.lg,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: spacing.sm,
    },
    modalSubtitle: {
      fontSize: 15,
      fontWeight: '700',
      marginTop: spacing.md,
    },
    modalBody: {
      fontSize: 15,
      lineHeight: 22,
    },
    modalScroll: {
      maxHeight: 360,
    },
    modalClose: {
      marginTop: spacing.md,
      alignSelf: 'flex-end',
      paddingVertical: spacing.sm,
    },
    modalCloseText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
