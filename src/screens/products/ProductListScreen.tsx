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
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useProductStore } from '../../store/productStore';
import { useToastStore } from '../../store/toastStore';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { Product } from '../../types';
import { getSidebarWidth } from '../../utils/platform';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;
const isWeb = Platform.OS === 'web';

// Responsive grid hesaplamaları
const getResponsiveConfig = () => {
  const sidebarWidth = getSidebarWidth();
  const availableWidth = screenWidth - sidebarWidth;
  
  // Sütun sayısını ekran genişliğine göre belirle
  let numColumns = 2; // Varsayılan
  let minCardWidth = 250; // Her kartın minimum genişliği
  
  if (availableWidth >= 1400) {
    numColumns = 4;
    minCardWidth = 280;
  } else if (availableWidth >= 1100) {
    numColumns = 4;
    minCardWidth = 250;
  } else if (availableWidth >= 900) {
    numColumns = 3;
    minCardWidth = 250;
  } else if (availableWidth >= 600) {
    numColumns = 2;
    minCardWidth = 250;
  } else {
    numColumns = 1;
    minCardWidth = availableWidth - 32;
  }
  
  const gridPadding = 16;
  const itemSpacing = 16;
  
  // Kart genişliğini hesapla
  const totalPadding = gridPadding * 2;
  const totalSpacing = itemSpacing * (numColumns - 1);
  const itemWidth = (availableWidth - totalPadding - totalSpacing) / numColumns;
  
  return {
    numColumns,
    gridPadding,
    itemSpacing,
    itemWidth: Math.max(itemWidth, minCardWidth),
    cardHeight:225,
  };
};

