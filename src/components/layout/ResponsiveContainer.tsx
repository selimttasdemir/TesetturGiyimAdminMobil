import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SPACING } from '../../constants';
import { responsive } from '../../utils/platform';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  noPadding?: boolean;
  refreshControl?: React.ReactElement;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  scrollable = true,
  style,
  contentStyle,
  noPadding = false,
  refreshControl,
}) => {
  const containerStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  const padding = noPadding ? 0 : responsive({
    mobile: SPACING.md,
    tablet: SPACING.lg,
    desktop: SPACING.xl,
    default: SPACING.md,
  });

  const innerStyle: ViewStyle = {
    padding,
    ...contentStyle,
  };

  if (scrollable) {
    return (
      <ScrollView
        style={containerStyle}
        contentContainerStyle={innerStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[containerStyle, innerStyle]}>
      {children}
    </View>
  );
};

// Grid Layout Component
interface GridProps {
  children: React.ReactNode;
  columns?: number | { mobile?: number; tablet?: number; desktop?: number };
  gap?: number;
  style?: ViewStyle;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns,
  gap = SPACING.md,
  style,
}) => {
  const cols = typeof columns === 'number' 
    ? columns 
    : responsive({
        mobile: columns?.mobile ?? 1,
        tablet: columns?.tablet ?? 2,
        desktop: columns?.desktop ?? 3,
        default: 1,
      });

  return (
    <View style={[styles.grid, { gap }, style]}>
      {React.Children.map(children, (child) => (
        <View style={[styles.gridItem, { width: `${100 / cols}%` }]}>
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});
