import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/lib/auth';
import { PreferencesProvider, usePreferences } from './src/lib/preferences';
import { useTranslation } from './src/lib/i18n';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TransitsScreen from './src/screens/TransitsScreen';
import JournalScreen from './src/screens/JournalScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ThemeAwareStatusBar() {
  const { theme } = usePreferences();
  return <StatusBar style={theme === 'light' ? 'dark' : 'light'} />;
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { colors, language } = usePreferences();
  const t = useTranslation(language);
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: 'rgba(129, 140, 248, 0.2)',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerStyle: {
          backgroundColor: colors.background,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(129, 140, 248, 0.15)',
        },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: t('app.title'),
          tabBarLabel: t('tab.dashboard'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="planet" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Transits"
        component={TransitsScreen}
        options={{
          tabBarLabel: t('tab.transits'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="telescope" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          tabBarLabel: t('tab.journal'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tab.profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  const { colors } = usePreferences();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors, language } = usePreferences();
  const t = useTranslation(language);

  if (isLoading) {
    return (
      <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>{t('app.loading')}</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainStack} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <NavigationContainer>
          <ThemeAwareStatusBar />
          <RootNavigator />
        </NavigationContainer>
      </PreferencesProvider>
    </AuthProvider>
  );
}
