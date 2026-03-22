import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  TextInput,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { api } from '../lib/api';
import type { Profile } from '../lib/api';
import { useAuth } from '../lib/auth';
import { usePreferences } from '../lib/preferences';
import { useTranslation } from '../lib/i18n';
import { spacing } from '../constants/theme';
import PlanetIcon from '../components/PlanetIcon';
import FadeInView from '../components/FadeInView';
import DatePicker from 'react-native-date-picker';
import { searchPlaces, type GeocodeResult } from '../lib/geocode';

const THEMES = ['light', 'dark'] as const;
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ru', label: 'Русский' },
  { value: 'hy', label: 'Հայերեն' },
];

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState(false);

  // Profile edit form
  const [editName, setEditName] = useState('');
  const [editBirthDate, setEditBirthDate] = useState<Date | null>(null);
  const [editBirthTime, setEditBirthTime] = useState<Date | null>(null);
  const [editBirthPlace, setEditBirthPlace] = useState('');
  const [editPlaceQuery, setEditPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<GeocodeResult[]>([]);
  const [placeSearching, setPlaceSearching] = useState(false);
  const [showPlaceResults, setShowPlaceResults] = useState(false);
  const [editBirthLat, setEditBirthLat] = useState<number | null>(null);
  const [editBirthLng, setEditBirthLng] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Preferences edit form
  const [editTheme, setEditTheme] = useState<'light' | 'dark'>('light');
  const [editLanguage, setEditLanguage] = useState('en');
  const [editNotifTime, setEditNotifTime] = useState<Date | null>(null);
  const [showNotifTimePicker, setShowNotifTimePicker] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const { logout } = useAuth();
  const { colors, language, refreshPreferences } = usePreferences();
  const tr = useTranslation(language);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await api.user.getProfile();
      setProfile(data);
    } catch (e: any) {
      Alert.alert(tr('common.error'), e.message || tr('profile.errorLoad'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setEditName(profile.name);
      setEditBirthPlace(profile.birthPlace);
      setEditPlaceQuery(profile.birthPlace);
      setEditBirthDate(profile.birthDate ? new Date(profile.birthDate) : null);
      if (profile.birthTime) {
        const [h, m] = profile.birthTime.split(':').map(Number);
        setEditBirthTime(new Date(2000, 0, 1, h, m || 0));
      } else {
        setEditBirthTime(null);
      }
      setEditBirthLat(profile.birthLatitude ?? null);
      setEditBirthLng(profile.birthLongitude ?? null);
      setEditTheme((profile.preferences?.theme as 'light' | 'dark') ?? 'light');
      setEditLanguage(profile.preferences?.language ?? 'en');
      const notif = profile.preferences?.notifications;
      if (notif?.time) {
        const [h, m] = notif.time.split(':').map(Number);
        setEditNotifTime(new Date(2000, 0, 1, h, m || 0));
      } else {
        setEditNotifTime(new Date(2000, 0, 1, 8, 0));
      }
    }
  }, [profile]);

  const formatDate = (d: Date | null) => {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const formatTime = (d: Date | null) => {
    if (!d) return '';
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${min}`;
  };

  const handlePlaceSearch = async (text: string) => {
    setEditPlaceQuery(text);
    if (text.trim().length < 2) {
      setPlaceResults([]);
      setShowPlaceResults(false);
      return;
    }
    setPlaceSearching(true);
    const results = await searchPlaces(text);
    setPlaceResults(results);
    setShowPlaceResults(results.length > 0);
    setPlaceSearching(false);
  };

  const selectPlace = (result: GeocodeResult) => {
    setEditBirthPlace(result.displayName);
    setEditBirthLat(result.latitude);
    setEditBirthLng(result.longitude);
    setEditPlaceQuery(result.displayName);
    setShowPlaceResults(false);
    Keyboard.dismiss();
  };

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    try {
      setSaving(true);
      await api.user.updateProfile(updates);
      await fetchProfile();
    } catch (e: any) {
      Alert.alert(tr('common.error'), e.message || tr('profile.errorUpdate'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert(tr('common.error'), tr('profile.errorName'));
      return;
    }
    if (!editBirthDate) {
      Alert.alert(tr('common.error'), tr('profile.errorBirthDate'));
      return;
    }
    if (!editBirthTime) {
      Alert.alert(tr('common.error'), tr('profile.errorBirthTime'));
      return;
    }
    if (!editBirthPlace.trim()) {
      Alert.alert(tr('common.error'), tr('profile.errorBirthPlace'));
      return;
    }
    try {
      setSaving(true);
      const updates: Partial<Profile> = {
        name: editName.trim(),
        birthDate: formatDate(editBirthDate),
        birthTime: formatTime(editBirthTime),
        birthPlace: editBirthPlace.trim(),
      };
      if (editBirthLat != null && editBirthLng != null) {
        updates.birthLatitude = editBirthLat;
        updates.birthLongitude = editBirthLng;
      }
      await api.user.updateProfile(updates);
      await fetchProfile();
      setEditingProfile(false);
    } catch (e: any) {
      Alert.alert(tr('common.error'), e.message || tr('profile.errorUpdate'));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      const notif = profile?.preferences?.notifications ?? {
        enabled: false,
        time: '08:00',
        type: 'daily_tip',
      };
      await api.user.updateProfile({
        preferences: {
          ...profile?.preferences,
          theme: editTheme,
          language: editLanguage,
          notifications: {
            ...notif,
            time: formatTime(editNotifTime ?? new Date(2000, 0, 1, 8, 0)),
          },
        },
      });
      await fetchProfile();
      await refreshPreferences();
      setEditingPreferences(false);
    } catch (e: any) {
      Alert.alert(tr('common.error'), e.message || tr('profile.errorUpdate'));
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await api.user.exportData();
      Alert.alert(tr('profile.exportData'), JSON.stringify(data, null, 2).slice(0, 500) + '...');
    } catch (e: any) {
      Alert.alert(tr('common.error'), e.message || tr('profile.errorUpdate'));
    }
  };

  const handleReset = () => {
    Alert.alert(
      tr('profile.resetTitle'),
      tr('profile.resetMessage'),
      [
        { text: tr('profile.cancel'), style: 'cancel' },
        {
          text: tr('profile.resetApp'),
          style: 'destructive',
          onPress: async () => {
            try {
              await api.user.reset();
              await fetchProfile();
              Alert.alert(tr('common.success'), tr('profile.resetDone'));
            } catch (e: any) {
              Alert.alert(tr('common.error'), e.message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      tr('profile.deleteTitle'),
      tr('profile.deleteMessage'),
      [
        { text: tr('profile.cancel'), style: 'cancel' },
        {
          text: tr('profile.deleteAccount'),
          style: 'destructive',
          onPress: async () => {
            try {
              await api.user.deleteAccount();
              await logout();
            } catch (e: any) {
              Alert.alert(tr('common.error'), e.message);
            }
          },
        },
      ]
    );
  };

  const toggleNotifications = (enabled: boolean) => {
    const notif = profile?.preferences?.notifications ?? {
      enabled: false,
      time: '08:00',
      type: 'daily_tip',
    };
    handleUpdateProfile({
      preferences: {
        ...profile?.preferences,
        notifications: { ...notif, enabled },
      },
    });
  };

  if (loading && !profile) {
    return (
      <View style={[styles.container, styles.centered, styles.gradientBg]}>
        <PlanetIcon name="Sun" size={48} />
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (!profile) return null;

  const notif = profile.preferences?.notifications;
  const hasNatalChart = !!profile.natalChart;

  return (
    <View style={[styles.container, styles.gradientBg]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInView>
          <View style={styles.headerWithIcon}>
            <PlanetIcon name="Sun" size={28} animated={false} />
            <Text style={styles.title}>{tr('profile.title')}</Text>
          </View>
        </FadeInView>

      <FadeInView delay={40}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{tr('profile.sectionInfo')}</Text>
          <TouchableOpacity
            onPress={() => setEditingProfile(!editingProfile)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>{editingProfile ? tr('profile.cancel') : tr('profile.edit')}</Text>
          </TouchableOpacity>
        </View>
        {editingProfile ? (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Text style={styles.formLabel}>{tr('profile.name')}</Text>
            <TextInput
              style={styles.input}
              placeholder={tr('profile.namePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={editName}
              onChangeText={setEditName}
            />
            <Text style={styles.formLabel}>{tr('profile.birthDate')}</Text>
            <TouchableOpacity
              style={styles.pickerInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.pickerText}>{editBirthDate ? formatDate(editBirthDate) : tr('profile.selectDate')}</Text>
            </TouchableOpacity>
            <DatePicker
              modal
              open={showDatePicker}
              date={editBirthDate || new Date()}
              mode="date"
              minimumDate={new Date(1900, 0, 1)}
              maximumDate={new Date()}
              onConfirm={(d) => { setShowDatePicker(false); setEditBirthDate(d); }}
              onCancel={() => setShowDatePicker(false)}
            />
            <Text style={styles.formLabel}>{tr('profile.birthTime')}</Text>
            <TouchableOpacity
              style={styles.pickerInput}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.pickerText}>{editBirthTime ? formatTime(editBirthTime) : tr('profile.selectTime')}</Text>
            </TouchableOpacity>
            <DatePicker
              modal
              open={showTimePicker}
              date={editBirthTime || new Date(2000, 0, 1, 12, 0)}
              mode="time"
              onConfirm={(d) => { setShowTimePicker(false); setEditBirthTime(d); }}
              onCancel={() => setShowTimePicker(false)}
            />
            <Text style={styles.formLabel}>{tr('profile.birthPlace')}</Text>
            <View style={styles.placeContainer}>
              <TextInput
                style={styles.input}
                placeholder={tr('profile.birthPlacePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={editPlaceQuery}
                onChangeText={handlePlaceSearch}
              />
              {placeSearching && <ActivityIndicator style={styles.placeSpinner} color={colors.accent} />}
            </View>
            {showPlaceResults && (
              <View style={styles.resultsDropdown}>
                {placeResults.map((item) => (
                  <Pressable key={item.placeId} style={styles.resultItem} onPress={() => selectPlace(item)}>
                    <Text style={styles.resultText}>{item.displayName}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={[styles.secondaryButton, { marginTop: spacing.sm }]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              <Text style={styles.secondaryButtonText}>{saving ? tr('profile.saving') : tr('profile.saveProfile')}</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        ) : (
          <>
            <Text style={styles.info}>{tr('profile.labelName')}: {profile.name}</Text>
            <Text style={styles.info}>{tr('profile.labelEmail')}: {profile.email}</Text>
            <Text style={styles.info}>{tr('profile.labelBirthDate')}: {new Date(profile.birthDate).toLocaleDateString()}</Text>
            <Text style={styles.info}>{tr('profile.labelBirthTime')}: {profile.birthTime}</Text>
            <Text style={styles.info}>{tr('profile.labelBirthPlace')}: {profile.birthPlace}</Text>
          </>
        )}
      </View>
      </FadeInView>

      <FadeInView delay={80}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{tr('profile.sectionChart')}</Text>
        {hasNatalChart ? (
          <View style={styles.chartTable}>
            {(
              [
                { planet: 'Sun', deg: profile.natalChart!.sun },
                { planet: 'Moon', deg: profile.natalChart!.moon },
                { planet: 'Ascendant', deg: profile.natalChart!.ascendant },
                profile.natalChart!.mercury != null && { planet: 'Mercury', deg: profile.natalChart!.mercury },
                profile.natalChart!.venus != null && { planet: 'Venus', deg: profile.natalChart!.venus },
                profile.natalChart!.mars != null && { planet: 'Mars', deg: profile.natalChart!.mars },
                profile.natalChart!.jupiter != null && { planet: 'Jupiter', deg: profile.natalChart!.jupiter },
                profile.natalChart!.saturn != null && { planet: 'Saturn', deg: profile.natalChart!.saturn },
                profile.natalChart!.uranus != null && { planet: 'Uranus', deg: profile.natalChart!.uranus },
                profile.natalChart!.neptune != null && { planet: 'Neptune', deg: profile.natalChart!.neptune },
                profile.natalChart!.pluto != null && { planet: 'Pluto', deg: profile.natalChart!.pluto },
              ].filter((p): p is { planet: string; deg: number } => Boolean(p))
            ).map((p) => (
                <View key={p.planet} style={styles.chartRow}>
                  <View style={styles.chartPlanetCell}>
                    <PlanetIcon name={p.planet} size={20} animated={false} />
                    <Text style={styles.chartPlanet}>{p.planet}</Text>
                  </View>
                  <Text style={styles.chartDegree}>{p.deg.toFixed(1)}°</Text>
                </View>
              ))}
          </View>
        ) : (
          <Text style={styles.hint}>{tr('profile.noChart')}</Text>
        )}
      </View>
      </FadeInView>

      <FadeInView delay={120}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{tr('profile.sectionNotifications')}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>{tr('profile.notifications')}: {notif?.enabled ? tr('profile.notificationsEnabled') : tr('profile.notificationsDisabled')}</Text>
          <Switch
            value={notif?.enabled ?? false}
            onValueChange={toggleNotifications}
          />
        </View>
        {notif?.enabled && (
          <Text style={styles.hint}>{tr('profile.notificationTimeLabel')}: {notif?.time ?? '08:00'} • {tr('profile.notificationType')}</Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{tr('profile.sectionPreferences')}</Text>
          <TouchableOpacity
            onPress={() => setEditingPreferences(!editingPreferences)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>{editingPreferences ? tr('profile.cancel') : tr('profile.edit')}</Text>
          </TouchableOpacity>
        </View>
        {editingPreferences ? (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Text style={styles.formLabel}>{tr('profile.theme')}</Text>
            <View style={styles.optionRow}>
              {THEMES.map((themeKey) => (
                <TouchableOpacity
                  key={themeKey}
                  style={[
                    styles.optionChip,
                    editTheme === themeKey && styles.optionChipSelected,
                  ]}
                  onPress={() => setEditTheme(themeKey)}
                >
                  <Text style={[
                    styles.optionChipText,
                    editTheme === themeKey && styles.optionChipTextSelected,
                  ]}>{themeKey === 'light' ? tr('profile.themeLight') : tr('profile.themeDark')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.formLabel}>{tr('profile.language')}</Text>
            <TouchableOpacity
              style={styles.pickerInput}
              onPress={() => setShowLanguageModal(true)}
            >
              <Text style={styles.pickerText}>
                {LANGUAGES.find((l) => l.value === editLanguage)?.label ?? editLanguage}
              </Text>
            </TouchableOpacity>
            <Modal
              visible={showLanguageModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowLanguageModal(false)}
            >
              <Pressable style={styles.modalOverlay} onPress={() => setShowLanguageModal(false)}>
                <Pressable style={styles.modalContent} onPress={() => {}}>
                  {LANGUAGES.map((lang) => (
                    <TouchableOpacity
                      key={lang.value}
                      style={styles.modalOption}
                      onPress={() => {
                        setEditLanguage(lang.value);
                        setShowLanguageModal(false);
                      }}
                    >
                      <Text style={styles.modalOptionText}>{lang.label}</Text>
                    </TouchableOpacity>
                  ))}
                </Pressable>
              </Pressable>
            </Modal>
            <Text style={styles.formLabel}>{tr('profile.notificationTime')}</Text>
            <TouchableOpacity
              style={styles.pickerInput}
              onPress={() => setShowNotifTimePicker(true)}
            >
              <Text style={styles.pickerText}>
                {editNotifTime ? formatTime(editNotifTime) : '08:00'}
              </Text>
            </TouchableOpacity>
            <DatePicker
              modal
              open={showNotifTimePicker}
              date={editNotifTime ?? new Date(2000, 0, 1, 8, 0)}
              mode="time"
              onConfirm={(d) => { setShowNotifTimePicker(false); setEditNotifTime(d); }}
              onCancel={() => setShowNotifTimePicker(false)}
            />
            <TouchableOpacity
              style={[styles.secondaryButton, { marginTop: spacing.sm }]}
              onPress={handleSavePreferences}
              disabled={saving}
            >
              <Text style={styles.secondaryButtonText}>{saving ? tr('profile.saving') : tr('profile.savePreferences')}</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        ) : (
          <>
            <Text style={styles.hint}>{tr('profile.theme')}: {profile.preferences?.theme === 'dark' ? tr('profile.themeDark') : tr('profile.themeLight')}</Text>
            <Text style={styles.hint}>{tr('profile.language')}: {profile.preferences?.language ?? 'en'}</Text>
            <Text style={styles.hint}>
              {tr('profile.notificationTime')}: {profile.preferences?.notifications?.time ?? '08:00'}
            </Text>
          </>
        )}
      </View>

      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleExport}>
          <Text style={styles.secondaryButtonText}>Export Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
          <Text style={styles.secondaryButtonText}>Reset App</Text>
        </TouchableOpacity>
      </View> */}

      <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
        <Text style={styles.dangerButtonText}>{tr('profile.deleteAccount')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>{tr('profile.logout')}</Text>
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
      paddingBottom: spacing.xl * 2,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerWithIcon: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: c.primary,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: c.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    editButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    editButtonText: {
      fontSize: 14,
      color: c.accent,
      fontWeight: '600',
    },
    formLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: c.textSecondary,
      marginBottom: 6,
      marginTop: 10,
    },
    input: {
      backgroundColor: (c as any).inputBg ?? c.surface,
      borderWidth: 1,
      borderColor: (c as any).inputBorder ?? c.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      color: c.text,
      marginBottom: spacing.xs,
    },
    pickerInput: {
      backgroundColor: (c as any).inputBg ?? c.surface,
      borderWidth: 1,
      borderColor: (c as any).inputBorder ?? c.border,
      borderRadius: 12,
      padding: 14,
      marginBottom: spacing.xs,
      justifyContent: 'center',
      minHeight: 48,
    },
    pickerText: {
      fontSize: 16,
      color: c.text,
    },
    placeContainer: {
      position: 'relative',
    },
    placeSpinner: {
      position: 'absolute',
      right: 14,
      top: 14,
    },
    resultsDropdown: {
      backgroundColor: (c as any).modalBg ?? c.surface,
      borderRadius: 12,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: c.border,
      overflow: 'hidden',
    },
    resultItem: {
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(51, 65, 85, 0.5)',
    },
    resultText: {
      fontSize: 14,
      color: c.text,
    },
    optionRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    optionChip: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: (c as any).inputBg ?? c.surface,
    },
    optionChipSelected: {
      borderColor: c.accent,
      backgroundColor: (c as any).secondaryButtonBg ?? c.surface,
    },
    optionChipText: {
      fontSize: 14,
      color: c.textSecondary,
    },
    optionChipTextSelected: {
      color: c.accent,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: (c as any).modalOverlay ?? 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    modalContent: {
      backgroundColor: (c as any).modalBg ?? c.surface,
      borderRadius: 16,
      width: '100%',
      maxWidth: 320,
      overflow: 'hidden',
    },
    modalOption: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(51, 65, 85, 0.5)',
    },
    modalOptionText: {
      fontSize: 16,
      color: c.text,
    },
    info: {
      fontSize: 14,
      color: c.text,
      marginBottom: spacing.xs,
    },
  chartTable: {
    backgroundColor: (c as any).cardBg ?? c.surface,
      borderRadius: 12,
      marginBottom: spacing.sm,
      overflow: 'hidden',
      borderWidth: 1,
    borderColor: (c as any).cardBorder ?? c.border,
  },
  chartRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: spacing.sm,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(51, 65, 85, 0.5)',
    },
    chartPlanetCell: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    chartPlanet: {
      fontSize: 14,
      color: c.text,
    },
    chartDegree: {
      fontSize: 14,
      fontWeight: '600',
      color: c.primary,
    },
    hint: {
      fontSize: 14,
      color: c.secondary,
      marginBottom: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    label: {
      fontSize: 14,
      color: c.text,
    },
  secondaryButton: {
    backgroundColor: (c as any).secondaryButtonBg ?? c.surface,
      padding: spacing.md,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: (c as any).secondaryButtonBorder ?? c.border,
    },
    secondaryButtonText: {
      color: c.accentLight,
      fontSize: 16,
    },
    dangerButton: {
      backgroundColor: 'rgba(248, 113, 113, 0.2)',
      borderWidth: 1,
      borderColor: c.error,
      padding: spacing.md,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    dangerButtonText: {
      color: c.error,
      fontSize: 16,
      fontWeight: '600',
    },
    logoutButton: {
      alignItems: 'center',
      padding: spacing.md,
    },
    logoutText: {
      color: c.textSecondary,
      fontSize: 14,
    },
  });
}
