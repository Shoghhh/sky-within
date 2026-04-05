import React from 'react';
import { View, Text, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { usePreferences } from '../lib/preferences';
import { useTranslation } from '../lib/i18n';
import { spacing } from '../constants/theme';

export default function LanguageLoadingOverlay() {
  const { colors, language, languageContentLoading } = usePreferences();
  const t = useTranslation(language);

  return (
    <Modal visible={languageContentLoading} transparent animationType="fade" statusBarTranslucent>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.45)' }]} pointerEvents="auto">
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.title, { color: colors.primary }]}>{t('app.loadingLanguageContent')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('app.loadingLanguageContentHint')}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    maxWidth: 320,
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
