import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useToastStore, ToastType } from '../../store/toastStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

interface ToastItemProps {
  id: string;
  type: ToastType;
  message: string;
  onRemove: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ id, type, message, onRemove }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onRemove());
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: COLORS.success,
          icon: 'check-circle' as const,
        };
      case 'error':
        return {
          backgroundColor: COLORS.error,
          icon: 'alert-circle' as const,
        };
      case 'warning':
        return {
          backgroundColor: COLORS.warning,
          icon: 'alert' as const,
        };
      case 'info':
        return {
          backgroundColor: COLORS.info,
          icon: 'information' as const,
        };
      default:
        return {
          backgroundColor: COLORS.primary,
          icon: 'information' as const,
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.toastItem,
        {
          backgroundColor: config.backgroundColor,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <MaterialCommunityIcons name={config.icon} size={24} color={COLORS.surface} />
      <Text style={styles.toastMessage}>{message}</Text>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <MaterialCommunityIcons name="close" size={20} color={COLORS.surface} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: SPACING.md,
  },
  toastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    minWidth: 300,
    maxWidth: 500,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        } as any)
      : {
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }),
  },
  toastMessage: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.surface,
    marginLeft: SPACING.md,
    fontWeight: '500',
  },
  closeButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
});
