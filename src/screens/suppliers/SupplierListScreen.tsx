import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSupplierStore } from '../../store/supplierStore';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { Supplier } from '../../types';

export const SupplierListScreen = ({ navigation }: any) => {
  const { suppliers, isLoading, fetchSuppliers, updateSupplier, deleteSupplier } = useSupplierStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
  });

  // Sayfa her açıldığında listeyi yenile
  useFocusEffect(
    React.useCallback(() => {
      loadSuppliers();
    }, [])
  );

  const loadSuppliers = async () => {
    await fetchSuppliers();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSuppliers();
    setRefreshing(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    await fetchSuppliers({ search: query });
  };

  const openDetailModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDetailModalVisible(true);
  };

  const openEditModal = () => {
    if (selectedSupplier) {
      setEditForm({
        name: selectedSupplier.name,
        contactPerson: selectedSupplier.contactPerson || '',
        phone: selectedSupplier.phone,
        email: selectedSupplier.email || '',
        address: selectedSupplier.address || '',
        taxNumber: selectedSupplier.taxNumber || '',
      });
      setDetailModalVisible(false);
      setEditModalVisible(true);
    }
  };

  const handleUpdate = async () => {
    if (!selectedSupplier) return;

    const updateData = {
      name: editForm.name,
      contact_person: editForm.contactPerson || undefined,
      phone: editForm.phone,
      email: editForm.email || undefined,
      address: editForm.address || undefined,
      tax_number: editForm.taxNumber || undefined,
    };

    const success = await updateSupplier(selectedSupplier.id, updateData);
    if (success) {
      setEditModalVisible(false);
      setSelectedSupplier(null);
      await fetchSuppliers();
      Alert.alert('Başarılı', 'Tedarikçi güncellendi');
    } else {
      Alert.alert('Hata', 'Tedarikçi güncellenemedi');
    }
  };

  const handleDelete = async () => {
    if (!selectedSupplier || !selectedSupplier.id) {
      return;
    }

    const confirmed = window.confirm(
      `${selectedSupplier.name} tedarikçisini silmek istediğinizden emin misiniz?`
    );
    
    if (!confirmed) return;

    const success = await deleteSupplier(selectedSupplier.id);
    if (success) {
      setDetailModalVisible(false);
      setSelectedSupplier(null);
      await fetchSuppliers();
      Alert.alert('Başarılı', 'Tedarikçi silindi');
    } else {
      Alert.alert('Hata', 'Tedarikçi silinemedi');
    }
  };

  const renderSupplier = ({ item }: { item: Supplier }) => (
    <TouchableOpacity
      onPress={() => openDetailModal(item)}
      activeOpacity={0.7}
    >
      <Card>
        <View style={styles.supplierCard}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="truck" size={32} color={COLORS.primary} />
          </View>
          
          <View style={styles.supplierInfo}>
            <Text style={styles.supplierName}>{item.name}</Text>
            
            {item.contactPerson && (
              <View style={styles.supplierInfoRow}>
                <MaterialCommunityIcons name="account" size={16} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{item.contactPerson}</Text>
              </View>
            )}
            
            <View style={styles.supplierInfoRow}>
              <MaterialCommunityIcons name="phone" size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>{item.phone}</Text>
            </View>

            {item.email && (
              <View style={styles.supplierInfoRow}>
                <MaterialCommunityIcons name="email" size={16} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{item.email}</Text>
              </View>
            )}
          </View>

          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Input
          placeholder="Tedarikçi ara..."
          value={searchQuery}
          onChangeText={handleSearch}
          leftIcon="magnify"
          containerStyle={styles.searchInput}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddSupplier')}
        >
          <MaterialCommunityIcons name="plus" size={24} color={COLORS.surface} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={suppliers}
        renderItem={renderSupplier}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="truck" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Tedarikçi bulunamadı</Text>
            <Button title="İlk Tedarikçiyi Ekle" onPress={() => navigation.navigate('AddSupplier')} />
          </View>
        }
      />

      {/* Detay Modal */}
      <Modal
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedSupplier(null);
        }}
        title="Tedarikçi Detayları"
        size="medium"
      >
        {selectedSupplier && (
          <ScrollView style={{ maxHeight: 500 }}>
            <View style={styles.detailSection}>
              <View style={styles.detailHeader}>
                <MaterialCommunityIcons name="domain" size={48} color={COLORS.primary} />
                <Text style={styles.detailName}>{selectedSupplier.name}</Text>
              </View>

              <View style={styles.infoGroup}>
                <Text style={styles.infoGroupTitle}>İletişim Bilgileri</Text>
                
                {selectedSupplier.contactPerson && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="account" size={20} color={COLORS.textSecondary} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Yetkili Kişi</Text>
                      <Text style={styles.infoValue}>{selectedSupplier.contactPerson}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="phone" size={20} color={COLORS.textSecondary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Telefon</Text>
                    <Text style={styles.infoValue}>{selectedSupplier.phone}</Text>
                  </View>
                </View>

                {selectedSupplier.email && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="email" size={20} color={COLORS.textSecondary} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>E-posta</Text>
                      <Text style={styles.infoValue}>{selectedSupplier.email}</Text>
                    </View>
                  </View>
                )}

                {selectedSupplier.address && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.textSecondary} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Adres</Text>
                      <Text style={styles.infoValue}>{selectedSupplier.address}</Text>
                    </View>
                  </View>
                )}
              </View>

              {selectedSupplier.taxNumber && (
                <View style={styles.infoGroup}>
                  <Text style={styles.infoGroupTitle}>Şirket Bilgileri</Text>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="file-document" size={20} color={COLORS.textSecondary} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Vergi Numarası</Text>
                      <Text style={styles.infoValue}>{selectedSupplier.taxNumber}</Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal()}>
                  <MaterialCommunityIcons name="pencil" size={20} color={COLORS.surface} />
                  <Text style={styles.editBtnText}>Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteBtn} 
                  onPress={() => handleDelete()}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="delete" size={20} color={COLORS.surface} />
                  <Text style={styles.deleteBtnText}>Sil</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </Modal>

      {/* Düzenleme Modal */}
      <Modal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedSupplier(null);
        }}
        title="Tedarikçi Düzenle"
        size="medium"
      >
        <ScrollView style={{ maxHeight: 500 }}>
          <Input
            label="Firma Adı *"
            value={editForm.name}
            onChangeText={(text) => setEditForm({ ...editForm, name: text })}
            placeholder="ABC Tekstil Ltd. Şti."
          />

          <Input
            label="Yetkili Kişi"
            value={editForm.contactPerson}
            onChangeText={(text) => setEditForm({ ...editForm, contactPerson: text })}
            placeholder="Ahmet Yılmaz"
          />

          <Input
            label="Telefon *"
            value={editForm.phone}
            onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
            placeholder="0532 123 45 67"
            keyboardType="phone-pad"
          />

          <Input
            label="E-posta"
            value={editForm.email}
            onChangeText={(text) => setEditForm({ ...editForm, email: text })}
            placeholder="info@firma.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Adres"
            value={editForm.address}
            onChangeText={(text) => setEditForm({ ...editForm, address: text })}
            placeholder="Tam adres..."
            multiline
            numberOfLines={3}
          />

          <Input
            label="Vergi Numarası"
            value={editForm.taxNumber}
            onChangeText={(text) => setEditForm({ ...editForm, taxNumber: text })}
            placeholder="1234567890"
            keyboardType="numeric"
          />

          <View style={styles.modalFooter}>
            <Button
              title="İptal"
              onPress={() => setEditModalVisible(false)}
              variant="outline"
              style={{ flex: 1 }}
            />
            <Button
              title="Kaydet"
              onPress={handleUpdate}
              loading={isLoading}
              style={{ flex: 1 }}
              icon="check"
            />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: SPACING.md,
  },
  supplierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  supplierInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginVertical: SPACING.lg,
  },
  // Modal styles
  detailSection: {
    gap: SPACING.lg,
  },
  detailHeader: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  infoGroup: {
    gap: SPACING.sm,
  },
  infoGroupTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  editBtnText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  deleteBtnText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
});
