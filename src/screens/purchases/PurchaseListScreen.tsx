import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePurchaseStore } from '../../store/purchaseStore';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { PurchaseOrder } from '../../types';

export const PurchaseListScreen = ({ navigation }: any) => {
  const { purchases, fetchPurchases, isLoading } = usePurchaseStore();
  const { token } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        loadPurchases();
      }
    }, [token])
  );

  const loadPurchases = async () => {
    await fetchPurchases();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPurchases();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'completed':
        return COLORS.success;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal';
      default:
        return status;
    }
  };

  const renderPurchaseItem = ({ item }: { item: PurchaseOrder }) => (
    <TouchableOpacity
      style={styles.purchaseCard}
      onPress={() => navigation.navigate('PurchaseDetail', { id: item.id })}
    >
      <View style={styles.purchaseHeader}>
        <View style={styles.purchaseInfo}>
          <Text style={styles.purchaseId}>Sipariş #{item.id}</Text>
          <Text style={styles.supplierName}>{item.supplier?.name || 'Tedarikçi'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.purchaseDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>
            {new Date(item.createdAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="package-variant" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.items?.length || 0} Ürün</Text>
        </View>
      </View>

      <View style={styles.purchaseFooter}>
        <Text style={styles.totalLabel}>Toplam Tutar:</Text>
        <Text style={styles.totalAmount}>
          ₺{(item.total || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Yeni Satın Alma"
          onPress={() => navigation.navigate('AddPurchase')}
          icon="plus"
        />
      </View>

      <FlatList
        data={purchases}
        renderItem={renderPurchaseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <Card>
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="package-variant-closed" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Henüz satın alma kaydı yok</Text>
              <Text style={styles.emptySubtext}>Yeni satın alma oluşturmak için yukarıdaki butona tıklayın</Text>
            </View>
          </Card>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  list: {
    padding: SPACING.md,
  },
  purchaseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  purchaseInfo: {
    flex: 1,
  },
  purchaseId: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  supplierName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  purchaseDetails: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  purchaseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  totalAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
