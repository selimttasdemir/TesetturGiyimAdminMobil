import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Card } from '../../components/common/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { useSupplierStore } from '../../store/supplierStore';
import { Supplier } from '../../types';

type SupplierStackParamList = {
  SupplierList: undefined;
  SupplierDetail: { supplierId: number };
  AddSupplier: undefined;
};

type SupplierDetailScreenRouteProp = RouteProp<SupplierStackParamList, 'SupplierDetail'>;
type SupplierDetailScreenNavigationProp = StackNavigationProp<SupplierStackParamList>;

export const SupplierDetailScreen = () => {
  const route = useRoute<SupplierDetailScreenRouteProp>();
  const navigation = useNavigation<SupplierDetailScreenNavigationProp>();
  const { supplierId } = route.params;
  
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { suppliers, deleteSupplier, fetchSuppliers } = useSupplierStore();

  useEffect(() => {
    loadSupplierDetail();
  }, [supplierId]);

  const loadSupplierDetail = async () => {
    setIsLoading(true);
    try {
      // Store'dan bul
      const found = suppliers.find(s => s.id === String(supplierId));
      if (found) {
        setSupplier(found);
      }
    } catch (error) {
      console.error('Tedarikçi yüklenirken hata:', error);
      Alert.alert('Hata', 'Tedarikçi bilgileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditSupplier' as any, { supplierId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Tedarikçiyi Sil',
      'Bu tedarikçiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteSupplier(String(supplierId));
            if (success) {
              await fetchSuppliers();
              Alert.alert('Başarılı', 'Tedarikçi silindi', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
              ]);
            } else {
              Alert.alert('Hata', 'Tedarikçi silinemedi');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!supplier) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>Tedarikçi bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="domain" size={48} color={COLORS.primary} />
          <Text style={styles.supplierName}>{supplier.name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İletişim Bilgileri</Text>
          
          {supplier.contactPerson && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account" size={24} color={COLORS.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Yetkili Kişi</Text>
                <Text style={styles.infoValue}>{supplier.contactPerson}</Text>
              </View>
            </View>
          )}

          {supplier.email && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="email" size={24} color={COLORS.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>E-posta</Text>
                <Text style={styles.infoValue}>{supplier.email}</Text>
              </View>
            </View>
          )}

          {supplier.phone && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone" size={24} color={COLORS.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Telefon</Text>
                <Text style={styles.infoValue}>{supplier.phone}</Text>
              </View>
            </View>
          )}

          {supplier.address && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={24} color={COLORS.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Adres</Text>
                <Text style={styles.infoValue}>{supplier.address}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Şirket Bilgileri</Text>
          
          {supplier.taxNumber && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="file-document" size={24} color={COLORS.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Vergi Numarası</Text>
                <Text style={styles.infoValue}>{supplier.taxNumber}</Text>
              </View>
            </View>
          )}
        </View>
      </Card>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEdit}
        >
          <MaterialCommunityIcons name="pencil" size={24} color={COLORS.surface} />
          <Text style={styles.editButtonText}>Düzenle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <MaterialCommunityIcons name="delete" size={24} color={COLORS.surface} />
          <Text style={styles.deleteButtonText}>Sil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.error,
    marginTop: SPACING.md,
  },
  card: {
    margin: SPACING.md,
  },
  header: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  supplierName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  section: {
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs / 2,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  notesText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  actions: {
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  editButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.surface,
    marginLeft: SPACING.sm,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  deleteButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.surface,
    marginLeft: SPACING.sm,
  },
});
