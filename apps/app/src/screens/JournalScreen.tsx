import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { api } from '../lib/api';
import type { JournalEntry, DailyMessage } from '../lib/api';
import { usePreferences } from '../lib/preferences';
import { useTranslation } from '../lib/i18n';
import { spacing } from '../constants/theme';
import PlanetIcon from '../components/PlanetIcon';
import FadeInView from '../components/FadeInView';

const MOODS = ['happy', 'calm', 'reflective', 'stressed', 'sad'] as const;

export default function JournalScreen({ navigation }: { navigation: any }) {
  const { colors, language } = usePreferences();
  const t = useTranslation(language);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [prompt, setPrompt] = useState<string>('');
  const [message, setMessage] = useState<DailyMessage | null>(null);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [text, setText] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [msg, currentEntry, list] = await Promise.all([
        api.dailyMessage.get().catch(() => null),
        api.journal.get(),
        api.journal.list().catch(() => []),
      ]);
      setMessage(msg ?? null);
      setEntry(currentEntry ?? null);
      setEntries(list ?? []);

      const layer = msg?.dominantLayer?.toLowerCase() ?? 'emotional';
      setPrompt(t('journal.promptTemplate').replace('{layer}', layer));

      if (currentEntry) {
        setText(currentEntry.text);
        setMood(currentEntry.mood);
      } else {
        setText('');
        setMood(null);
      }
    } catch (e: unknown) {
      const err = e as { message?: string };
      Alert.alert(t('common.error'), err.message || t('journal.errorLoad'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSave = async () => {
    if (!text.trim()) {
      Alert.alert(t('journal.title'), t('journal.alertWrite'));
      return;
    }
    try {
      setSaving(true);
      await api.journal.create({ text: text.trim(), mood: mood ?? undefined });
      await fetchData();
      Alert.alert(t('common.success'), t('journal.alertSaved'));
    } catch (e: unknown) {
      const err = e as { message?: string };
      Alert.alert(t('common.error'), err.message || t('journal.errorSave'));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !entry && entries.length === 0) {
    return (
      <View style={[styles.container, styles.centered, styles.gradientBg]}>
        <PlanetIcon name="Moon" size={48} />
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (viewHistory) {
    return (
      <View style={[styles.container, styles.gradientBg]}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerWithIcon}>
              <PlanetIcon name="Moon" size={24} animated={false} />
              <Text style={styles.title}>{t('journal.entries')}</Text>
            </View>
            <TouchableOpacity onPress={() => setViewHistory(false)}>
              <Text style={styles.linkText}>{t('journal.today')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>{t('journal.browse')}</Text>

          {entries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <PlanetIcon name="Moon" size={40} />
              <Text style={styles.empty}>{t('journal.empty')}</Text>
            </View>
          ) : (
            entries.map((e, i) => (
              <FadeInView key={e.id} delay={i * 50}>
                <View style={styles.entryCard}>
                  <Text style={styles.entryDate}>
                    {new Date(e.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  {e.mood && (
                    <Text style={styles.entryMood}>{t('journal.moodLabel')}: {e.mood}</Text>
                  )}
                  <Text style={styles.entryText}>{e.text}</Text>
                </View>
              </FadeInView>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.gradientBg]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FadeInView>
          <View style={styles.headerWithIcon}>
            <PlanetIcon name="Moon" size={28} />
            <Text style={styles.title}>{t('journal.title')}</Text>
          </View>
        </FadeInView>
        <FadeInView delay={60}>
          <Text style={styles.prompt}>{prompt}</Text>
        </FadeInView>

        <FadeInView delay={120}>
          <TextInput
            style={styles.input}
            placeholder={t('journal.placeholder')}
            placeholderTextColor={colors.textSecondary}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
          />
        </FadeInView>

        <FadeInView delay={180}>
          <Text style={styles.moodLabel}>{t('journal.mood')}</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.moodChip, mood === m && styles.moodChipSelected]}
                onPress={() => setMood(mood === m ? null : m)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.moodChipText,
                    mood === m && styles.moodChipTextSelected,
                  ]}
                >
                  {t(`journal.mood${m.charAt(0).toUpperCase() + m.slice(1)}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FadeInView>

        <FadeInView delay={240}>
          <TouchableOpacity
            style={[styles.buttonWrapper, styles.button]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <PlanetIcon name="Moon" size={20} animated={false} />
            <Text style={styles.buttonText}>
              {saving ? t('journal.saving') : t('journal.save')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setViewHistory(true)}
          >
            <Text style={styles.linkText}>{t('journal.viewPrevious')}</Text>
          </TouchableOpacity>
        </FadeInView>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: c.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: c.textSecondary,
    marginBottom: spacing.lg,
  },
  prompt: {
    fontSize: 16,
    lineHeight: 26,
    color: c.text,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: (c as any).inputBg ?? c.surface,
    borderWidth: 1,
    borderColor: (c as any).inputBorder ?? c.border,
    borderRadius: 16,
    padding: spacing.md,
    fontSize: 16,
    color: c.text,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textSecondary,
    marginBottom: spacing.sm,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  moodChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: (c as any).inputBg ?? c.surface,
    borderWidth: 1,
    borderColor: (c as any).inputBorder ?? c.border,
  },
  moodChipSelected: {
    backgroundColor: (c as any).secondaryButtonBg ?? c.surface,
    borderColor: c.accent,
  },
  moodChipText: {
    fontSize: 14,
    color: c.text,
  },
  moodChipTextSelected: {
    color: c.accentLight,
    fontWeight: '600',
  },
  buttonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    shadowColor: c.accentGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: c.gradientStart,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  linkText: {
    color: c.accent,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  empty: {
    fontSize: 16,
    color: c.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  entryCard: {
    backgroundColor: (c as any).cardTint ?? 'rgba(99, 102, 241, 0.12)',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: (c as any).cardBorder ?? c.border,
  },
  entryDate: {
    fontSize: 12,
    color: c.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  entryMood: {
    fontSize: 12,
    color: c.accent,
    marginBottom: spacing.xs,
  },
  entryText: {
    fontSize: 14,
    color: c.text,
    lineHeight: 22,
  },
});
}
