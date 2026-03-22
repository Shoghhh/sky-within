import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Pressable,
  Keyboard,
} from 'react-native';
import { api } from '../lib/api';
import { usePreferences } from '../lib/preferences';
import { useTranslation } from '../lib/i18n';
import { spacing } from '../constants/theme';
import PlanetIcon from '../components/PlanetIcon';
import { searchPlaces, type GeocodeResult } from '../lib/geocode';
import DatePicker from 'react-native-date-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const { colors, language } = usePreferences();
  const t = useTranslation(language);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const validators = useCallback((field: string, value: any): string | null => {
    if (field === 'name') {
      const trimmed = (value || '').trim();
      if (trimmed.length < 2) return t('register.errorName');
      if (trimmed.length > 50) return t('register.errorNameLong');
      if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) return t('register.errorNameChars');
      return null;
    }
    if (field === 'email') {
      const trimmed = (value || '').trim();
      if (!trimmed) return t('register.errorEmail');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) return t('register.errorEmailInvalid');
      return null;
    }
    if (field === 'password') {
      if ((value || '').length < 6) return t('register.errorPassword');
      if ((value || '').length > 128) return t('register.errorPasswordLong');
      if (!/[A-Za-z]/.test(value || '')) return t('register.errorPasswordLetter');
      if (!/[0-9]/.test(value || '')) return t('register.errorPasswordNumber');
      return null;
    }
    if (field === 'birthDate') return !value ? t('register.errorBirthDate') : null;
    if (field === 'birthTime') return !value ? t('register.errorBirthTime') : null;
    if (field === 'birthPlace') return !(value || '').trim() ? t('register.errorBirthPlace') : null;
    return null;
  }, [t]);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(new Date());
  const [birthTime, setBirthTime] = useState<Date | null>(null);
  const [birthPlace, setBirthPlace] = useState('');
  const [birthLat, setBirthLat] = useState<number | null>(null);
  const [birthLng, setBirthLng] = useState<number | null>(null);

  // UI State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<GeocodeResult[]>([]);
  const [placeSearching, setPlaceSearching] = useState(false);
  const [showPlaceResults, setShowPlaceResults] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const placeSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validate = validators;

  const updateError = (field: string, value: any) => {
    const err = validate(field, value);
    setErrors((prev) => ({ ...prev, [field]: err || '' }));
  };

  // Place Search Logic
  const handlePlaceInputChange = (text: string) => {
    setPlaceQuery(text);
    if (text.trim().length < 2) {
      setPlaceResults([]);
      setShowPlaceResults(false);
      return;
    }

    if (placeSearchTimeout.current) clearTimeout(placeSearchTimeout.current);
    placeSearchTimeout.current = setTimeout(async () => {
      setPlaceSearching(true);
      const results = await searchPlaces(text);
      setPlaceResults(results);
      setShowPlaceResults(results.length > 0);
      setPlaceSearching(false);
    }, 400);
  };

  const selectPlace = (result: GeocodeResult) => {
    setBirthPlace(result.displayName);
    setBirthLat(result.latitude);
    setBirthLng(result.longitude);
    setPlaceQuery(result.displayName);
    setShowPlaceResults(false);
    updateError('birthPlace', result.displayName);
    Keyboard.dismiss();
  };

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

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};
    const fields = { name, email, password, birthDate, birthTime, birthPlace };

    Object.keys(fields).forEach((key) => {
      const err = validate(key, (fields as any)[key]);
      if (err) newErrors[key] = err;
    });

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await api.auth.register({
        email: email.trim(),
        password,
        name: name.trim(),
        birthDate: formatDate(birthDate),
        birthTime: formatTime(birthTime),
        birthPlace: birthPlace.trim(),
        ...(birthLat != null && birthLng != null && { birthLatitude: birthLat, birthLongitude: birthLng }),
      });
      Alert.alert(t('common.success'), t('register.success'), [
        { text: t('common.ok'), onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || t('register.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerWithIcon}>
            <PlanetIcon name="Sun" size={28} animated={false} />
            <Text style={styles.title}>{t('register.title')}</Text>
          </View>

          {/* Name & Email */}
          <Text style={styles.label}>{t('register.name')}</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder={t('register.namePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={(v) => { setName(v); updateError('name', v); }}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

          <Text style={styles.label}>{t('register.email')}</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder={t('register.emailPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={(v) => { setEmail(v); updateError('email', v); }}
            autoCapitalize="none"
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <Text style={styles.label}>{t('register.password')}</Text>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder={t('register.passwordPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={(v) => { setPassword(v); updateError('password', v); }}
            secureTextEntry
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          {/* Date Picker Trigger */}
          <Text style={styles.label}>{t('register.birthDate')}</Text>
          <TouchableOpacity
            style={[styles.input, styles.pickerInput, errors.birthDate && styles.inputError]}
            onPress={() => {
              Keyboard.dismiss();
              setShowDatePicker(true);
            }}
          >
            <Text style={birthDate ? styles.pickerText : styles.pickerPlaceholder}>
              {birthDate ? formatDate(birthDate) : t('register.selectDate')}
            </Text>
          </TouchableOpacity>
          <DatePicker
            modal
            open={showDatePicker}
            date={birthDate || new Date()}
            mode="date"
            minimumDate={new Date(1900, 0, 1)}
            maximumDate={new Date()}
            onConfirm={(date) => {
              setShowDatePicker(false);
              setBirthDate(date);
              updateError('birthDate', date);
            }}
            onCancel={() => setShowDatePicker(false)}
          />
          {errors.birthDate ? <Text style={styles.errorText}>{errors.birthDate}</Text> : null}

          {/* Time Picker Trigger */}
          <Text style={styles.label}>{t('register.birthTime')}</Text>
          <TouchableOpacity
            style={[styles.input, styles.pickerInput, errors.birthTime && styles.inputError]}
            onPress={() => {
              Keyboard.dismiss();
              setShowTimePicker(true);
            }}
          >
            <Text style={birthTime ? styles.pickerText : styles.pickerPlaceholder}>
              {birthTime ? formatTime(birthTime) : t('register.selectTime')}
            </Text>
          </TouchableOpacity>
          <DatePicker
            modal
            open={showTimePicker}
            date={birthTime || new Date(2000, 0, 1, 12, 0)}
            mode="time"
            onConfirm={(date) => {
              setShowTimePicker(false);
              setBirthTime(date);
              updateError('birthTime', date);
            }}
            onCancel={() => setShowTimePicker(false)}
          />
          {errors.birthTime ? <Text style={styles.errorText}>{errors.birthTime}</Text> : null}

          {/* Place Search */}
          <Text style={styles.label}>{t('register.birthPlace')}</Text>
          <View style={styles.placeContainer}>
            <TextInput
              style={[styles.input, errors.birthPlace && styles.inputError]}
              placeholder={t('register.birthPlacePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={placeQuery}
              onChangeText={handlePlaceInputChange}
            />
            {placeSearching && <ActivityIndicator style={styles.placeSpinner} color={colors.accent} />}
          </View>

          {showPlaceResults && (
            <View style={styles.resultsDropdown}>
              {placeResults.map((item) => (
                <Pressable
                  key={item.placeId}
                  style={styles.resultItem}
                  onPress={() => selectPlace(item)}
                >
                  <Text style={styles.resultText}>{item.displayName}</Text>
                </Pressable>
              ))}
            </View>
          )}
          {errors.birthPlace ? <Text style={styles.errorText}>{errors.birthPlace}</Text> : null}

          <TouchableOpacity
            style={[styles.button, styles.buttonWrapper]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('register.button')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>{t('register.link')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

function createStyles(c: typeof import('../constants/theme').colors.light) {
  return StyleSheet.create({
  gradient: { flex: 1, backgroundColor: c.background },
  container: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 60 },
  headerWithIcon: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  title: { fontSize: 28, fontWeight: '700', color: c.text },
  label: { fontSize: 13, fontWeight: '600', color: c.textSecondary, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: (c as any).inputBg ?? c.surface,
    borderWidth: 1,
    borderColor: (c as any).inputBorder ?? c.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: c.text,
  },
  inputError: { borderColor: c.error },
  errorText: { fontSize: 12, color: c.error, marginTop: 4 },
  pickerInput: { justifyContent: 'center', minHeight: 52 },
  pickerText: { color: c.text, fontSize: 16 },
  pickerPlaceholder: { color: c.textSecondary, fontSize: 16 },
  placeContainer: { position: 'relative' },
  placeSpinner: { position: 'absolute', right: 15, top: 15 },
  resultsDropdown: {
    backgroundColor: (c as any).modalBg ?? c.surface,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: c.border,
    overflow: 'hidden',
    zIndex: 10,
  },
  resultItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: c.border },
  resultText: { color: c.text, fontSize: 14 },
  buttonWrapper: { marginTop: 30, shadowColor: '#6366F1', shadowOpacity: 0.3, shadowRadius: 10 },
  button: { padding: 16, alignItems: 'center', backgroundColor: '#6366F1', borderRadius: 12 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  link: { marginTop: 25, marginBottom: 20, alignItems: 'center' },
  linkText: { color: c.accent, fontSize: 14 },
  });
}