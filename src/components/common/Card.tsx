import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  iconColor = COLORS.primary,
  onPress,
  style,
  headerAction,
}) => {
  const Container: any = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {(title || subtitle || icon) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {icon && (
              <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                <MaterialCommunityIcons name={icon as any} size={24} color={iconColor} />
              </View>
            )}
            <View style={styles.headerText}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>
          {headerAction}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
      : { elevation: 3 }) as any,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  content: {
    // Content styles can be customized by children
  },
});
