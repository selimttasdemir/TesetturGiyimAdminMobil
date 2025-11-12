import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Card, ConfirmModal, InfoModal } from '../../components/common';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { useResponsiveGrid } from '../../hooks/useResponsiveGrid';

interface SettingItem {
  id: string;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  subtitle?: string;
  onPress: () => void;
  color?: string;
}

export const SettingsScreen = ({ navigation }: any) => {
  const { user, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });
  
  // Responsive grid - 3 sütun için optimize (min 280px kart genişliği, 140px yükseklik)
  const gridConfig = useResponsiveGrid(280, 140);

  const showInfo = (title: string, message: string) => {
    setInfoModal({ visible: true, title, message });
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    console.log('Logout başlatılıyor...');
    try {
      await logout();
      console.log('Logout başarılı');
    } catch (error) {
      console.error('Logout hatası:', error);
    }
  };

  const generalSettings: SettingItem[] = [
    {
      id: 'profile',
      title: 'Profil Bilgileri',
      icon: 'account',
      subtitle: user?.email || '',
      onPress: () => showInfo('Bilgi', 'Profil düzenleme özelliği yakında eklenecek'),
    },
    {
      id: 'notifications',
      title: 'Bildirimler',
      icon: 'bell',
      subtitle: 'Bildirim tercihlerini yönet',
      onPress: () => showInfo('Bilgi', 'Bildirim ayarları yakında eklenecek'),
    },
    {
      id: 'security',
      title: 'Güvenlik',
      icon: 'shield-account',
      subtitle: 'Şifre ve güvenlik ayarları',
      onPress: () => showInfo('Bilgi', 'Güvenlik ayarları yakında eklenecek'),
    },
  ];

  const systemSettings: SettingItem[] = [
    {
      id: 'backup',
      title: 'Yedekleme',
      icon: 'cloud-upload',
      subtitle: 'Verileri yedekle',
      onPress: () => showInfo('Bilgi', 'Yedekleme özelliği yakında eklenecek'),
    },
    {
      id: 'database',
      title: 'Veritabanı',
      icon: 'database',
      subtitle: 'Veritabanı yönetimi',
      onPress: () => showInfo('Bilgi', 'Veritabanı yönetimi yakında eklenecek'),
    },
    {
      id: 'logs',
      title: 'Sistem Logları',
      icon: 'file-document',
      subtitle: 'Hata ve işlem kayıtları',
      onPress: () => showInfo('Bilgi', 'Log görüntüleme yakında eklenecek'),
    },
  ];

  const aboutSettings: SettingItem[] = [
    {
      id: 'help',
      title: 'Yardım ve Destek',
      icon: 'help-circle',
      onPress: () => showInfo('Bilgi', 'Yardım sayfası yakında eklenecek'),
    },
    {
      id: 'about',
      title: 'Hakkında',
      icon: 'information',
      subtitle: 'Versiyon 1.0.0',
      onPress: () => showInfo('Tesettür Giyim Admin', 'Versiyon 1.0.0\n\n© 2025 Tüm hakları saklıdır'),
    },
  ];

  const renderSettingItem = ({ item }: { item: SettingItem }) => (
    <View style={[styles.gridItem, { width: gridConfig.itemWidth }]}>
      <TouchableOpacity
        style={[styles.settingCard, { height: gridConfig.cardHeight }]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, item.color && { backgroundColor: `${item.color}15` }]}>
          <MaterialCommunityIcons
            name={item.icon}
            size={28}
            color={item.color || COLORS.primary}
          />
        </View>
        <Text style={[styles.settingTitle, item.color && { color: item.color }]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Combine all settings for grid
  const allSettings = [
    ...generalSettings,
    ...systemSettings,
    ...aboutSettings,
  ];

  return (
    <View style={styles.container}>
      {/* User Info Header */}
      <View style={styles.header}>
        <Card>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <MaterialCommunityIcons name="account" size={48} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
              <Text style={styles.userEmail}>{user?.email || ''}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {user?.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </View>

      {/* Settings Grid */}
      <FlatList
        data={allSettings}
        renderItem={renderSettingItem}
        keyExtractor={(item) => item.id}
        numColumns={gridConfig.numColumns}
        key={`grid-${gridConfig.numColumns}`}
        columnWrapperStyle={gridConfig.numColumns > 1 ? {
          gap: gridConfig.itemSpacing,
          paddingHorizontal: gridConfig.gridPadding,
        } : undefined}
        contentContainerStyle={{
          paddingVertical: SPACING.md,
          gap: gridConfig.itemSpacing,
        }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                console.log('Çıkış butonuna tıklandı!');
                setShowLogoutModal(true);
              }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="logout" size={24} color={COLORS.surface} />
              <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={showLogoutModal}
        title="Çıkış Yap"
        message="Çıkış yapmak istediğinize emin misiniz?"
        icon="logout"
        iconColor={COLORS.error}
        confirmText="Çıkış Yap"
        cancelText="İptal"
        confirmButtonColor={COLORS.error}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Info Modal */}
      <InfoModal
        visible={infoModal.visible}
        title={infoModal.title}
        message={infoModal.message}
        onClose={() => setInfoModal({ visible: false, title: '', message: '' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.md,
    paddingBottom: 0,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  roleBadge: {
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  gridItem: {
    marginBottom: SPACING.xs,
  },
  settingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }
    ),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  settingTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  logoutContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }
    ),
    gap: SPACING.sm,
  },
  logoutText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.surface,
  },
});
