import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProductStore } from '../../store/productStore';
import { useSupplierStore } from '../../store/supplierStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useToastStore } from '../../store/toastStore';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { InfoModal } from '../../components/common';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { ProductUnit, Season, ClothingSize, ClothingColor, Product } from '../../types';

export const EditProductScreen = ({ route, navigation }: any) => {
  const { productId } = route.params;
  const { products, updateProduct, isLoading } = useProductStore();
  const { suppliers, fetchSuppliers } = useSupplierStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { showToast } = useToastStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [unit, setUnit] = useState<ProductUnit>(ProductUnit.PIECE);
  const [shelfLocation, setShelfLocation] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [brand, setBrand] = useState('');
  const [material, setMaterial] = useState('');
  const [season, setSeason] = useState<Season | ''>('');
  const [pattern, setPattern] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [sizes, setSizes] = useState<ClothingSize[]>([]);
  const [colors, setColors] = useState<ClothingColor[]>([]);

  // Fotoğraf yönetimi
  const MIN_IMAGES = 4;
  const MAX_IMAGES = 10;
  const [productImages, setProductImages] = useState<string[]>([]);

  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newSize, setNewSize] = useState('');
  const [newSizeStock, setNewSizeStock] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('');
  const [newColorStock, setNewColorStock] = useState('');
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const showInfo = (title: string, message: string) => {
    setInfoModal({ visible: true, title, message });
  };

  useEffect(() => {
    const foundProduct = products.find((p) => p.id === productId);
    if (foundProduct) {
      setProduct(foundProduct);
      loadProductData(foundProduct);
    }
    fetchSuppliers();
    fetchCategories();
  }, [productId, products]);

  useEffect(() => {
    if (route?.params?.scannedBarcode) {
      setBarcode(route.params.scannedBarcode);
    }
  }, [route?.params?.scannedBarcode]);

  const handleScanBarcode = () => {
    navigation.navigate('BarcodeScanner', {
      onBarcodeScanned: (scannedBarcode: string) => {
        setBarcode(scannedBarcode);
      },
    });
  };

  const loadProductData = (p: Product) => {
    setBarcode(p.barcode);
    setName(p.name);
    setCategoryId(typeof p.category === 'string' ? p.category : (p.categoryId || p.category?.id || ''));
    setDescription(p.description || '');
    setPurchasePrice(p.purchasePrice.toString());
    setSalePrice(p.salePrice.toString());
    setStock(p.stock.toString());
    setMinStock(p.minStock.toString());
    setUnit(p.unit);
    setShelfLocation(p.shelfLocation || '');
    setSupplierId(typeof p.supplier === 'object' && p.supplier ? p.supplier.id : '');
    setBrand(p.brand || '');
    setMaterial(p.material || '');
    setSeason(p.season || '');
    setPattern(p.pattern || '');
    setCareInstructions(p.careInstructions || '');
    setSizes(p.sizes || []);
    setColors(p.colors || []);
    
    // Fotoğrafları yükle (imageUrl JSON string ise parse et)
    if (p.imageUrl) {
      try {
        const parsedImages = JSON.parse(p.imageUrl);
        if (Array.isArray(parsedImages)) {
          setProductImages(parsedImages);
        } else {
          setProductImages([p.imageUrl]); // Tek fotoğraf ise array'e çevir
        }
      } catch {
        // Parse edilemezse tek fotoğraf olarak kabul et
        setProductImages([p.imageUrl]);
      }
    }
  };

  const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46'];

  const handleAddSize = () => {
    if (!newSize || !newSizeStock) {
      showToast('error', 'Lütfen tüm alanları doldurun');
      return;
    }
    const stockNum = parseInt(newSizeStock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      showToast('error', 'Geçerli bir stok miktarı girin');
      return;
    }
    setSizes([...sizes, { size: newSize, stock: stockNum }]);
    setNewSize('');
    setNewSizeStock('');
    setShowSizeModal(false);
  };

  const handleRemoveSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleAddColor = () => {
    if (!newColorName || !newColorStock) {
      showToast('error', 'Lütfen renk adı ve stok miktarını girin');
      return;
    }
    const stockNum = parseInt(newColorStock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      showToast('error', 'Geçerli bir stok miktarı girin');
      return;
    }
    setColors([...colors, { name: newColorName, hexCode: newColorHex, stock: stockNum }]);
    setNewColorName('');
    setNewColorHex('');
    setNewColorStock('');
    setShowColorModal(false);
  };

  const handleRemoveColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  // Fotoğraf yönetimi fonksiyonları
  const handleImageUpload = (event: any) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - productImages.length;
    if (remainingSlots <= 0) {
      showInfo('Maksimum Limit', `En fazla ${MAX_IMAGES} fotoğraf yükleyebilirsiniz`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const imageUrls: string[] = [];

    filesToProcess.forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        imageUrls.push(reader.result as string);
        if (imageUrls.length === filesToProcess.length) {
          setProductImages([...productImages, ...imageUrls]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    
    // Fotoğraf validasyonu
    if (productImages.length < MIN_IMAGES) {
      showInfo('Eksik Fotoğraf', `En az ${MIN_IMAGES} fotoğraf eklemelisiniz. Şu an ${productImages.length} fotoğraf var.`);
      return;
    }
    
    if (!barcode || !name || !categoryId) {
      showToast('error', 'Lütfen zorunlu alanları doldurun');
      return;
    }

    const purchasePriceNum = parseFloat(purchasePrice);
    const salePriceNum = parseFloat(salePrice);
    const stockNum = parseInt(stock, 10);
    const minStockNum = parseInt(minStock, 10);

    if (isNaN(purchasePriceNum) || isNaN(salePriceNum) || purchasePriceNum < 0 || salePriceNum < 0) {
      showToast('error', 'Geçerli fiyat değerleri girin');
      return;
    }

    if (isNaN(stockNum) || isNaN(minStockNum) || stockNum < 0 || minStockNum < 0) {
      showToast('error', 'Geçerli stok değerleri girin');
      return;
    }

    let totalSizeStock = 0;
    if (sizes.length > 0) {
      totalSizeStock = sizes.reduce((sum, size) => sum + size.stock, 0);
    }

    const productData: any = {
      barcode,
      name,
      categoryId: parseInt(categoryId),
      description,
      purchasePrice: purchasePriceNum,
      salePrice: salePriceNum,
      stock: sizes.length > 0 ? totalSizeStock : stockNum,
      minStock: minStockNum,
      unit,
      shelfLocation,
      supplierId: supplierId || undefined,
      brand,
      material,
      season: season || undefined,
      pattern,
      careInstructions,
      sizes: sizes.length > 0 ? sizes : undefined,
      colors: colors.length > 0 ? colors : undefined,
      imageUrl: productImages.length > 0 ? JSON.stringify(productImages) : undefined, // Fotoğrafları JSON string olarak kaydet
    };

    console.log('Updating product:', productId, productData);

    try {
      await updateProduct(productId, productData);
      showToast('success', 'Ürün başarıyla güncellendi');
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      console.error('Update error:', error);
      showToast('error', 'Ürün güncellenirken bir hata oluştu');
    }
  };

  const selectedSupplier = suppliers.find(s => s.id === supplierId);

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card>
          <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
          
          <View>
            <Input label="Barkod *" value={barcode} onChangeText={setBarcode} keyboardType="numeric" />
            <TouchableOpacity style={styles.scanButton} onPress={handleScanBarcode}>
              <MaterialCommunityIcons name="barcode-scan" size={20} color={COLORS.primary} />
              <Text style={styles.scanButtonText}>Barkod Tara</Text>
            </TouchableOpacity>
          </View>
          
          <Input label="Ürün Adı *" value={name} onChangeText={setName} />
          
                    <Text style={styles.inputLabel}>Kategori *</Text>
          <View style={styles.categoryGrid}>
            {categories.length === 0 ? (
              <Text style={styles.noCategoryText}>
                Henüz kategori yok. Kategori sayfasından kategori ekleyin.
              </Text>
            ) : (
              categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    categoryId === cat.id && styles.categoryChipSelected
                  ]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    categoryId === cat.id && styles.categoryChipTextSelected
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <Input label="Açıklama" value={description} onChangeText={setDescription} multiline numberOfLines={3} />
        </Card>

        {/* Ürün Fotoğrafları */}
        <Card>
          <View style={styles.photoHeader}>
            <Text style={styles.sectionTitle}>Ürün Fotoğrafları *</Text>
            <Text style={styles.photoRequirement}>
              ({productImages.length}/{MIN_IMAGES} - Min {MIN_IMAGES}, Maks {MAX_IMAGES})
            </Text>
          </View>
          
          <View style={styles.photoGrid}>
            {productImages.map((image, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: image }} style={styles.photoImage} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <MaterialCommunityIcons name="close-circle" size={24} color={COLORS.error} />
                </TouchableOpacity>
                {index === 0 && (
                  <View style={styles.mainPhotoBadge}>
                    <Text style={styles.mainPhotoText}>Ana</Text>
                  </View>
                )}
              </View>
            ))}
            
            {productImages.length < MAX_IMAGES && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.multiple = true;
                    input.onchange = handleImageUpload;
                    input.click();
                  }
                }}
              >
                <MaterialCommunityIcons name="camera-plus" size={32} color={COLORS.textSecondary} />
                <Text style={styles.addPhotoText}>Fotoğraf Ekle</Text>
                <Text style={styles.addPhotoSubtext}>
                  {productImages.length < MIN_IMAGES 
                    ? `${MIN_IMAGES - productImages.length} fotoğraf daha gerekli` 
                    : `${MAX_IMAGES - productImages.length} fotoğraf daha ekleyebilirsiniz`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {productImages.length > 0 && productImages.length < MIN_IMAGES && (
            <View style={styles.warningBox}>
              <MaterialCommunityIcons name="alert" size={20} color={COLORS.warning} />
              <Text style={styles.warningText}>
                En az {MIN_IMAGES} fotoğraf eklemelisiniz. Şu an {MIN_IMAGES - productImages.length} fotoğraf eksik.
              </Text>
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Fiyat ve Stok</Text>
          <View style={styles.row}>
            <Input label="Alış Fiyatı *" value={purchasePrice} onChangeText={setPurchasePrice} keyboardType="decimal-pad" containerStyle={styles.halfInput} leftIcon="currency-try" />
            <Input label="Satış Fiyatı *" value={salePrice} onChangeText={setSalePrice} keyboardType="decimal-pad" containerStyle={styles.halfInput} leftIcon="currency-try" />
          </View>

          <View style={styles.row}>
            <Input label="Stok Miktarı *" value={stock} onChangeText={setStock} keyboardType="numeric" containerStyle={styles.halfInput} editable={sizes.length === 0} />
            <Input label="Min. Stok *" value={minStock} onChangeText={setMinStock} keyboardType="numeric" containerStyle={styles.halfInput} />
          </View>

          {sizes.length > 0 && (
            <Text style={styles.helperText}>
              Toplam Stok (Bedenler): {sizes.reduce((sum, s) => sum + s.stock, 0)} adet
            </Text>
          )}

          <Input label="Raf Konumu" value={shelfLocation} onChangeText={setShelfLocation} />
        </Card>

        {/* Giyim Özellikleri */}
        <Card>
          <Text style={styles.sectionTitle}>Giyim Özellikleri</Text>
          <Input label="Marka" value={brand} onChangeText={setBrand} />
          <Input label="Kumaş" value={material} onChangeText={setMaterial} />

          <Text style={styles.inputLabel}>Sezon</Text>
          <View style={styles.seasonGrid}>
            {[
              { label: 'Yaz', value: Season.SUMMER },
              { label: 'Kış', value: Season.WINTER },
              { label: 'İlkbahar/Sonbahar', value: Season.SPRING_FALL },
              { label: '4 Mevsim', value: Season.ALL_SEASON },
            ].map((s) => (
              <TouchableOpacity
                key={s.value}
                style={[styles.seasonChip, season === s.value && styles.seasonChipSelected]}
                onPress={() => setSeason(s.value)}
              >
                <Text style={[styles.seasonChipText, season === s.value && styles.seasonChipTextSelected]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Desen" value={pattern} onChangeText={setPattern} />
          <Input label="Bakım Talimatları" value={careInstructions} onChangeText={setCareInstructions} multiline numberOfLines={2} />
        </Card>

        {/* Bedenler ve Renkler - EditProduct için kısaltılmış */}
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bedenler ({sizes.length})</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowSizeModal(true)}>
              <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          {sizes.length > 0 && (
            <View style={styles.itemsGrid}>
              {sizes.map((size, index) => (
                <View key={index} style={styles.itemCard}>
                  <Text style={styles.itemName}>{size.size}: {size.stock} adet</Text>
                  <TouchableOpacity onPress={() => handleRemoveSize(index)}>
                    <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Renkler ({colors.length})</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowColorModal(true)}>
              <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          {colors.length > 0 && (
            <View style={styles.itemsGrid}>
              {colors.map((color, index) => (
                <View key={index} style={styles.itemCard}>
                  {color.hexCode && <View style={[styles.colorPreview, { backgroundColor: color.hexCode }]} />}
                  <Text style={styles.itemName}>{color.name}: {color.stock} adet</Text>
                  <TouchableOpacity onPress={() => handleRemoveColor(index)}>
                    <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tedarikçi</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowSupplierModal(true)}>
              <MaterialCommunityIcons name="truck" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          {selectedSupplier ? (
            <View style={styles.selectedSupplier}>
              <Text style={styles.supplierName}>{selectedSupplier.name}</Text>
              <TouchableOpacity onPress={() => setSupplierId('')}>
                <MaterialCommunityIcons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.emptyText}>Tedarikçi seçilmedi</Text>
          )}
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Güncelle" onPress={handleSubmit} loading={isLoading} icon="check" />
      </View>

      {/* Modals - Simplified */}
      <Modal visible={showSizeModal} onClose={() => setShowSizeModal(false)} title="Beden Ekle">
        <View style={styles.quickSizeGrid}>
          {commonSizes.map((size) => (
            <TouchableOpacity key={size} style={styles.quickSizeChip} onPress={() => setNewSize(size)}>
              <Text>{size}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Input label="Beden" value={newSize} onChangeText={setNewSize} />
        <Input label="Stok" value={newSizeStock} onChangeText={setNewSizeStock} keyboardType="numeric" />
        <Button title="Ekle" onPress={handleAddSize} />
      </Modal>

      <Modal visible={showColorModal} onClose={() => setShowColorModal(false)} title="Renk Ekle">
        <Input label="Renk Adı" value={newColorName} onChangeText={setNewColorName} />
        <Input label="Renk Kodu" value={newColorHex} onChangeText={setNewColorHex} />
        <Input label="Stok" value={newColorStock} onChangeText={setNewColorStock} keyboardType="numeric" />
        <Button title="Ekle" onPress={handleAddColor} />
      </Modal>

      <Modal visible={showSupplierModal} onClose={() => setShowSupplierModal(false)} title="Tedarikçi Seç">
        <ScrollView style={{ maxHeight: 300 }}>
          {suppliers.map((supplier) => (
            <TouchableOpacity
              key={supplier.id}
              style={styles.supplierItem}
              onPress={() => {
                setSupplierId(supplier.id);
                setShowSupplierModal(false);
              }}
            >
              <Text>{supplier.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Modal>

      {/* Info Modal */}
      <InfoModal
        visible={infoModal.visible}
        title={infoModal.title}
        message={infoModal.message}
        onClose={() => setInfoModal({ visible: false, title: '', message: '' })}
      />
    </View>
  );
};

// Styles - reusing most from AddProductScreen
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', marginBottom: SPACING.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  inputLabel: { fontSize: FONT_SIZES.sm, fontWeight: '500', marginBottom: SPACING.xs },
  row: { flexDirection: 'row', gap: SPACING.md },
  halfInput: { flex: 1 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  noCategoryText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontStyle: 'italic', padding: SPACING.md, textAlign: 'center' },
  categoryChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  categoryChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { fontSize: FONT_SIZES.sm },
  categoryChipTextSelected: { color: COLORS.surface, fontWeight: '600' },
  seasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  seasonChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  seasonChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  seasonChipText: { fontSize: FONT_SIZES.sm },
  seasonChipTextSelected: { color: COLORS.surface, fontWeight: '600' },
  helperText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, marginTop: -SPACING.sm, marginBottom: SPACING.sm },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: -SPACING.md,
    marginBottom: SPACING.md,
  },
  scanButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  itemsGrid: { gap: SPACING.sm },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md },
  itemName: { fontSize: FONT_SIZES.md, fontWeight: '500' },
  colorPreview: { width: 20, height: 20, borderRadius: 10, marginRight: SPACING.xs, borderWidth: 1, borderColor: COLORS.border },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: SPACING.md },
  selectedSupplier: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.md, backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.md },
  supplierName: { fontSize: FONT_SIZES.md, fontWeight: '600' },
  footer: { padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  quickSizeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.md },
  quickSizeChip: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  supplierItem: { padding: SPACING.md, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.background, marginBottom: SPACING.sm },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  photoRequirement: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  photoItem: {
    width: 100,
    height: 100,
    position: 'relative',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.md,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } 
      : { elevation: 2 }) as any,
  },
  mainPhotoBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  mainPhotoText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.surface,
    fontWeight: '600',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xs,
  },
  addPhotoText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  addPhotoSubtext: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: `${COLORS.warning}15`,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.warning}30`,
    marginTop: SPACING.md,
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: '500',
  },
});
