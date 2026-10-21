/**
 * App.tsx
 * ---------------------------------------------------------------
 * Entry point aplikasi PPNP Canteen.
 *
 * Tugas App.tsx hanya:
 *   1. Menyiapkan (inisialisasi) database SQLite
 *   2. Menampilkan status proses (loading / error)
 *   3. Menjalankan navigasi aplikasi setelah database siap
 *
 * Seluruh logika bisnis berada di folder src/ (screens, services, database).
 */

import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { APP_INFO } from './src/constants/appConstants';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from './src/constants/theme';
import { initializeDatabase } from './src/database/database';
import { AppNavigator } from './src/navigation/AppNavigator';

type AppState = 'LOADING' | 'READY' | 'ERROR';

export default function App() {
  const [state, setState] = useState<AppState>('LOADING');
  const [errorMessage, setErrorMessage] = useState<string>('');

  /** Menjalankan proses inisialisasi database */
  const prepareDatabase = useCallback(async () => {
    try {
      setState('LOADING');
      await initializeDatabase();
      setState('READY');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Terjadi kesalahan saat menyiapkan database';
      setErrorMessage(message);
      setState('ERROR');
    }
  }, []);

  useEffect(() => {
    prepareDatabase();
  }, [prepareDatabase]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />

      {state === 'LOADING' ? (
        // Layar proses: koneksi database dibuka, tabel dibuat, data contoh diisi
        <View style={styles.splash}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>PPNP</Text>
          </View>
          <Text style={styles.title}>{APP_INFO.appName}</Text>
          <Text style={styles.subtitle}>{APP_INFO.description}</Text>
          <ActivityIndicator
            size="large"
            color={COLORS.accent}
            style={styles.loader}
          />
          <Text style={styles.loadingText}>Menyiapkan database SQLite...</Text>
        </View>
      ) : state === 'ERROR' ? (
        // Layar error: database gagal disiapkan
        <View style={styles.splash}>
          <Text style={styles.errorTitle}>Database Gagal Dipersiapkan</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Text style={styles.retry} onPress={prepareDatabase}>
            Ketuk untuk mencoba lagi
          </Text>
        </View>
      ) : (
        // Aplikasi siap digunakan
        <AppNavigator />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  logoText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.heavy,
  },
  title: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FONT_SIZE.md,
    marginTop: 4,
  },
  loader: {
    marginTop: SPACING.xl,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.md,
  },
  errorTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
  },
  errorText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  retry: {
    color: COLORS.accent,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.xl,
    textDecorationLine: 'underline',
  },
});
