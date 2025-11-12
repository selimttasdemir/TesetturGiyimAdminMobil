import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  Image,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProductStore } from '../../store/productStore';
import { useSupplierStore } from '../../store/supplierStore';
import { useCategoryStore } from '../../store/categoryStore';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { InfoModal } from '../../components/common';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { ProductUnit, Season, ClothingSize, ClothingColor } from '../../types';

export const AddProductScreen = ({ navigation, route }: any) => {
  const { createProduct, isLoading } = useProductStore();
  const { suppliers, fetchSuppliers } = useSupplierStore();
  const { categories, fetchCategories } = useCategoryStore();

  // Temel bilgiler
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

  // Giyim spesifik
  const [brand, setBrand] = useState('');
  const [material, setMaterial] = useState('');
  const [season, setSeason] = useState<Season | ''>('');
  const [pattern, setPattern] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  
  // Bedenler ve Renkler
  const [sizes, setSizes] = useState<ClothingSize[]>([]);
  const [colors, setColors] = useState<ClothingColor[]>([]);
  
  // Ürün Fotoğrafları (min 4, max 10)
  const [productImages, setProductImages] = useState<string[]>([]);
  const MIN_IMAGES = 4;
  const MAX_IMAGES = 10;

  // Modal states
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // Size modal inputs
  const [newSize, setNewSize] = useState('');
  const [newSizeStock, setNewSizeStock] = useState('');

  // Color modal inputs
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

  const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46'];

  useEffect(() => {
    fetchSuppliers();
    fetchCategories();
  }, []);

  useEffect(() => {
    // Eğer route params'dan barkod geliyorsa set et
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

  const handleAddSize = () => {
    if (!newSize || !newSizeStock) {
      showInfo('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    const stockNum = parseInt(newSizeStock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      showInfo('Hata', 'Geçerli bir stok miktarı girin');
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
      showInfo('Hata', 'Lütfen renk adı ve stok miktarını girin');
      return;
    }

    const stockNum = parseInt(newColorStock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      showInfo('Hata', 'Geçerli bir stok miktarı girin');
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
    // Fotoğraf validasyonu
    if (productImages.length < MIN_IMAGES) {
      showInfo('Eksik Fotoğraf', `En az ${MIN_IMAGES} fotoğraf eklemelisiniz. Şu an ${productImages.length} fotoğraf var.`);
      return;
    }
    
    // Validasyon
    if (!barcode || !name || !categoryId) {
      showInfo('Hata', 'Lütfen zorunlu alanları doldurun (Barkod, Ürün Adı, Kategori)');
      return;
    }

    const purchasePriceNum = parseFloat(purchasePrice) || 0;
    const salePriceNum = parseFloat(salePrice) || 0;
    const stockNum = parseInt(stock, 10) || 0;
    const minStockNum = parseInt(minStock, 10) || 5;

    if (purchasePriceNum <= 0 || salePriceNum <= 0) {
      showInfo('Hata', 'Fiyatlar 0\'dan büyük olmalıdır');
      return;
    }

    // Toplam stok kontrolü (sizes varsa)
    let totalSizeStock = 0;
    if (sizes.length > 0) {
      totalSizeStock = sizes.reduce((sum, size) => sum + size.stock, 0);
    }

    const productData: any = {
      barcode,
      name,
      categoryId: parseInt(categoryId),
      description: description || undefined,
      purchasePrice: purchasePriceNum,
      salePrice: salePriceNum,
      stock: sizes.length > 0 ? totalSizeStock : stockNum,
      minStock: minStockNum,
      imageUrl: productImages.length > 0 ? JSON.stringify(productImages) : undefined, // Fotoğrafları JSON string olarak kaydet
    };

    const success = await createProduct(productData);
    
    if (success) {
      setBarcode('');
      setName('');
      setCategoryId('');
      setDescription('');
      setPurchasePrice('');
      setSalePrice('');
      setStock('');
      setMinStock('');
      setSizes([]);
      setColors([]);
      setProductImages([]); // Fotoğrafları sıfırla
      setSupplierId('');
      setBrand('');
      setMaterial('');
      setSeason('');
      setPattern('');
      setCareInstructions('');
      setShelfLocation('');
      
      showInfo('Başarılı', 'Ürün başarıyla eklendi. Yeni ürün ekleyebilirsiniz.');
    } else {
      showInfo('Hata', 'Ürün eklenirken bir hata oluştu');
    }
  };

  const selectedSupplier = suppliers?.find(s => s.id === supplierId);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Temel Bilgiler */}
        <Card>
          <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
          
          <View>
            <Input
              label="Barkod *"
              value={barcode}
              onChangeText={setBarcode}
              placeholder="8690001000001"
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScanBarcode}
            >
              <MaterialCommunityIcons name="barcode-scan" size={20} color={COLORS.primary} />
              <Text style={styles.scanButtonText}>Barkod Tara</Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Ürün Adı *"
            value={name}
            onChangeText={setName}
            placeholder="Ürün adını girin"
          />

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

          <Input
            label="Açıklama"
            value={description}
            onChangeText={setDescription}
            placeholder="Ürün açıklaması"
            multiline
            numberOfLines={3}
          />
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

        {/* Fiyat ve Stok */}
        <Card>
          <Text style={styles.sectionTitle}>Fiyat ve Stok</Text>
          
          <View style={styles.row}>
            <Input
              label="Alış Fiyatı *"
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
              containerStyle={styles.halfInput}
              leftIcon="currency-try"
            />

            <Input
              label="Satış Fiyatı *"
              value={salePrice}
              onChangeText={setSalePrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
              containerStyle={styles.halfInput}
              leftIcon="currency-try"
            />
          </View>

          <View style={styles.row}>
            <Input
              label="Stok Miktarı *"
              value={stock}
              onChangeText={setStock}
              placeholder="0"
              keyboardType="numeric"
              containerStyle={styles.halfInput}
              editable={sizes.length === 0}
            />

            <Input
              label="Min. Stok *"
              value={minStock}
              onChangeText={setMinStock}
              placeholder="0"
              keyboardType="numeric"
              containerStyle={styles.halfInput}
            />
          </View>

          {sizes.length > 0 && (
            <Text style={styles.helperText}>
              Toplam Stok (Bedenler): {sizes.reduce((sum, s) => sum + s.stock, 0)} adet
            </Text>
          )}

          <Input
            label="Raf Konumu"
            value={shelfLocation}
            onChangeText={setShelfLocation}
            placeholder="Raf-12-C"
          />
        </Card>

        {/* Giyim Özellikleri */}
        <Card>
          <Text style={styles.sectionTitle}>Giyim Özellikleri</Text>
          
          <Input
            label="Marka"
            value={brand}
            onChangeText={setBrand}
            placeholder="Modanisa, Sefamerve, vb."
          />

          <Input
            label="Kumaş"
            value={material}
            onChangeText={setMaterial}
            placeholder="%100 Pamuk, Viskon, vb."
          />

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
                style={[
                  styles.seasonChip,
                  season === s.value && styles.seasonChipSelected
                ]}
                onPress={() => setSeason(s.value)}
              >
                <Text style={[
                  styles.seasonChipText,
                  season === s.value && styles.seasonChipTextSelected
                ]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Desen"
            value={pattern}
            onChangeText={setPattern}
            placeholder="Düz, Çiçekli, Çizgili, vb."
          />

          <Input
            label="Bakım Talimatları"
            value={careInstructions}
            onChangeText={setCareInstructions}
            placeholder="30°C'de yıkayınız"
            multiline
            numberOfLines={2}
          />
        </Card>

        {/* Bedenler */}
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bedenler</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowSizeModal(true)}
            >
              <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
              <Text style={styles.addButtonText}>Ekle</Text>
            </TouchableOpacity>
          </View>

          {sizes.length > 0 ? (
            <View style={styles.itemsGrid}>
              {sizes.map((size, index) => (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{size.size}</Text>
                    <Text style={styles.itemStock}>{size.stock} adet</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveSize(index)}>
                    <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Henüz beden eklenmedi</Text>
          )}
        </Card>

        {/* Renkler */}
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Renkler</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowColorModal(true)}
            >
              <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
              <Text style={styles.addButtonText}>Ekle</Text>
            </TouchableOpacity>
          </View>

          {colors.length > 0 ? (
            <View style={styles.itemsGrid}>
              {colors.map((color, index) => (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    {color.hexCode && (
                      <View
                        style={[styles.colorPreview, { backgroundColor: color.hexCode }]}
                      />
                    )}
                    <View>
                      <Text style={styles.itemName}>{color.name}</Text>
                      <Text style={styles.itemStock}>{color.stock} adet</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveColor(index)}>
                    <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Henüz renk eklenmedi</Text>
          )}
        </Card>

        {/* Tedarikçi */}
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tedarikçi</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowSupplierModal(true)}
            >
              <MaterialCommunityIcons name="truck" size={20} color={COLORS.primary} />
              <Text style={styles.addButtonText}>Seç</Text>
            </TouchableOpacity>
          </View>

          {selectedSupplier ? (
            <View style={styles.selectedSupplier}>
              <View>
                <Text style={styles.supplierName}>{selectedSupplier.name}</Text>
                <Text style={styles.supplierPhone}>{selectedSupplier.phone}</Text>
              </View>
              <TouchableOpacity onPress={() => setSupplierId('')}>
                <MaterialCommunityIcons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.emptyText}>Tedarikçi seçilmedi</Text>
          )}
        </Card>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <Button
          title="Ürünü Kaydet"
          onPress={handleSubmit}
          loading={isLoading}
          icon="check"
        />
      </View>

      {/* Size Modal */}
      <Modal
        visible={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        title="Beden Ekle"
      >
        <Text style={styles.modalLabel}>Hazır Bedenler:</Text>
        <View style={styles.quickSizeGrid}>
          {commonSizes.map((size) => (
            <TouchableOpacity
              key={size}
              style={styles.quickSizeChip}
              onPress={() => setNewSize(size)}
            >
              <Text style={styles.quickSizeText}>{size}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Beden"
          value={newSize}
          onChangeText={setNewSize}
          placeholder="M, L, 38, vb."
        />

        <Input
          label="Stok Miktarı"
          value={newSizeStock}
          onChangeText={setNewSizeStock}
          placeholder="0"
          keyboardType="numeric"
        />

        <View style={styles.modalButtons}>
          <Button
            title="İptal"
            onPress={() => setShowSizeModal(false)}
            variant="secondary"
            style={styles.modalButton}
          />
          <Button
            title="Ekle"
            onPress={handleAddSize}
            style={styles.modalButton}
          />
        </View>
      </Modal>

      {/* Color Modal */}
      <Modal
        visible={showColorModal}
        onClose={() => setShowColorModal(false)}
        title="Renk Ekle"
      >
        <Input
          label="Renk Adı"
          value={newColorName}
          onChangeText={setNewColorName}
          placeholder="Siyah, Beyaz, vb."
        />

        <Input
          label="Renk Kodu (İsteğe bağlı)"
          value={newColorHex}
          onChangeText={setNewColorHex}
          placeholder="#000000"
        />

        <Input
          label="Stok Miktarı"
          value={newColorStock}
          onChangeText={setNewColorStock}
          placeholder="0"
          keyboardType="numeric"
        />

        <View style={styles.modalButtons}>
          <Button
            title="İptal"
            onPress={() => setShowColorModal(false)}
            variant="secondary"
            style={styles.modalButton}
          />
          <Button
            title="Ekle"
            onPress={handleAddColor}
            style={styles.modalButton}
          />
        </View>
      </Modal>

      {/* Supplier Modal */}
      <Modal
        visible={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        title="Tedarikçi Seç"
      >
        <ScrollView style={styles.supplierList}>
          {suppliers?.map((supplier) => (
            <TouchableOpacity
              key={supplier.id}
              style={styles.supplierItem}
              onPress={() => {
                setSupplierId(supplier.id);
                setShowSupplierModal(false);
              }}
            >
              <View>
                <Text style={styles.supplierItemName}>{supplier.name}</Text>
                <Text style={styles.supplierItemPhone}>{supplier.phone}</Text>
              </View>
              {supplierId === supplier.id && (
                <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
          {(!suppliers || suppliers.length === 0) && (
            <Text style={styles.emptyText}>Henüz tedarikçi eklenmemiş</Text>
          )}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  noCategoryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    padding: SPACING.md,
    textAlign: 'center',
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  categoryChipTextSelected: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  seasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  seasonChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  seasonChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  seasonChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  seasonChipTextSelected: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
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
  itemsGrid: {
    gap: SPACING.sm,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  itemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemStock: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  selectedSupplier: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  supplierName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  supplierPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  helperText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: -SPACING.sm,
    marginBottom: SPACING.sm,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  quickSizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  quickSizeChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickSizeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
  supplierList: {
    maxHeight: 300,
  },
  supplierItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.sm,
  },
  supplierItemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  supplierItemPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
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
