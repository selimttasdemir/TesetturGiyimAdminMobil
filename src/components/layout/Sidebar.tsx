import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants';
import { isWeb, getSidebarWidth, isMobileSize } from '../../utils/platform';

interface SidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  onClose?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Ana Panel', icon: 'view-dashboard', route: 'Dashboard' },
  { id: 'products', label: 'Ürünler', icon: 'hanger', route: 'Products' },
  { id: 'categories', label: 'Kategoriler', icon: 'tag-multiple', route: 'Categories' },
  { id: 'sales', label: 'Satışlar', icon: 'cash-register', route: 'Sales' },
  { id: 'purchases', label: 'Tedarik', icon: 'package-variant', route: 'Purchases' },
  { id: 'suppliers', label: 'Tedarikçiler', icon: 'truck', route: 'Suppliers' },
  { id: 'customers', label: 'Müşteriler', icon: 'account-group', route: 'Customers' },
  { id: 'inventory', label: 'Stok', icon: 'warehouse', route: 'Inventory' },
  { id: 'reports', label: 'Raporlar', icon: 'chart-line', route: 'Reports' },
  { id: 'settings', label: 'Ayarlar', icon: 'cog', route: 'Settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeRoute, onNavigate, onClose }) => {
  if (!isWeb) return null;

  const sidebarWidth = getSidebarWidth();
  if (sidebarWidth === 0) return null;

  return (
    <View style={[styles.container, { width: sidebarWidth }]}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="hanger" size={32} color={COLORS.primary} />
        <Text style={styles.title}>Admin Panel</Text>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => {
          const isActive = activeRoute === item.route;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => onNavigate(item.route)}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={22}
                color={isActive ? COLORS.primary : COLORS.textSecondary}
              />
              <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
                {item.label}
              </Text>
              {item.badge && item.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>v1.0.0</Text>
        <Text style={styles.footerSubText}>Tesettür Giyim</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    height: '100%',
    flexDirection: 'column',
    ...(isWeb ? {
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
    } : {}),
  } as any,
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  menu: {
    flex: 1,
    paddingVertical: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginHorizontal: SPACING.sm,
    borderRadius: 8,
    cursor: 'pointer',
  },
  menuItemActive: {
    backgroundColor: COLORS.primaryLight + '20',
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  menuTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  footerSubText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
