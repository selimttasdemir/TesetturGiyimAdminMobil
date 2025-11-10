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
import { useProductStore } from '../../store/productStore';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { Product } from '../../types';

export const InventoryScreen = () => {
  const { products, fetchProducts, isLoading } = useProductStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    await fetchProducts();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const getStockStatus = (product: Product) => {
    if (product.stock <= 0) {
      return { status: 'out', color: COLORS.error, text: 'Stokta Yok', icon: 'close-circle' };
    } else if (product.stock <= (product.minStock || 5)) {
      return { status: 'low', color: COLORS.warning, text: 'Düşük Stok', icon: 'alert' };
    } else {
      return { status: 'ok', color: COLORS.success, text: 'Stokta', icon: 'check-circle' };
    }
  };

  const filteredProducts = products
    ?.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode.includes(searchQuery);
      
      if (filter === 'all') return matchesSearch;
      
      const stockStatus = getStockStatus(product);
      if (filter === 'low') return matchesSearch && stockStatus.status === 'low';
      if (filter === 'out') return matchesSearch && stockStatus.status === 'out';
      
      return matchesSearch;
    }) || [];

  const lowStockCount = products?.filter(p => {
    const status = getStockStatus(p);
    return status.status === 'low';
  }).length || 0;

  const outOfStockCount = products?.filter(p => {
    const status = getStockStatus(p);
    return status.status === 'out';
  }).length || 0;

  const renderProductItem = ({ item }: { item: Product }) => {
    const stockStatus = getStockStatus(item);

    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productBarcode}>{item.barcode}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${stockStatus.color}20` }]}>
            <MaterialCommunityIcons 
              name={stockStatus.icon as any} 
              size={16} 
              color={stockStatus.color} 
            />
            <Text style={[styles.statusText, { color: stockStatus.color }]}>
              {stockStatus.text}
            </Text>
          </View>
        </View>

        <View style={styles.stockInfo}>
          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Mevcut Stok</Text>
            <Text style={[styles.stockValue, { color: stockStatus.color }]}>
              {item.stock} {item.unit || 'adet'}
            </Text>
          </View>
          
          {item.minStock && (
            <View style={styles.stockItem}>
              <Text style={styles.stockLabel}>Min. Stok</Text>
              <Text style={styles.stockValue}>
                {item.minStock} {item.unit || 'adet'}
              </Text>
            </View>
          )}

          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Fiyat</Text>
            <Text style={styles.stockValue}>
              ₺{item.salePrice.toLocaleString('tr-TR')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: `${COLORS.success}15` }]}>
          <MaterialCommunityIcons name="package-variant" size={24} color={COLORS.success} />
          <Text style={styles.statValue}>{products?.length || 0}</Text>
          <Text style={styles.statLabel}>Toplam Ürün</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: `${COLORS.warning}15` }]}
          onPress={() => setFilter(filter === 'low' ? 'all' : 'low')}
        >
          <MaterialCommunityIcons name="alert" size={24} color={COLORS.warning} />
          <Text style={styles.statValue}>{lowStockCount}</Text>
          <Text style={styles.statLabel}>Düşük Stok</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: `${COLORS.error}15` }]}
          onPress={() => setFilter(filter === 'out' ? 'all' : 'out')}
        >
          <MaterialCommunityIcons name="close-circle" size={24} color={COLORS.error} />
          <Text style={styles.statValue}>{outOfStockCount}</Text>
          <Text style={styles.statLabel}>Tükendi</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.header}>
        <Input
          placeholder="Ürün ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="magnify"
        />
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <Card>
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="package-variant" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Ürün bulunamadı' : 'Stokta ürün yok'}
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
  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  list: {
    padding: SPACING.md,
  },
  productCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  productBarcode: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  stockInfo: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stockItem: {
    flex: 1,
  },
  stockLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  stockValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
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
});
