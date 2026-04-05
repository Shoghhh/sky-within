import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { TransitAspect } from '../lib/api';
import { usePreferences } from '../lib/preferences';
import { useTranslation } from '../lib/i18n';
import { spacing } from '../constants/theme';
import PlanetIcon from './PlanetIcon';
import { translateAspect, translatePlanet } from '../lib/astro-labels';

type ThemeColors = typeof import('../constants/theme').colors.light;

function intensityTint(i: string, c: ThemeColors): string {
  if (i === 'high') return c.error;
  if (i === 'medium') return c.accent;
  return c.success;
}

export interface QuickTransitStripProps {
  transits: TransitAspect[];
  maxItems?: number;
}

export default function QuickTransitStrip({ transits, maxItems = 6 }: QuickTransitStripProps) {
  const { colors, language } = usePreferences();
  const t = useTranslation(language);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const items = transits.slice(0, maxItems);
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>{t('dashboard.quickTransits')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item, index) => {
          const tint = intensityTint(item.intensity, colors);
          return (
            <View
              key={`${item.planet}|${item.target}|${item.aspect}|${item.orb}|${index}`}
              style={[styles.card, { borderColor: colors.cardBorder, backgroundColor: colors.surfaceElevated }]}
            >
              <View style={styles.cardRow}>
                <PlanetIcon name={item.planet} size={22} animated={false} />
                <Text style={[styles.orbPill, { color: tint, backgroundColor: `${tint}18` }]} numberOfLines={1}>
                  {item.orb}°
                </Text>
              </View>
              <Text style={styles.planetLine} numberOfLines={1}>
                {translatePlanet(item.planet, t)}
              </Text>
              <Text style={styles.aspectLine} numberOfLines={1}>
                {translateAspect(item.aspect, t)}
              </Text>
              <View style={styles.targetRow}>
                <PlanetIcon name={item.target} size={16} animated={false} />
                <Text style={styles.targetLine} numberOfLines={1}>
                  {translatePlanet(item.target, t)}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.9,
      marginBottom: spacing.sm,
    },
    scrollContent: {
      paddingRight: spacing.lg,
    },
    card: {
      width: 148,
      marginRight: spacing.sm,
      borderRadius: 14,
      borderWidth: 1,
      padding: spacing.sm,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    orbPill: {
      fontSize: 12,
      fontWeight: '700',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      overflow: 'hidden',
    },
    planetLine: {
      fontSize: 15,
      fontWeight: '700',
      color: c.primary,
    },
    aspectLine: {
      fontSize: 13,
      color: c.accent,
      fontWeight: '600',
      marginTop: 2,
    },
    targetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 6,
    },
    targetLine: {
      fontSize: 12,
      color: c.textSecondary,
      flex: 1,
    },
  });
}
