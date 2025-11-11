import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/common/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

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

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // Auth state değişince RootNavigator otomatik olarak AuthNavigator'a yönlendirecek
          },
        },
      ]
    );
  };

  const generalSettings: SettingItem[] = [
    {
      id: 'profile',
      title: 'Profil Bilgileri',
      icon: 'account',
      subtitle: user?.email || '',
      onPress: () => Alert.alert('Bilgi', 'Profil düzenleme özelliği yakında eklenecek'),
    },
    {
      id: 'notifications',
      title: 'Bildirimler',
      icon: 'bell',
      subtitle: 'Bildirim tercihlerini yönet',
      onPress: () => Alert.alert('Bilgi', 'Bildirim ayarları yakında eklenecek'),
    },
    {
      id: 'security',
      title: 'Güvenlik',
      icon: 'shield-account',
      subtitle: 'Şifre ve güvenlik ayarları',
      onPress: () => Alert.alert('Bilgi', 'Güvenlik ayarları yakında eklenecek'),
    },
  ];

  const systemSettings: SettingItem[] = [
    {
      id: 'backup',
      title: 'Yedekleme',
      icon: 'cloud-upload',
      subtitle: 'Verileri yedekle',
      onPress: () => Alert.alert('Bilgi', 'Yedekleme özelliği yakında eklenecek'),
    },
    {
      id: 'database',
      title: 'Veritabanı',
      icon: 'database',
      subtitle: 'Veritabanı yönetimi',
      onPress: () => Alert.alert('Bilgi', 'Veritabanı yönetimi yakında eklenecek'),
    },
    {
      id: 'logs',
      title: 'Sistem Logları',
      icon: 'file-document',
      subtitle: 'Hata ve işlem kayıtları',
      onPress: () => Alert.alert('Bilgi', 'Log görüntüleme yakında eklenecek'),
    },
  ];

  const aboutSettings: SettingItem[] = [
    {
      id: 'help',
      title: 'Yardım ve Destek',
      icon: 'help-circle',
      onPress: () => Alert.alert('Bilgi', 'Yardım sayfası yakında eklenecek'),
    },
    {
      id: 'about',
      title: 'Hakkında',
      icon: 'information',
      subtitle: 'Versiyon 1.0.0',
      onPress: () => Alert.alert('Tesettür Giyim Admin', 'Versiyon 1.0.0\n\n© 2025 Tüm hakları saklıdır'),
    },
    {
      id: 'logout',
      title: 'Çıkış Yap',
      icon: 'logout',
      onPress: handleLogout,
      color: COLORS.error,
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
    >
      <View style={[styles.iconContainer, item.color && { backgroundColor: `${item.color}15` }]}>
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={item.color || COLORS.primary}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, item.color && { color: item.color }]}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={COLORS.textSecondary}
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Info */}
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

      {/* General Settings */}
      <Text style={styles.sectionTitle}>Genel Ayarlar</Text>
      <Card>
        {generalSettings.map(renderSettingItem)}
      </Card>

      {/* System Settings */}
      <Text style={styles.sectionTitle}>Sistem Ayarları</Text>
      <Card>
        {systemSettings.map(renderSettingItem)}
      </Card>

      {/* About */}
      <Text style={styles.sectionTitle}>Diğer</Text>
      <Card>
        {aboutSettings.map(renderSettingItem)}
      </Card>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
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
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
