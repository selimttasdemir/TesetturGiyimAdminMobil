import { Platform, Dimensions } from 'react-native';

// Platform tespiti
export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isMobile = isIOS || isAndroid;

// Ekran boyutu tespiti
const { width, height } = Dimensions.get('window');

export const screenWidth = width;
export const screenHeight = height;

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

// Cihaz tipi tespiti
export const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
export const isDesktop = width >= BREAKPOINTS.desktop;
export const isMobileSize = width < BREAKPOINTS.tablet;

// Web'de ekran boyutu kontrolü
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobile) return 'mobile';
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
};

// Responsive değer döndürür
export const responsive = <T,>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}): T => {
  const deviceType = getDeviceType();
  
  if (deviceType === 'desktop' && values.desktop !== undefined) {
    return values.desktop;
  }
  if (deviceType === 'tablet' && values.tablet !== undefined) {
    return values.tablet;
  }
  if (deviceType === 'mobile' && values.mobile !== undefined) {
    return values.mobile;
  }
  
  return values.default;
};

// Responsive font size
export const responsiveFontSize = (size: number): number => {
  if (isDesktop) return size * 1.1;
  if (isTablet) return size * 1.05;
  return size;
};

// Responsive spacing
export const responsiveSpacing = (spacing: number): number => {
  if (isDesktop) return spacing * 1.5;
  if (isTablet) return spacing * 1.25;
  return spacing;
};

// Grid columns için responsive değer
export const getGridColumns = (): number => {
  return responsive({
    mobile: 1,
    tablet: 2,
    desktop: 3,
    default: 1,
  });
};

// Sidebar genişliği
export const getSidebarWidth = (): number => {
  if (!isWeb || isMobileSize) return 0;
  if (isTablet) return 200;
  return 250;
};

// Platform özel stil
export const platformStyle = <T,>(config: {
  web?: T;
  ios?: T;
  android?: T;
  native?: T;
  default?: T;
}): T | undefined => {
  if (isWeb && config.web !== undefined) return config.web;
  if (isIOS && config.ios !== undefined) return config.ios;
  if (isAndroid && config.android !== undefined) return config.android;
  if (isMobile && config.native !== undefined) return config.native;
  return config.default;
};

// Touch/Hover kontrolü
export const supportsHover = isWeb && !isMobileSize;

// Orientation
export const isPortrait = height > width;
export const isLandscape = width > height;

// Safe area insets (web için)
export const getSafeAreaInsets = () => {
  if (isWeb) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  // Mobile'da SafeAreaView kullanılmalı
  return null;
};
