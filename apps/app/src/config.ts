import { Platform } from 'react-native';

// Set EXPO_PUBLIC_API_HOST in .env when using a physical device (e.g. 192.168.1.5).
// Simulator: localhost. Android emulator: 10.0.2.2.
const DEV_HOST =
  (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_HOST) ||
  (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

export const API_BASE_URL =
  __DEV__
    ? `http://${DEV_HOST}:3000/api`
    : 'https://your-production-api.com/api';