export const ProductListScreen = ({ navigation }: any) => {
  const { products, isLoading, fetchProducts, deleteProduct, updateProduct } = useProductStore();
  const { showToast } = useToastStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [gridConfig, setGridConfig] = useState(getResponsiveConfig());
  
  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
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

  // Ekran boyutu değiştiğinde grid config'i güncelle
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setGridConfig(getResponsiveConfig());
    });
    
    return () => subscription?.remove();
  }, []);

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
    
    setDetailModalVisible(false);
    navigation.navigate('EditProduct', { productId: selectedProduct.id });
  };

  const handleDelete = () => {
    if (!selectedProduct) return;
    setDetailModalVisible(false);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      await deleteProduct(String(selectedProduct.id));
      showToast('success', 'Ürün başarıyla silindi');
      setDeleteConfirmVisible(false);
      setSelectedProduct(null);
    } catch (error: any) {
      showToast('error', error.response?.data?.detail || 'Ürün silinemedi');
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

  const renderProduct = ({ item, index }: { item: Product; index: number }) => {
    const totalStock = getTotalStock(item);
    const badges = getProductBadges(item);
    
    // Fotoğrafı parse et
    let productImage = null;
    if (item.imageUrl) {
      try {
        const parsedImages = JSON.parse(item.imageUrl);
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          productImage = parsedImages[0]; // İlk fotoğrafı al
        } else {
          productImage = item.imageUrl; // Tek fotoğraf
        }
      } catch {
        productImage = item.imageUrl; // Parse edilemezse direkt kullan
      }
    }
    
    return (
      <View style={[styles.productGridItem, { width: gridConfig.itemWidth }]}>
        <TouchableOpacity
          onPress={() => handleProductPress(item)}
          activeOpacity={0.7}
          style={[styles.productGridCard, { height: gridConfig.cardHeight }]}
        >
          {/* Ürün Fotoğrafı */}
          {productImage ? (
            <Image
              source={{ uri: productImage }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <MaterialCommunityIcons 
                name="image-outline" 
                size={40} 
                color={COLORS.textSecondary} 
              />
            </View>
          )}
          
          {/* Etiketler - Üstte */}
          {badges.length > 0 && (
            <View style={styles.badgesContainer}>
              {badges.slice(0, 2).map((badge, idx) => (
                <View 
                  key={idx} 
                  style={[styles.badge, { backgroundColor: badge.color }]}
                >
                  <Text style={styles.badgeText}>{badge.label}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Stok Badge - Sağ üst köşe */}
          <View style={[
            styles.stockBadgeGrid,
            { backgroundColor: getStockColor(totalStock, item.minStock) }
          ]}>
            <Text style={styles.stockTextGrid}>{totalStock}</Text>
          </View>
          
          {/* Ürün Bilgileri */}
          <View style={styles.gridProductInfo}>
            <Text style={styles.gridProductName} numberOfLines={2}>
              {item.name}
            </Text>
            
            {/* Kategori */}
            {item.category && (
              <View style={styles.gridCategoryBadge}>
                <MaterialCommunityIcons 
                  name="tag" 
                  size={12} 
                  color={COLORS.primary} 
                />
                <Text style={styles.gridCategoryText} numberOfLines={1}>
                  {typeof item.category === 'string' ? item.category : item.category.name}
                </Text>
              </View>
            )}

            {/* Beden bilgisi */}
            {item.sizes && item.sizes.length > 0 && (
              <View style={styles.gridSizesContainer}>
                <Text style={styles.gridSizeText}>
                  {item.sizes.slice(0, 3).map(s => s.size).join(', ')}
                  {item.sizes.length > 3 && ` +${item.sizes.length - 3}`}
                </Text>
              </View>
            )}

            {/* Renk dots */}
            {item.colors && item.colors.length > 0 && (
              <View style={styles.gridColorsContainer}>
                {item.colors.slice(0, 5).map((color, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.gridColorDot,
                      { backgroundColor: color.hexCode || COLORS.textSecondary }
                    ]}
                  />
                ))}
                {item.colors.length > 5 && (
                  <Text style={styles.gridMoreColors}>+{item.colors.length - 5}</Text>
                )}
              </View>
            )}
            
            {/* Fiyat */}
            <Text style={styles.gridProductPrice}>
              {`₺${item.salePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
            </Text>
          </View>
          
          {/* Hızlı düzenleme butonu */}
          <TouchableOpacity
            style={styles.gridQuickEditButton}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('EditProduct', { productId: item.id });
            }}
          >
            <MaterialCommunityIcons name="pencil" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
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

      {/* Product List - Grid */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => String(item.id)}
        numColumns={gridConfig.numColumns}
        key={`grid-${gridConfig.numColumns}`}
        columnWrapperStyle={gridConfig.numColumns > 1 ? styles.productGridRow : undefined}
        contentContainerStyle={styles.productGridContainer}
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
                    {`₺${selectedProduct.purchasePrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                  </Text>
                </View>
              </View>
              
              <View style={styles.formColumn}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Satış Fiyatı:</Text>
                  <Text style={[styles.detailValue, styles.priceHighlight]}>
                    {`₺${selectedProduct.salePrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmVisible}
        onClose={() => setDeleteConfirmVisible(false)}
        title="Ürünü Sil"
      >
        <View style={styles.confirmContent}>
          <MaterialCommunityIcons 
            name="alert-circle-outline" 
            size={64} 
            color={COLORS.error} 
            style={{ alignSelf: 'center', marginBottom: SPACING.lg }}
          />
          <Text style={styles.confirmText}>
            {selectedProduct?.name} ürününü silmek istediğinizden emin misiniz?
          </Text>
          <Text style={styles.confirmSubtext}>
            Bu işlem geri alınamaz.
          </Text>
          
          <View style={styles.modalActions}>
            <Button
              title="İptal"
              onPress={() => setDeleteConfirmVisible(false)}
              variant="outline"
            />
            <Button
              title="Sil"
              onPress={confirmDelete}
              style={{ backgroundColor: COLORS.error }}
            />
          </View>
        </View>
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
      ? { boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }
      : { elevation: 2 }) as any,
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
  
  // Grid Layout Styles
  productGridContainer: {
    padding: 16,
  },
  productGridRow: {
    justifyContent: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  productGridItem: {
    // Width dinamik set edilecek
  },
  productGridCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    // Height dinamik set edilecek
    position: 'relative',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
      : { elevation: 2 }) as any,
  },
  
  // Ürün fotoğrafı
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: 8,
    backgroundColor: COLORS.background,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  
  // Grid içindeki bileşenler
  gridProductInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  gridProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 18,
  },
  gridCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  gridCategoryText: {
    fontSize: 10,
    color: COLORS.primary,
    marginLeft: 2,
    fontWeight: '500',
  },
  gridSizesContainer: {
    marginBottom: 4,
  },
  gridSizeText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  gridColorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  gridColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 4,
    marginBottom: 2,
  },
  gridMoreColors: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
  gridProductPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  stockBadgeGrid: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 28,
    alignItems: 'center',
    zIndex: 2,
  },
  stockTextGrid: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.surface,
  },
  gridQuickEditButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.round,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Eski list stiller (modal için hala gerekli)
  listContainer: {
    padding: 16,
  },
  gridRow: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
  },
  gridItem: {
    marginRight: 16,
    marginBottom: 16,
  },
  gridCard: {
    height: 220,
    margin: 0,
  },
  gridCardTouchable: {
    flex: 1,
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
  quickEditButton: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.round,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  confirmContent: {
    padding: SPACING.md,
  },
  confirmText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  confirmSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});
