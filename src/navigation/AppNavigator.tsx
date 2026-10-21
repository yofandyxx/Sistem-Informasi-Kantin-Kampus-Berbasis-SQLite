/**
 * AppNavigator.tsx
 * ---------------------------------------------------------------
 * Navigasi aplikasi:
 *   - Stack utama (native-stack): halaman tab + halaman turunan
 *     (form menu, form kategori, daftar kategori, struk, riwayat, laporan stok)
 *   - Tab bawah (bottom-tabs): Dashboard, Menu, Transaksi, Laporan, Profil
 *
 * Semua header native disembunyikan karena aplikasi memakai AppHeader sendiri.
 */

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { COLORS, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';
import { CategoryFormScreen } from '../screens/CategoryFormScreen';
import { CategoryScreen } from '../screens/CategoryScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { MenuFormScreen } from '../screens/MenuFormScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ReceiptScreen } from '../screens/ReceiptScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { StockReportScreen } from '../screens/StockReportScreen';
import { TransactionHistoryScreen } from '../screens/TransactionHistoryScreen';
import { TransactionScreen } from '../screens/TransactionScreen';
import type { IconName, MainTabParamList, RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

/** Ikon untuk setiap tab (berbeda saat aktif / tidak aktif) */
const TAB_ICONS: Record<
  keyof MainTabParamList,
  { active: IconName; inactive: IconName }
> = {
  Dashboard: { active: 'grid', inactive: 'grid-outline' },
  Menu: { active: 'fast-food', inactive: 'fast-food-outline' },
  Transaction: { active: 'cart', inactive: 'cart-outline' },
  Report: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

/** Bottom navigation (5 menu utama) */
const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: FONT_SIZE.xs,
          fontWeight: FONT_WEIGHT.medium,
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name as keyof MainTabParamList];
          return <Ionicons name={focused ? icons.active : icons.inactive} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Menu" component={MenuScreen} options={{ title: 'Menu' }} />
      <Tab.Screen
        name="Transaction"
        component={TransactionScreen}
        options={{ title: 'Transaksi' }}
      />
      <Tab.Screen name="Report" component={ReportScreen} options={{ title: 'Laporan' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
};

/** Stack utama aplikasi */
export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="MenuForm" component={MenuFormScreen} />
        <Stack.Screen name="CategoryForm" component={CategoryFormScreen} />
        <Stack.Screen name="CategoryList" component={CategoryScreen} />
        <Stack.Screen name="Receipt" component={ReceiptScreen} />
        <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
        <Stack.Screen name="StockReport" component={StockReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
