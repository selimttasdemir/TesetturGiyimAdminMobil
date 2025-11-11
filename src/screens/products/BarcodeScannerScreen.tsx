import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useToastStore } from '../../store/toastStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

interface BarcodeScannerScreenProps {
  navigation: any;
  route: any;
}

export const BarcodeScannerScreen: React.FC<BarcodeScannerScreenProps> = ({
  navigation,
  route,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const { showToast } = useToastStore();

  const { onBarcodeScanned } = route.params || {};

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);

    // Barkod başarıyla okundu
    showToast('success', `Barkod: ${data}`);
    
    if (onBarcodeScanned) {
      onBarcodeScanned(data);
    }
    navigation.goBack();
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Kamera izni kontrol ediliyor...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons
          name="camera-off"
          size={64}
          color={COLORS.textSecondary}
        />
        <Text style={styles.message}>Kamera erişimi reddedildi</Text>
        <Text style={styles.subMessage}>
          Barkod taramak için ayarlardan kamera iznini açmanız gerekiyor
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            'qr',
            'ean13',
            'ean8',
            'code128',
            'code39',
            'code93',
            'codabar',
            'upc_a',
            'upc_e',
          ],
        }}
        enableTorch={flashEnabled}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="close" size={28} color={COLORS.surface} />
            </TouchableOpacity>

            <Text style={styles.title}>Barkod Tara</Text>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleFlash}
            >
              <MaterialCommunityIcons
                name={flashEnabled ? 'flash' : 'flash-off'}
                size={28}
                color={COLORS.surface}
              />
            </TouchableOpacity>
          </View>

          {/* Scanner Frame */}
          <View style={styles.scannerContainer}>
            <View style={styles.scannerFrame}>
              {/* Corner borders */}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <MaterialCommunityIcons
              name="barcode-scan"
              size={48}
              color={COLORS.surface}
            />
            <Text style={styles.instructions}>
              Barkodu kare içine yerleştirin
            </Text>
            <Text style={styles.subInstructions}>
              Otomatik olarak taranacaktır
            </Text>
          </View>

          {/* Bottom Actions */}
          {scanned && (
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={styles.scanAgainButton}
                onPress={() => setScanned(false)}
              >
                <MaterialCommunityIcons
                  name="refresh"
                  size={24}
                  color={COLORS.surface}
                />
                <Text style={styles.scanAgainText}>Tekrar Tara</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
};

const { width, height } = Dimensions.get('window');
const scannerSize = Math.min(width, height) * 0.7;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.surface,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scannerFrame: {
    width: scannerSize,
    height: scannerSize * 0.6,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.primary,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  instructions: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.surface,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  subInstructions: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.surface,
    marginTop: SPACING.xs,
    opacity: 0.8,
    textAlign: 'center',
  },
  bottomBar: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  scanAgainText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.surface,
  },
  message: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  subMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xl,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.surface,
  },
});
