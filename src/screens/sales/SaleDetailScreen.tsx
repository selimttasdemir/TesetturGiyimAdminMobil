import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSaleStore } from '../../store/saleStore';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

export const SaleDetailScreen = ({ route, navigation }: any) => {
  const { saleId } = route.params;
  const { selectedSale, fetchSale, isLoading } = useSaleStore();
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadSale();
  }, [saleId]);

  const loadSale = async () => {
    try {
      await fetchSale(saleId.toString());
    } catch (error) {
      Alert.alert('Hata', 'Satış detayları yüklenemedi');
      navigation.goBack();
    }
  };

  const handleCancelSale = () => {
    Alert.alert(
      'Satışı İptal Et',
      'Bu satışı iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'İptal Et',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              // TODO: Cancel sale API call
              Alert.alert('Başarılı', 'Satış iptal edildi');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Hata', 'Satış iptal edilemedi');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'nakit':
        return 'Nakit';
      case 'kart':
        return 'Kart';
      case 'veresiye':
        return 'Veresiye';
      default:
        return method;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'nakit':
        return 'cash';
      case 'kart':
        return 'credit-card';
      case 'veresiye':
        return 'calendar-clock';
      default:
        return 'help-circle';
    }
  };

  const getPaymentColor = (method: string) => {
    switch (method) {
      case 'nakit':
        return COLORS.success;
      case 'kart':
        return COLORS.primary;
      case 'veresiye':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  if (isLoading || !selectedSale) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.saleNumber}>{selectedSale.saleNumber || `#${selectedSale.id}`}</Text>
            <Text style={styles.date}>{formatDate(selectedSale.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getPaymentColor(selectedSale.paymentMethod)}20` }]}>
            <MaterialCommunityIcons
              name={getPaymentIcon(selectedSale.paymentMethod)}
              size={20}
              color={getPaymentColor(selectedSale.paymentMethod)}
            />
            <Text style={[styles.statusText, { color: getPaymentColor(selectedSale.paymentMethod) }]}>
              {getPaymentMethodText(selectedSale.paymentMethod)}
            </Text>
          </View>
        </View>

        {selectedSale.status === 'cancelled' && (
          <View style={styles.cancelledBadge}>
            <MaterialCommunityIcons name="close-circle" size={16} color={COLORS.error} />
            <Text style={styles.cancelledText}>İptal Edildi</Text>
          </View>
        )}
      </Card>

      {/* Customer Info */}
      {selectedSale.customer && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>
          <View style={styles.customerInfo}>
            <MaterialCommunityIcons name="account" size={24} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>{selectedSale.customer.name}</Text>
              {selectedSale.customer.phone && (
                <Text style={styles.customerDetail}>{selectedSale.customer.phone}</Text>
              )}
              {selectedSale.customer.balance > 0 && (
                <Text style={[styles.customerDetail, { color: COLORS.error }]}>
                  Toplam Borç: ₺{selectedSale.customer.balance.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        </Card>
      )}

      {/* Items */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Satılan Ürünler ({selectedSale.items?.length || 0} Ürün)</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Ürün Adı</Text>
          <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Barkod</Text>
          <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Adet</Text>
          <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Birim</Text>
          <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Toplam</Text>
        </View>
        {selectedSale.items && selectedSale.items.length > 0 ? (
          selectedSale.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={[styles.itemText, { flex: 2 }]} numberOfLines={2}>
                {item.product?.name || 'Ürün Adı Yok'}
              </Text>
              <Text style={[styles.itemText, { flex: 1.5, fontSize: 12, color: COLORS.textSecondary }]} numberOfLines={1}>
                {item.product?.barcode || item.product?.sku || '-'}
              </Text>
              <Text style={[styles.itemText, { flex: 1, textAlign: 'center' }]}>
                {item.quantity}
              </Text>
              <Text style={[styles.itemText, { flex: 1, textAlign: 'right' }]}>
                ₺{(item.unitPrice || item.unit_price || 0).toFixed(2)}
              </Text>
              <Text style={[styles.itemText, { flex: 1, textAlign: 'right', fontWeight: '600' }]}>
                ₺{(item.subtotal || 0).toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Ürün bilgisi bulunamadı</Text>
        )}
      </Card>      {/* Payment Summary */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Ödeme Özeti</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ara Toplam:</Text>
          <Text style={styles.summaryValue}>
            ₺{((selectedSale.totalAmount || selectedSale.total_amount || 0) as number).toFixed(2)}
          </Text>
        </View>

        {(selectedSale.discount || 0) > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>İndirim:</Text>
            <Text style={[styles.summaryValue, { color: COLORS.error }]}>
              -₺{((selectedSale.discount || 0) as number).toFixed(2)}
            </Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>KDV:</Text>
          <Text style={styles.summaryValue}>
            ₺{((selectedSale.tax || 0) as number).toFixed(2)}
          </Text>
        </View>

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Toplam:</Text>
          <Text style={styles.totalValue}>
            ₺{((selectedSale.finalAmount || selectedSale.final_amount || 0) as number).toFixed(2)}
          </Text>
        </View>

        {selectedSale.paymentMethod === 'veresiye' && (
          <>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ödenen:</Text>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                ₺{((selectedSale.paidAmount || selectedSale.paid_amount || 0) as number).toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Kalan Borç:</Text>
              <Text style={[styles.summaryValue, { color: COLORS.error, fontWeight: 'bold' }]}>
                ₺{((selectedSale.remainingAmount || selectedSale.remaining_amount || 0) as number).toFixed(2)}
              </Text>
            </View>
          </>
        )}
      </Card>

      {/* Notes */}
      {selectedSale.notes && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Notlar</Text>
          <Text style={styles.notesText}>{selectedSale.notes}</Text>
        </Card>
      )}

      {/* Actions */}
      {selectedSale.status !== 'cancelled' && (
        <View style={styles.actions}>
          <Button
            title="Yazdır"
            onPress={() => Alert.alert('Bilgi', 'Yazdırma özelliği yakında eklenecek')}
            icon="printer"
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="İptal Et"
            onPress={handleCancelSale}
            icon="close-circle"
            variant="outline"
            style={styles.actionButton}
            loading={cancelling}
          />
        </View>
      )}

      <View style={{ height: SPACING.xl }} />
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
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  headerCard: {
    margin: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  saleNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  date: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: `${COLORS.error}20`,
    borderRadius: BORDER_RADIUS.sm,
    gap: 6,
  },
  cancelledText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.error,
  },
  section: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  customerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  customerDetail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
  },
  totalLabel: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  notesText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
});
