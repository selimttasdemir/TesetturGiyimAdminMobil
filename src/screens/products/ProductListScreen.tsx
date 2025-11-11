import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useProductStore } from '../../store/productStore';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { Product } from '../../types';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isWeb = Platform.OS === 'web';

export const ProductListScreen = ({ navigation }: any) => {
  const { products, isLoading, fetchProducts, deleteProduct, updateProduct } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Edit form states
  const [editForm, setEditForm] = useState({
    name: '',
    barcode: '',
    purchasePrice: '',
    salePrice: '',
    stock: '',
    minStock: '',
    description: '',
  });

  // Sayfa her açıldığında listeyi yenile
  useFocusEffect(
    React.useCallback(() => {
      loadProducts();
    }, [])
  );

  const loadProducts = async () => {
    await fetchProducts();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    await fetchProducts({ search: query });
  };

  const handleScanBarcode = () => {
    navigation.navigate('BarcodeScanner', {
      onBarcodeScanned: (barcode: string) => {
        setSearchQuery(barcode);
        fetchProducts({ search: barcode });
      },
    });
  };

  const getStockColor = (stock: number, minStock: number) => {
    if (stock === 0) return COLORS.error;
    if (stock <= minStock) return COLORS.warning;
    return COLORS.success;
  };

  const getTotalStock = (product: Product) => {
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes.reduce((total, size) => total + size.stock, 0);
    }
    return product.stock;
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setDetailModalVisible(true);
  };

  const handleEdit = () => {
    if (!selectedProduct) return;
    
    setEditForm({
      name: selectedProduct.name,
      barcode: selectedProduct.barcode,
      purchasePrice: selectedProduct.purchasePrice?.toString() || '',
      salePrice: selectedProduct.salePrice?.toString() || '',
      stock: selectedProduct.stock?.toString() || '',
      minStock: selectedProduct.minStock?.toString() || '',
      description: selectedProduct.description || '',
    });
    
    setDetailModalVisible(false);
    setEditModalVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    const confirmed = window.confirm(
      `${selectedProduct.name} ürünü silmek istediğinizden emin misiniz?`
    );
    
    if (!confirmed) return;
    
    try {
      console.log('Deleting product:', selectedProduct.id);
      await deleteProduct(String(selectedProduct.id));
      console.log('Product deleted successfully');
      setDetailModalVisible(false);
      setSelectedProduct(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      console.error('Error response:', error.response?.data);
      alert('Ürün silinemedi: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedProduct) return;
    
    try {
      await updateProduct(String(selectedProduct.id), {
        name: editForm.name,
        barcode: editForm.barcode,
        purchasePrice: parseFloat(editForm.purchasePrice) || 0,
        salePrice: parseFloat(editForm.salePrice) || 0,
        stock: parseInt(editForm.stock) || 0,
        minStock: parseInt(editForm.minStock) || 0,
        description: editForm.description,
      });
      
      setEditModalVisible(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const closeModals = () => {
    setDetailModalVisible(false);
    setEditModalVisible(false);
    setSelectedProduct(null);
  };

  // Ürün etiketlerini belirle
  const getProductBadges = (product: Product) => {
    const badges = [];
    
    // Yeni ürün (son 30 gün)
    if (product.createdAt) {
      const createdDate = new Date(product.createdAt);
      const daysDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 30) {
        badges.push({ label: 'YENİ', color: COLORS.success });
      }
    }
    
    // İndirim (satış fiyatı alış fiyatından %40'tan fazla yüksekse normal, değilse indirimli)
    if (product.purchasePrice && product.salePrice) {
      const markup = ((product.salePrice - product.purchasePrice) / product.purchasePrice) * 100;
      if (markup < 30) {
        badges.push({ label: 'İNDİRİM', color: COLORS.error });
      }
    }
    
    // Düşük stok
    if (product.stock <= product.minStock && product.stock > 0) {
      badges.push({ label: 'AZ STOK', color: COLORS.warning });
    }
    
    // Stokta yok
    if (product.stock === 0) {
      badges.push({ label: 'STOKTA YOK', color: COLORS.error });
    }
    
    return badges;
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const totalStock = getTotalStock(item);
    const badges = getProductBadges(item);
    
    return (
      <TouchableOpacity
        onPress={() => handleProductPress(item)}
        activeOpacity={0.7}
      >
        <Card>
          <View style={styles.productCard}>
            <View style={styles.productInfo}>
              {/* Etiketler */}
              {badges.length > 0 && (
                <View style={styles.badgesContainer}>
                  {badges.map((badge, index) => (
                    <View 
                      key={index} 
                      style={[styles.badge, { backgroundColor: badge.color }]}
                    >
                      <Text style={styles.badgeText}>{badge.label}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <Text style={[styles.productName, isSmallDevice && styles.productNameSmall]}>
                {item.name}
              </Text>
              
              <View style={styles.productMeta}>
                {item.category && (
                  <View style={styles.categoryBadge}>
                    <MaterialCommunityIcons 
                      name="tag" 
                      size={14} 
                      color={COLORS.primary} 
                    />
                    <Text style={styles.categoryText}>
                      {typeof item.category === 'string' ? item.category : item.category.name}
                    </Text>
                  </View>
                )}
                
                {item.brand && (
                  <Text style={styles.brandText}>• {item.brand}</Text>
                )}
              </View>

              {/* Beden ve renk bilgisi */}
              {item.sizes && item.sizes.length > 0 && (
                <View style={styles.sizesContainer}>
                  <Text style={styles.sizeLabel}>Bedenler: </Text>
                  <Text style={styles.sizeList}>
                    {item.sizes.map(s => s.size).join(', ')}
                  </Text>
                </View>
              )}

              {item.colors && item.colors.length > 0 && (
                <View style={styles.colorsContainer}>
                  {item.colors.slice(0, 3).map((color, index) => (
                    <View
                      key={index}
                      style={[
                        styles.colorDot,
                        { backgroundColor: color.hexCode || COLORS.textSecondary }
                      ]}
                    />
                  ))}
                  {item.colors.length > 3 && (
                    <Text style={styles.moreColors}>+{item.colors.length - 3}</Text>
                  )}
                </View>
              )}
              
              <Text style={[styles.productPrice, isSmallDevice && styles.productPriceSmall]}>
                ₺{item.salePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            
            <View style={styles.productRight}>
              <View style={[
                styles.stockBadge,
                { backgroundColor: `${getStockColor(totalStock, item.minStock)}20` }
              ]}>
                <MaterialCommunityIcons
                  name="hanger"
                  size={isSmallDevice ? 14 : 16}
                  color={getStockColor(totalStock, item.minStock)}
                />
                <Text style={[
                  styles.stockText,
                  isSmallDevice && styles.stockTextSmall,
                  { color: getStockColor(totalStock, item.minStock) }
                ]}>
                  {totalStock}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <Input
          placeholder="Ürün ara..."
          value={searchQuery}
          onChangeText={handleSearch}
          leftIcon="magnify"
          containerStyle={styles.searchInput}
        />
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScanBarcode}
        >
          <MaterialCommunityIcons name="barcode-scan" size={24} color={COLORS.surface} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <MaterialCommunityIcons name="plus" size={24} color={COLORS.surface} />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="hanger" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Ürün bulunamadı</Text>
            <Button
              title="İlk Ürünü Ekle"
              onPress={() => navigation.navigate('AddProduct')}
            />
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        onClose={closeModals}
        title="Ürün Detayı"
      >
        {selectedProduct && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalActions}>
              <Button
                title="Düzenle"
                onPress={handleEdit}
                variant="outline"
              />
              <Button
                title="Sil"
                onPress={handleDelete}
                variant="outline"
                style={{ borderColor: COLORS.error }}
                textStyle={{ color: COLORS.error }}
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ürün Adı:</Text>
                  <Text style={styles.detailValue}>{selectedProduct.name}</Text>
                </View>
              </View>
              
              <View style={styles.formColumn}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Barkod:</Text>
                  <Text style={styles.detailValue}>{selectedProduct.barcode}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Alış Fiyatı:</Text>
                  <Text style={styles.detailValue}>
                    ₺{selectedProduct.purchasePrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
              
              <View style={styles.formColumn}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Satış Fiyatı:</Text>
                  <Text style={[styles.detailValue, styles.priceHighlight]}>
                    ₺{selectedProduct.salePrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Stok:</Text>
                  <Text style={[
                    styles.detailValue,
                    { color: getStockColor(selectedProduct.stock, selectedProduct.minStock) }
                  ]}>
                    {selectedProduct.stock} adet
                  </Text>
                </View>
              </View>
              
              <View style={styles.formColumn}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Minimum Stok:</Text>
                  <Text style={styles.detailValue}>{selectedProduct.minStock} adet</Text>
                </View>
              </View>
            </View>
            
            {selectedProduct.description && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Açıklama:</Text>
                <Text style={styles.detailValue}>{selectedProduct.description}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        onClose={closeModals}
        title="Ürün Düzenle"
      >
        <ScrollView style={styles.modalContent}>
          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <Input
                label="Ürün Adı *"
                value={editForm.name}
                onChangeText={(value) => setEditForm({ ...editForm, name: value })}
                placeholder="Ürün adı"
              />
            </View>
            
            <View style={styles.formColumn}>
              <Input
                label="Barkod *"
                value={editForm.barcode}
                onChangeText={(value) => setEditForm({ ...editForm, barcode: value })}
                placeholder="Barkod"
              />
            </View>
          </View>
          
          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <Input
                label="Alış Fiyatı *"
                value={editForm.purchasePrice}
                onChangeText={(value) => setEditForm({ ...editForm, purchasePrice: value })}
                placeholder="0.00"
                keyboardType="numeric"
                leftIcon="currency-try"
              />
            </View>
            
            <View style={styles.formColumn}>
              <Input
                label="Satış Fiyatı *"
                value={editForm.salePrice}
                onChangeText={(value) => setEditForm({ ...editForm, salePrice: value })}
                placeholder="0.00"
                keyboardType="numeric"
                leftIcon="currency-try"
              />
            </View>
          </View>
          
          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <Input
                label="Stok Miktarı *"
                value={editForm.stock}
                onChangeText={(value) => setEditForm({ ...editForm, stock: value })}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formColumn}>
              <Input
                label="Minimum Stok *"
                value={editForm.minStock}
                onChangeText={(value) => setEditForm({ ...editForm, minStock: value })}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <Input
            label="Açıklama"
            value={editForm.description}
            onChangeText={(value) => setEditForm({ ...editForm, description: value })}
            placeholder="Ürün açıklaması"
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.modalActions}>
            <Button
              title="İptal"
              onPress={closeModals}
              variant="outline"
            />
            <Button
              title="Kaydet"
              onPress={handleSaveEdit}
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
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 2px 4px rgba(0,0,0,0.08)' } as any)
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }),
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.xs,
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
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productInfo: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  productName: {
    fontSize: isSmallDevice ? FONT_SIZES.md : FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  productNameSmall: {
    fontSize: FONT_SIZES.md,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: 6,
  },
  categoryText: {
    fontSize: isSmallDevice ? 11 : FONT_SIZES.xs,
    color: COLORS.primary,
    marginLeft: 3,
    fontWeight: '500',
  },
  brandText: {
    fontSize: isSmallDevice ? 11 : FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  sizesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sizeLabel: {
    fontSize: isSmallDevice ? 11 : FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  sizeList: {
    fontSize: isSmallDevice ? 11 : FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: '500',
  },
  colorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moreColors: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  productPrice: {
    fontSize: isSmallDevice ? FONT_SIZES.lg : FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  productPriceSmall: {
    fontSize: FONT_SIZES.lg,
  },
  productRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 50,
    justifyContent: 'center',
  },
  stockText: {
    fontSize: isSmallDevice ? 12 : FONT_SIZES.sm,
    fontWeight: '600',
  },
  stockTextSmall: {
    fontSize: 11,
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
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalContent: {
    padding: SPACING.sm,
  },
  formRow: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: SPACING.md,
    marginBottom: 0,
  },
  formColumn: {
    flex: 1,
  },
  detailRow: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  priceHighlight: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
});
