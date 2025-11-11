import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { usePurchaseStore } from '../../store/purchaseStore';
import { useSupplierStore } from '../../store/supplierStore';
import { useToastStore } from '../../store/toastStore';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

export const AddPurchaseScreen = ({ navigation }: any) => {
  const { createPurchase, isLoading } = usePurchaseStore();
  const { suppliers } = useSupplierStore();
  const { showToast } = useToastStore();

  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!supplierId) {
      showToast('error', 'Lütfen tedarikçi seçin');
      return;
    }

    const purchaseData = {
      supplierId: parseInt(supplierId),
      notes: notes || undefined,
      items: [], // Basit bir başlangıç
    };

    const success = await createPurchase(purchaseData as any);
    if (success) {
      showToast('success', 'Satın alma kaydı oluşturuldu');
      setTimeout(() => navigation.goBack(), 1500);
    } else {
      showToast('error', 'Satın alma kaydı oluşturulamadı');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card>
          <Text style={styles.sectionTitle}>Satın Alma Bilgileri</Text>
          
          <Text style={styles.label}>Tedarikçi *</Text>
          <Text style={styles.infoText}>
            Bu özellik henüz geliştirme aşamasında. Tedarikçiler ekranından tedarikçi ekleyin.
          </Text>

          <Input
            label="Notlar"
            value={notes}
            onChangeText={setNotes}
            placeholder="Sipariş notları..."
            multiline
            numberOfLines={4}
          />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Satın Alma Oluştur"
          onPress={handleSubmit}
          loading={isLoading}
          icon="check"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
