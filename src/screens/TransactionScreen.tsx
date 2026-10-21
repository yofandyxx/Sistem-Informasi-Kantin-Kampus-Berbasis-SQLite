/**
 * TransactionScreen.tsx
 * ---------------------------------------------------------------
 * Halaman transaksi penjualan (Output 3.3):
 *   - Memilih menu yang dapat dibeli
 *   - Menambah / mengurangi jumlah item pada keranjang
 *   - Menghitung subtotal & total pembayaran otomatis
 *   - Memilih metode pembayaran
 *   - Menyimpan transaksi (atomik) lalu menampilkan struk
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppHeader } from '../components/AppHeader';
import { CartItem } from '../components/CartItem';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/Feedback';
import { MenuCard } from '../components/MenuCard';
import { ActionButton } from '../components/ActionButton';
import { PAYMENT_METHODS } from '../constants/appConstants';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { getCategories } from '../services/categoryService';
import { getPurchasableMenus } from '../services/menuService';
import { createTransaction } from '../services/transactionService';
import type { CartItem as CartItemType, Category, Menu, PaymentMethod, TabScreenProps } from '../types';
import { calculateCartTotal, calculateSubtotal, calculateTotalQuantity } from '../utils/calculation';
import { formatRupiah } from '../utils/currency';

export const TransactionScreen: React.FC<TabScreenProps<'Transaction'>> = ({ navigation }) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TUNAI');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Memuat menu yang dapat dibeli (aktif & stok > 0) beserta kategorinya */
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [menuList, categoryList] = await Promise.all([
        getPurchasableMenus(),
        getCategories(),
      ]);
      setMenus(menuList);
      setCategories(categoryList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar menu');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  /** Menu yang sudah difilter oleh pencarian & kategori */
  const filteredMenus = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return menus.filter((menu) => {
      const matchSearch = !keyword || menu.name.toLowerCase().includes(keyword);
      const matchCategory =
        selectedCategory === null || menu.category_id === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [menus, search, selectedCategory]);

  /** Menambah menu ke keranjang (jumlah existing bertambah 1) */
  const addToCart = (menu: Menu) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuId === menu.id);
      if (existing) {
        if (existing.quantity >= menu.stock) {
          Alert.alert('Stok Tidak Cukup', `Stok "${menu.name}" hanya ${menu.stock}.`);
          return prev;
        }
        const quantity = existing.quantity + 1;
        return prev.map((item) =>
          item.menuId === menu.id
            ? { ...item, quantity, subtotal: calculateSubtotal(item.price, quantity) }
            : item,
        );
      }

      const newItem: CartItemType = {
        menuId: menu.id,
        name: menu.name,
        price: menu.price,
        stock: menu.stock,
        icon: menu.icon,
        quantity: 1,
        subtotal: calculateSubtotal(menu.price, 1),
      };
      return [...prev, newItem];
    });
  };

  /** Menambah jumlah item pada keranjang */
  const increaseItem = (menuId: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.menuId !== menuId) return item;
        if (item.quantity >= item.stock) {
          Alert.alert('Stok Tidak Cukup', `Stok "${item.name}" hanya ${item.stock}.`);
          return item;
        }
        const quantity = item.quantity + 1;
        return { ...item, quantity, subtotal: calculateSubtotal(item.price, quantity) };
      }),
    );
  };

  /** Mengurangi jumlah item pada keranjang (minimal 1) */
  const decreaseItem = (menuId: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.menuId !== menuId) return item;
        const quantity = Math.max(1, item.quantity - 1);
        return { ...item, quantity, subtotal: calculateSubtotal(item.price, quantity) };
      }),
    );
  };

  /** Menghapus item dari keranjang */
  const removeItem = (menuId: number) => {
    setCart((prev) => prev.filter((item) => item.menuId !== menuId));
  };

  /** Total pembayaran (dihitung otomatis dari keranjang) */
  const totalPayment = calculateCartTotal(cart);
  const totalQuantity = calculateTotalQuantity(cart);

  /** Menyimpan transaksi ke database */
  const handleSave = async () => {
    // Pencegahan penekanan tombol berulang (double submit)
    if (saving) return;

    if (cart.length === 0) {
      Alert.alert('Keranjang Kosong', 'Tambahkan minimal satu menu ke keranjang.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const transactionId = await createTransaction({ items: cart, paymentMethod });

      // Keranjang dikosongkan setelah transaksi berhasil
      setCart([]);

      Alert.alert(
        'Transaksi Berhasil',
        `Transaksi ${new Date().toLocaleString('id-ID')} tersimpan.\nStok otomatis berkurang.`,
        [
          {
            text: 'Lihat Struk',
            onPress: () => navigation.navigate('Receipt', { transactionId }),
          },
        ],
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan transaksi';
      setError(message);
      Alert.alert('Transaksi Gagal', `${message}\nStok tidak berubah.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Transaksi Penjualan"
        subtitle={`${totalQuantity} item di keranjang`}
        rightIcon="receipt-outline"
        rightLabel="Riwayat"
        onRightPress={() => navigation.navigate('TransactionHistory')}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {error ? <ErrorBanner message={error} onRetry={loadData} /> : null}

        {/* Pencarian menu */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari menu yang ingin dibeli..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
          />
          {search.length > 0 ? (
            <Pressable onPress={() => setSearch('')} accessibilityRole="button">
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {/* Filter kategori */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
        >
          <Pressable
            onPress={() => setSelectedCategory(null)}
            style={[styles.chip, selectedCategory === null && styles.chipActive]}
          >
            <Text style={[styles.chipText, selectedCategory === null && styles.chipTextActive]}>
              Semua
            </Text>
          </Pressable>
          {categories.map((category) => {
            const isActive = selectedCategory === category.id;
            return (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Daftar menu yang dapat dibeli */}
        <Text style={styles.sectionTitle}>Pilih Menu</Text>
        {filteredMenus.length === 0 ? (
          <EmptyState
            icon="fast-food-outline"
            title="Menu tidak tersedia"
            message="Tidak ada menu yang bisa dibeli (stok habis atau tidak cocok dengan filter)."
          />
        ) : (
          filteredMenus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              actionIcon="add"
              actionLabel="Tambah"
              onAction={() => addToCart(menu)}
            />
          ))
        )}

        {/* Keranjang belanja */}
        <Text style={styles.sectionTitle}>Keranjang Belanja</Text>
        {cart.length === 0 ? (
          <View style={styles.emptyCart}>
            <Ionicons name="cart-outline" size={30} color={COLORS.textMuted} />
            <Text style={styles.emptyCartText}>
              Keranjang masih kosong. Ketuk tombol "Tambah" pada menu untuk memulai transaksi.
            </Text>
          </View>
        ) : (
          cart.map((item) => (
            <CartItem
              key={item.menuId}
              item={item}
              onIncrease={() => increaseItem(item.menuId)}
              onDecrease={() => decreaseItem(item.menuId)}
              onRemove={() => removeItem(item.menuId)}
            />
          ))
        )}
      </ScrollView>

      {/* Panel ringkasan total (tetap terlihat di bawah) */}
      <View style={styles.summaryPanel}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Jumlah Item</Text>
          <Text style={styles.summaryValue}>{totalQuantity}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatRupiah(totalPayment)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Pembayaran</Text>
          <Text style={styles.totalValue}>{formatRupiah(totalPayment)}</Text>
        </View>

        {/* Metode pembayaran */}
        <Text style={styles.paymentLabel}>Metode Pembayaran</Text>
        <View style={styles.paymentRow}>
          {PAYMENT_METHODS.map((method) => {
            const isActive = paymentMethod === method.key;
            return (
              <Pressable
                key={method.key}
                onPress={() => setPaymentMethod(method.key)}
                style={[styles.paymentChip, isActive && styles.paymentChipActive]}
                accessibilityRole="button"
              >
                <Ionicons
                  name={method.icon}
                  size={18}
                  color={isActive ? COLORS.white : method.color}
                />
                <Text
                  style={[styles.paymentText, isActive && styles.paymentTextActive]}
                >
                  {method.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ActionButton
          label={saving ? 'Menyimpan...' : 'Simpan Transaksi'}
          icon="checkmark-circle-outline"
          variant="accent"
          onPress={handleSave}
          loading={saving}
          disabled={cart.length === 0}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 46,
    ...SHADOWS.card,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  chipContainer: {
    paddingVertical: SPACING.md,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  chipTextActive: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.semibold,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  emptyCart: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
  },
  emptyCartText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  summaryPanel: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.floating,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  totalLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.accent,
  },
  paymentLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.semibold,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  paymentChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    marginRight: SPACING.sm,
  },
  paymentChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  paymentText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
    marginLeft: 6,
  },
  paymentTextActive: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
