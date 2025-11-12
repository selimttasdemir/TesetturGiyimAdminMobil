import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { useResponsiveGrid } from '../../hooks/useResponsiveGrid';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
}

export const CustomersScreen = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthStore();
  
  // Responsive grid - 2 sütun için (min 350px kart genişliği, 220px yükseklik)
  const gridConfig = useResponsiveGrid(350, 150);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      // Backend'den müşterileri çek
      const response = await fetch('http://localhost:8000/api/customers/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.items || data);
      }
    } catch (error) {
      console.error('Müşteriler yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <View style={[styles.gridItem, { width: gridConfig.itemWidth }]}>
      <TouchableOpacity style={[styles.customerCard, { minHeight: gridConfig.cardHeight }]}>
        <View style={styles.customerHeader}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{item.name}</Text>
            <Text style={styles.customerEmail}>{item.email}</Text>
            {item.phone && (
              <Text style={styles.customerPhone}>{item.phone}</Text>
            )}
          </View>
        </View>

        <View style={styles.customerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.totalOrders || 0}</Text>
            <Text style={styles.statLabel}>Sipariş</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              ₺{(item.totalSpent || 0).toLocaleString('tr-TR')}
            </Text>
            <Text style={styles.statLabel}>Toplam Harcama</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Input
          placeholder="Müşteri ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="magnify"
        />
      </View>

      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.id.toString()}
        key={`grid-${gridConfig.numColumns}`}
        numColumns={gridConfig.numColumns}
        columnWrapperStyle={gridConfig.numColumns > 1 ? [styles.gridRow, { gap: gridConfig.itemSpacing }] : undefined}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <Card>
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-group" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Müşteri bulunamadı' : 'Henüz müşteri yok'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery 
                  ? 'Farklı bir arama terimi deneyin'
                  : 'Müşteriler web sitesinden kayıt olduklarında burada görünecek'}
              </Text>
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
  gridRow: {
    justifyContent: 'flex-start',
    marginBottom: 0,
  },
  gridItem: {
    marginBottom: 16,
  },
  customerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  customerHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  customerStats: {
    flexDirection: 'row',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
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
    paddingHorizontal: SPACING.lg,
  },
});
