import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProductStore } from '../../store/productStore';
import { useSaleStore } from '../../store/saleStore';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { Product } from '../../types';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isMobile = Platform.OS !== 'web' || width < 768;

export const NewSaleScreen = ({ navigation }: any) => {
  const { products, fetchProducts } = useProductStore();
  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartSubtotal,
    getCartTax,
    getCartTotal,
    createSale,
    isLoading,
  } = useSaleStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCart, setShowCart] = useState(!isMobile); // Mobilde başlangıçta kapalı
  const [selectedPayment, setSelectedPayment] = useState('nakit');

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = (product: Product) => {
    addToCart(product, 1);
    if (isMobile) {
      setShowCart(true); // Mobilde ürün eklenince sepeti göster
    }
  };

  const handleQuantityChange = (productId: string, change: number) => {
    const item = cart.find((i) => i.product.id === productId);
    if (item) {
      updateCartItem(productId, item.quantity + change);
    }
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      Alert.alert('Hata', 'Sepetiniz boş');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleScanBarcode = () => {
    navigation.navigate('BarcodeScanner', {
      onBarcodeScanned: (barcode: string) => {
        // Barkoda göre ürün bul
        const product = products.find((p) => p.barcode === barcode);
        if (product) {
          handleAddProduct(product);
          Alert.alert('Başarılı', `${product.name} sepete eklendi`);
        } else {
          Alert.alert('Ürün Bulunamadı', `Barkod: ${barcode} için ürün bulunamadı`);
        }
      },
    });
  };

  const handlePayment = async () => {
    try {
      await createSale(selectedPayment);
      setShowPaymentModal(false);
      Alert.alert('Başarılı', 'Satış tamamlandı', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Satış oluşturulamadı');
    }
  };

  const filteredProducts = products?.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode.includes(searchQuery)
  ) || [];

  // Mobil görünüm: Ürün kartları
  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleAddProduct(item)}
      activeOpacity={0.7}
    >
      <View style={styles.productCardContent}>
        <Text style={[styles.productCardName, isSmallDevice && styles.smallText]}>
          {item.name}
        </Text>
        <Text style={[styles.productCardPrice, isSmallDevice && styles.smallPrice]}>
          ₺{item.salePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={styles.productCardStock}>Stok: {item.stock}</Text>
      </View>
      <MaterialCommunityIcons 
        name="plus-circle" 
        size={isSmallDevice ? 28 : 32} 
        color={COLORS.primary} 
      />
    </TouchableOpacity>
  );

  // Sepet ürünü
  const renderCartItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={[styles.cartItemName, isSmallDevice && styles.smallText]}>
          {item.product.name}
        </Text>
        <Text style={[styles.cartItemPrice, isSmallDevice && styles.smallText]}>
          ₺{item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </Text>
      </View>
      
      <View style={styles.quantityControl}>
        <TouchableOpacity
          onPress={() => handleQuantityChange(item.product.id, -1)}
          style={styles.quantityButton}
        >
          <MaterialCommunityIcons 
            name="minus-circle" 
            size={isSmallDevice ? 24 : 28} 
            color={COLORS.error} 
          />
        </TouchableOpacity>
        
        <Text style={[styles.quantityText, isSmallDevice && styles.smallText]}>
          {item.quantity}
        </Text>
        
        <TouchableOpacity
          onPress={() => handleQuantityChange(item.product.id, 1)}
          style={styles.quantityButton}
        >
          <MaterialCommunityIcons 
            name="plus-circle" 
            size={isSmallDevice ? 24 : 28} 
            color={COLORS.success} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cartItemRight}>
        <Text style={[styles.cartItemTotal, isSmallDevice && styles.smallText]}>
          ₺{item.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </Text>
        <TouchableOpacity onPress={() => removeFromCart(item.product.id)}>
          <MaterialCommunityIcons 
            name="trash-can-outline" 
            size={isSmallDevice ? 18 : 20} 
            color={COLORS.error} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Mobil layout
  if (isMobile) {
    return (
      <View style={styles.container}>
        {/* Üst Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.tabButton, !showCart && styles.tabButtonActive]}
            onPress={() => setShowCart(false)}
          >
            <MaterialCommunityIcons 
              name="hanger" 
              size={20} 
              color={!showCart ? COLORS.surface : COLORS.textSecondary} 
            />
            <Text style={[styles.tabText, !showCart && styles.tabTextActive]}>
              Ürünler
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, showCart && styles.tabButtonActive]}
            onPress={() => setShowCart(true)}
          >
            <MaterialCommunityIcons 
              name="cart" 
              size={20} 
              color={showCart ? COLORS.surface : COLORS.textSecondary} 
            />
            <Text style={[styles.tabText, showCart && styles.tabTextActive]}>
              Sepet ({cart.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* İçerik */}
        {!showCart ? (
          // Ürün Listesi
          <View style={styles.content}>
            <View style={styles.searchContainer}>
              <Input
                placeholder="Ürün ara..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                leftIcon="magnify"
                containerStyle={styles.searchInput}
              />
              <TouchableOpacity
                style={styles.scanButton}
                onPress={handleScanBarcode}
              >
                <MaterialCommunityIcons name="barcode-scan" size={24} color={COLORS.surface} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={filteredProducts}
              renderItem={renderProductCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.productList}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
            />
          </View>
        ) : (
          // Sepet
          <View style={styles.content}>
            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <MaterialCommunityIcons name="cart-outline" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>Sepetiniz boş</Text>
                <Button
                  title="Ürün Ekle"
                  onPress={() => setShowCart(false)}
                  variant="outline"
                />
              </View>
            ) : (
              <>
                <FlatList
                  data={cart}
                  renderItem={renderCartItem}
                  keyExtractor={(item) => item.product.id}
                  contentContainerStyle={styles.cartList}
                />
                
                {/* Toplam Özeti */}
                <View style={styles.summary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Ara Toplam:</Text>
                    <Text style={styles.summaryValue}>
                      ₺{getCartSubtotal().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>KDV:</Text>
                    <Text style={styles.summaryValue}>
                      ₺{getCartTax().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={[styles.summaryRow, styles.summaryTotal]}>
                    <Text style={styles.totalLabel}>Toplam:</Text>
                    <Text style={styles.totalValue}>
                      ₺{getCartTotal().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  
                  <View style={styles.actions}>
                    <Button
                      title="Temizle"
                      onPress={clearCart}
                      variant="outline"
                      style={styles.clearButton}
                    />
                    <Button
                      title="Ödeme Al"
                      onPress={handleCompleteSale}
                      style={styles.payButton}
                      loading={isLoading}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* Ödeme Modal */}
        <Modal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Ödeme Yöntemi Seçin"
        >
          <View style={styles.paymentOptions}>
            {['nakit', 'kart', 'veresiye'].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentOption,
                  selectedPayment === method && styles.paymentOptionSelected,
                ]}
                onPress={() => setSelectedPayment(method)}
              >
                <MaterialCommunityIcons
                  name={
                    method === 'nakit'
                      ? 'cash'
                      : method === 'kart'
                      ? 'credit-card'
                      : 'calendar-clock'
                  }
                  size={32}
                  color={selectedPayment === method ? COLORS.primary : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.paymentText,
                    selectedPayment === method && styles.paymentTextSelected,
                  ]}
                >
                  {method === 'nakit'
                    ? 'Nakit'
                    : method === 'kart'
                    ? 'Kart'
                    : 'Veresiye'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Button
            title="Ödemeyi Tamamla"
            onPress={handlePayment}
            loading={isLoading}
          />
        </Modal>
      </View>
    );
  }

  // Web/Tablet layout (yan yana)
  return (
    <View style={styles.container}>
      <View style={styles.webLayout}>
        {/* Sol: Ürünler */}
        <View style={styles.productsSection}>
          <View style={styles.searchContainer}>
            <Input
              placeholder="Ürün ara..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon="magnify"
              containerStyle={styles.searchInput}
            />
          </View>
          
          <FlatList
            data={filteredProducts}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productList}
            numColumns={3}
            columnWrapperStyle={styles.productRow}
          />
        </View>

        {/* Sağ: Sepet */}
        <View style={styles.cartSection}>
          <Text style={styles.sectionTitle}>Sepet ({cart.length})</Text>
          
          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <MaterialCommunityIcons name="cart-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Sepetiniz boş</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={cart}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.product.id}
                contentContainerStyle={styles.cartList}
              />
              
              <View style={styles.summary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Ara Toplam:</Text>
                  <Text style={styles.summaryValue}>
                    ₺{getCartSubtotal().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>KDV:</Text>
                  <Text style={styles.summaryValue}>
                    ₺{getCartTax().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.totalLabel}>Toplam:</Text>
                  <Text style={styles.totalValue}>
                    ₺{getCartTotal().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                
                <View style={styles.actions}>
                  <Button
                    title="Temizle"
                    onPress={clearCart}
                    variant="outline"
                    style={styles.clearButton}
                  />
                  <Button
                    title="Ödeme Al"
                    onPress={handleCompleteSale}
                    style={styles.payButton}
                    loading={isLoading}
                  />
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Ödeme Modal */}
      <Modal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Ödeme Yöntemi Seçin"
      >
        <View style={styles.paymentOptions}>
          {['nakit', 'kart', 'veresiye'].map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.paymentOption,
                selectedPayment === method && styles.paymentOptionSelected,
              ]}
              onPress={() => setSelectedPayment(method)}
            >
              <MaterialCommunityIcons
                name={
                  method === 'nakit'
                    ? 'cash'
                    : method === 'kart'
                    ? 'credit-card'
                    : 'calendar-clock'
                }
                size={32}
                color={selectedPayment === method ? COLORS.primary : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.paymentText,
                  selectedPayment === method && styles.paymentTextSelected,
                ]}
              >
                {method === 'nakit'
                  ? 'Nakit'
                  : method === 'kart'
                  ? 'Kart'
                  : 'Veresiye'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Button
          title="Ödemeyi Tamamla"
          onPress={handlePayment}
          loading={isLoading}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Mobil üst bar
  topBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: isSmallDevice ? FONT_SIZES.sm : FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.surface,
  },

  // İçerik
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
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
  },

  // Ürün listesi
  productList: {
    padding: SPACING.md,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    marginHorizontal: 4,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: isSmallDevice ? 80 : 90,
  },
  productCardContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  productCardName: {
    fontSize: isSmallDevice ? FONT_SIZES.sm : FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  productCardPrice: {
    fontSize: isSmallDevice ? FONT_SIZES.md : FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  productCardStock: {
    fontSize: isSmallDevice ? 11 : FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },

  // Sepet
  cartList: {
    padding: SPACING.md,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: isSmallDevice ? FONT_SIZES.sm : FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  cartItemPrice: {
    fontSize: isSmallDevice ? FONT_SIZES.xs : FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  quantityButton: {
    padding: 4,
  },
  quantityText: {
    fontSize: isSmallDevice ? FONT_SIZES.md : FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: SPACING.sm,
    minWidth: 30,
    textAlign: 'center',
  },
  cartItemRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  cartItemTotal: {
    fontSize: isSmallDevice ? FONT_SIZES.md : FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Boş sepet
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginVertical: SPACING.lg,
  },

  // Özet
  summary: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: isSmallDevice ? FONT_SIZES.sm : FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: isSmallDevice ? FONT_SIZES.sm : FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: isSmallDevice ? FONT_SIZES.lg : FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: isSmallDevice ? FONT_SIZES.lg : FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  clearButton: {
    flex: 1,
  },
  payButton: {
    flex: 2,
  },

  // Web layout
  webLayout: {
    flexDirection: 'row',
    flex: 1,
  },
  productsSection: {
    flex: 2,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  cartSection: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  // Ödeme modal
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xl,
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  paymentOption: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    minWidth: 100,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  paymentText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  paymentTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Responsive
  smallText: {
    fontSize: FONT_SIZES.xs,
  },
  smallPrice: {
    fontSize: FONT_SIZES.md,
  },
});
