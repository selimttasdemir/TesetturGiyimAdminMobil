import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants';
import { isWeb, isMobileSize, getSidebarWidth } from '../../utils/platform';

interface HeaderProps {
  title: string;
  showMenu?: boolean;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  notificationCount?: number;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showMenu = false,
  onMenuPress,
  onNotificationPress,
  onProfilePress,
  notificationCount = 0,
  userName = 'Admin',
}) => {
  const sidebarWidth = getSidebarWidth();

  return (
    <View style={[
      styles.container,
      isWeb && !isMobileSize && { marginLeft: sidebarWidth }
    ]}>
      <View style={styles.leftSection}>
        {showMenu && isMobileSize && (
          <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
            <MaterialCommunityIcons name="menu" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.rightSection}>
        {/* Bildirimler */}
        <TouchableOpacity
          onPress={onNotificationPress}
          style={styles.iconButton}
        >
          <MaterialCommunityIcons name="bell-outline" size={24} color={COLORS.text} />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profil */}
        <TouchableOpacity
          onPress={onProfilePress}
          style={styles.profileButton}
        >
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={20} color={COLORS.surface} />
          </View>
          {!isMobileSize && (
            <Text style={styles.userName}>{userName}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      position: 'sticky' as any,
      top: 0,
      zIndex: 10,
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  iconButton: {
    padding: SPACING.sm,
    position: 'relative',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as any,
    }),
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 20,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer' as any,
      ':hover': {
        backgroundColor: COLORS.background,
      },
    }),
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
});
