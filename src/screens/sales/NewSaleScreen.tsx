import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProductStore } from '../../store/productStore';
import { useSaleStore } from '../../store/saleStore';
import { useToastStore } from '../../store/toastStore';
import customerService from '../../services/customer.service';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { Product, Customer } from '../../types';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isMobile = Platform.OS !== 'web' || width < 768;

export const NewSaleScreen = ({ navigation }: any) => {
  const { products, fetchProducts } = useProductStore();
  const { showToast } = useToastStore();
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
  const [showCart, setShowCart] = useState(!isMobile);
  const [selectedPayment, setSelectedPayment] = useState('nakit');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paidAmount, setPaidAmount] = useState('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    tc: '',
    address: '',
  });

  useEffect(() => {
    fetchProducts();
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customerService.getCustomers();
      console.log('Loaded customers:', response.items);
      setCustomers(response.items || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

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
      showToast('error', 'Sepetiniz boş');
      return;
    }

    setShowPaymentModal(true);
  };

  const handleScanBarcode = () => {
    navigation.navigate('BarcodeScanner', {
      onBarcodeScanned: (barcode: string) => {
        const product = products?.find((p) => p.barcode === barcode);
        if (product) {
          handleAddProduct(product);
          showToast('success', `${product.name} sepete eklendi`);
        } else {
          showToast('error', `Barkod: ${barcode} için ürün bulunamadı`);
        }
      },
    });
  };

  const handlePayment = async () => {
    // Müşteri kontrolü
    if (!selectedCustomer) {
      showToast('error', 'Lütfen müşteri bilgilerini girin veya seçin');
      return;
    }

    try {
      // Veresiye ise ödenen tutarı hesapla
      const paid = (selectedPayment === 'veresiye' && paidAmount) 
        ? parseFloat(paidAmount) 
        : undefined;

      console.log('Creating sale with:', {
        paymentMethod: selectedPayment,
        customerId: selectedCustomer?.id,
        paidAmount: paid,
      });

      await createSale(selectedPayment, selectedCustomer?.id, paid);
      setShowPaymentModal(false);

      // Başarılı mesajı
      const message = selectedPayment === 'veresiye'
        ? `Satış tamamlandı. Kalan borç: ₺${(getCartTotal() - (parseFloat(paidAmount) || 0)).toFixed(2)}`
        : 'Satış başarıyla tamamlandı';

      showToast('success', message);
      
      // Temizle ve geri dön
      setTimeout(() => {
        setSelectedCustomer(null);
        setSelectedPayment('nakit');
        setPaidAmount('');
        setShowNewCustomerForm(false);
        setNewCustomer({ name: '', phone: '', tc: '', address: '' });
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'string' 
            ? error.response.data.detail 
            : JSON.stringify(error.response.data.detail))
        : error.message || 'Satış oluşturulamadı';
      showToast('error', errorMessage);
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

                {/* Müşteri Seçimi */}
                <View style={styles.customerSection}>
                  <Text style={styles.customerSectionLabel}>Müşteri Bilgileri</Text>
                  <TouchableOpacity
                    style={styles.customerSelectButton}
                    onPress={() => setShowCustomerModal(true)}
                  >
                    <View style={styles.customerSelectContent}>
                      <MaterialCommunityIcons
                        name={selectedCustomer ? 'account-check' : 'account-plus'}
                        size={24}
                        color={selectedCustomer ? COLORS.success : COLORS.primary}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.customerSelectName}>
                          {selectedCustomer ? selectedCustomer.name : 'Müşteri Seç'}
                        </Text>
                        {selectedCustomer && (
                          <Text style={styles.customerSelectPhone}>
                            {selectedCustomer.phone}
                            {selectedCustomer.balance > 0 && (
                              <Text style={{ color: COLORS.error }}>
                                {' '}• Borç: ₺{selectedCustomer.balance.toFixed(2)}
                              </Text>
                            )}
                          </Text>
                        )}
                      </View>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

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
          title="Ödeme Detayları"
          size="large"
        >
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Müşteri Seçimi */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Müşteri Bilgileri (Zorunlu)</Text>
              
              {!showNewCustomerForm ? (
                <>
                  <TouchableOpacity
                    style={styles.customerSelect}
                    onPress={() => setShowCustomerModal(true)}
                  >
                    <Text style={styles.customerSelectText}>
                      {selectedCustomer ? selectedCustomer.name : 'Mevcut Müşteri Seç'}
                    </Text>
                    <MaterialCommunityIcons
                      name={selectedCustomer ? 'account-check' : 'account-search'}
                      size={24}
                      color={selectedCustomer ? COLORS.success : COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                  
                  {selectedCustomer && (
                    <View style={styles.customerInfo}>
                      <Text style={styles.customerInfoText}>
                        Tel: {selectedCustomer.phone}
                      </Text>
                      {selectedCustomer.balance > 0 && (
                        <Text style={[styles.customerInfoText, { color: COLORS.error }]}>
                          Mevcut Borç: ₺{selectedCustomer.balance.toFixed(2)}
                        </Text>
                      )}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.newCustomerButton}
                    onPress={() => setShowNewCustomerForm(true)}
                  >
                    <MaterialCommunityIcons name="account-plus" size={20} color={COLORS.primary} />
                    <Text style={styles.newCustomerButtonText}>Yeni Müşteri Ekle</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.newCustomerForm}>
                  <Input
                    label="Ad Soyad *"
                    placeholder="Örn: Ayşe Yılmaz"
                    value={newCustomer.name}
                    onChangeText={(text) => setNewCustomer({ ...newCustomer, name: text })}
                    leftIcon="account"
                  />
                  <Input
                    label="Telefon *"
                    placeholder="Örn: 0532 123 4567"
                    value={newCustomer.phone}
                    onChangeText={(text) => setNewCustomer({ ...newCustomer, phone: text })}
                    keyboardType="phone-pad"
                    leftIcon="phone"
                  />
                  <Input
                    label="TC Kimlik No"
                    placeholder="11 haneli TC No"
                    value={newCustomer.tc}
                    onChangeText={(text) => setNewCustomer({ ...newCustomer, tc: text })}
                    keyboardType="numeric"
                    maxLength={11}
                    leftIcon="card-account-details"
                  />
                  <Input
                    label="Adres"
                    placeholder="Açık adres"
                    value={newCustomer.address}
                    onChangeText={(text) => setNewCustomer({ ...newCustomer, address: text })}
                    multiline
                    numberOfLines={3}
                    leftIcon="map-marker"
                  />
                  
                  <View style={styles.formActions}>
                    <Button
                      title="İptal"
                      onPress={() => {
                        setShowNewCustomerForm(false);
                        setNewCustomer({ name: '', phone: '', tc: '', address: '' });
                      }}
                      variant="outline"
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Kaydet ve Devam Et"
                      onPress={async () => {
                        if (!newCustomer.name || !newCustomer.phone) {
                          showToast('error', 'Ad Soyad ve Telefon alanları zorunludur');
                          return;
                        }
                        try {
                          const response = await customerService.createCustomer({
                            name: newCustomer.name,
                            phone: newCustomer.phone,
                            email: '',
                            address: newCustomer.address || '',
                          });
                          setSelectedCustomer((response.data || response) as Customer);
                          setShowNewCustomerForm(false);
                          setNewCustomer({ name: '', phone: '', tc: '', address: '' });
                          await loadCustomers();
                          showToast('success', 'Müşteri kaydedildi');
                        } catch (error) {
                          showToast('error', 'Müşteri kaydedilemedi');
                        }
                      }}
                      style={{ flex: 2 }}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Ödeme Yöntemi */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Ödeme Yöntemi</Text>
              <View style={styles.paymentOptions}>
                {['nakit', 'kart', 'veresiye'].map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.paymentOption,
                      selectedPayment === method && styles.paymentOptionSelected,
                    ]}
                    onPress={() => {
                      if (method === 'veresiye' && !selectedCustomer) {
                        setShowCustomerModal(true);
                        showToast('info', 'Lütfen bir müşteri seçin');
                      } else {
                        setSelectedPayment(method);
                      }
                    }}
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
            </View>

            {/* Veresiye için ödenen tutar */}
            {selectedPayment === 'veresiye' && (
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Peşinat (Opsiyonel)</Text>
                <Input
                  placeholder="0.00"
                  value={paidAmount}
                  onChangeText={setPaidAmount}
                  keyboardType="numeric"
                  leftIcon="currency-try"
                />
                <Text style={styles.remainingText}>
                  Kalan Borç: ₺{(getCartTotal() - (parseFloat(paidAmount) || 0)).toFixed(2)}
                </Text>
              </View>
            )}

            {/* Tutar Özeti */}
            <View style={styles.modalSection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ara Toplam:</Text>
                <Text style={styles.summaryValue}>
                  ₺{getCartSubtotal().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>KDV (%18):</Text>
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
            </View>

            <Button
              title="Ödemeyi Tamamla"
              onPress={handlePayment}
              loading={isLoading}
            />
          </ScrollView>
        </Modal>

        {/* Müşteri Seçim Modal */}
        <Modal
          visible={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          title="Müşteri Seç"
        >
          <FlatList
            data={customers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.customerItem}
                onPress={() => {
                  console.log('Selected customer:', item);
                  setSelectedCustomer(item);
                  setSelectedPayment('veresiye'); // Otomatik veresiye seç
                  setShowCustomerModal(false);
                }}
              >
                <View style={styles.customerItemContent}>
                  <Text style={styles.customerName}>{item.name}</Text>
                  <Text style={styles.customerPhone}>{item.phone}</Text>
                  {item.balance > 0 && (
                    <Text style={styles.customerBalance}>
                      Borç: ₺{item.balance.toFixed(2)}
                    </Text>
                  )}
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyCustomers}>
                <Text style={styles.emptyText}>Müşteri bulunamadı</Text>
              </View>
            }
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
        title="Ödeme Detayları"
        size="large"
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Müşteri Seçimi */}
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Müşteri Bilgileri (Zorunlu)</Text>
            
            {!showNewCustomerForm ? (
              <>
                <TouchableOpacity
                  style={styles.customerSelect}
                  onPress={() => setShowCustomerModal(true)}
                >
                  <Text style={styles.customerSelectText}>
                    {selectedCustomer ? selectedCustomer.name : 'Mevcut Müşteri Seç'}
                  </Text>
                  <MaterialCommunityIcons
                    name={selectedCustomer ? 'account-check' : 'account-search'}
                    size={24}
                    color={selectedCustomer ? COLORS.success : COLORS.textSecondary}
                  />
                </TouchableOpacity>
                
                {selectedCustomer && (
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerInfoText}>
                      Tel: {selectedCustomer.phone}
                    </Text>
                    {selectedCustomer.balance > 0 && (
                      <Text style={[styles.customerInfoText, { color: COLORS.error }]}>
                        Mevcut Borç: ₺{selectedCustomer.balance.toFixed(2)}
                      </Text>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.newCustomerButton}
                  onPress={() => setShowNewCustomerForm(true)}
                >
                  <MaterialCommunityIcons name="account-plus" size={20} color={COLORS.primary} />
                  <Text style={styles.newCustomerButtonText}>Yeni Müşteri Ekle</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.newCustomerForm}>
                <Input
                  label="Ad Soyad *"
                  placeholder="Örn: Ayşe Yılmaz"
                  value={newCustomer.name}
                  onChangeText={(text) => setNewCustomer({ ...newCustomer, name: text })}
                  leftIcon="account"
                />
                <Input
                  label="Telefon *"
                  placeholder="Örn: 0532 123 4567"
                  value={newCustomer.phone}
                  onChangeText={(text) => setNewCustomer({ ...newCustomer, phone: text })}
                  keyboardType="phone-pad"
                  leftIcon="phone"
                />
                <Input
                  label="TC Kimlik No"
                  placeholder="11 haneli TC No"
                  value={newCustomer.tc}
                  onChangeText={(text) => setNewCustomer({ ...newCustomer, tc: text })}
                  keyboardType="numeric"
                  maxLength={11}
                  leftIcon="card-account-details"
                />
                <Input
                  label="Adres"
                  placeholder="Açık adres"
                  value={newCustomer.address}
                  onChangeText={(text) => setNewCustomer({ ...newCustomer, address: text })}
                  multiline
                  numberOfLines={3}
                  leftIcon="map-marker"
                />
                
                <View style={styles.formActions}>
                  <Button
                    title="İptal"
                    onPress={() => {
                      setShowNewCustomerForm(false);
                      setNewCustomer({ name: '', phone: '', tc: '', address: '' });
                    }}
                    variant="outline"
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Kaydet ve Devam Et"
                    onPress={async () => {
                      if (!newCustomer.name || !newCustomer.phone) {
                        showToast('error', 'Ad Soyad ve Telefon alanları zorunludur');
                        return;
                      }
                      
                      try {
                        const customerData: any = {
                          name: newCustomer.name,
                          phone: newCustomer.phone,
                          address: newCustomer.address || '',
                        };
                        
                        const response = await customerService.createCustomer(customerData);
                        const customer = (response.data || response) as Customer;
                        
                        setSelectedCustomer(customer);
                        setShowNewCustomerForm(false);
                        setNewCustomer({ name: '', phone: '', tc: '', address: '' });
                        await loadCustomers();
                        
                        showToast('success', 'Müşteri kaydedildi');
                      } catch (error: any) {
                        showToast('error', error.response?.data?.detail || error.message || 'Müşteri kaydedilemedi');
                      }
                    }}
                    style={{ flex: 2 }}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Ödeme Yöntemi */}
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Ödeme Yöntemi</Text>
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
          </View>

          {/* Veresiye için ödenen tutar */}
          {selectedPayment === 'veresiye' && (
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Peşinat (Opsiyonel)</Text>
              <Input
                placeholder="0.00"
                value={paidAmount}
                onChangeText={setPaidAmount}
                keyboardType="numeric"
                leftIcon="currency-try"
              />
              <Text style={styles.remainingText}>
                Kalan Borç: ₺{(getCartTotal() - (parseFloat(paidAmount) || 0)).toFixed(2)}
              </Text>
            </View>
          )}

          {/* Tutar Özeti */}
          <View style={styles.modalSection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ara Toplam:</Text>
              <Text style={styles.summaryValue}>
                ₺{getCartSubtotal().toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>KDV (%18):</Text>
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
          </View>

          <Button
            title="Ödemeyi Tamamla"
            onPress={handlePayment}
            loading={isLoading}
          />
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

  // Modal sections
  modalSection: {
    marginBottom: SPACING.lg,
  },
  modalLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  
  // Customer selection
  customerSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  customerSelectText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  // Sepet müşteri seçimi
  customerSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  customerSectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  customerSelectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  customerSelectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  customerSelectName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  customerSelectPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  customerInfo: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: BORDER_RADIUS.sm,
  },
  customerInfoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginVertical: 2,
  },
  customerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  customerItemContent: {
    flex: 1,
  },
  customerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  customerBalance: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    fontWeight: '500',
  },
  emptyCustomers: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  newCustomerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    gap: SPACING.xs,
  },
  newCustomerButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  newCustomerForm: {
    gap: SPACING.md,
  },
  formActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  remainingText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.sm,
  },

  // Responsive
  smallText: {
    fontSize: FONT_SIZES.xs,
  },
  smallPrice: {
    fontSize: FONT_SIZES.md,
  },
});
