import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCategoryStore } from '../../store/categoryStore';
import { useToastStore } from '../../store/toastStore';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { Category } from '../../types';

export const CategoriesScreen = ({ navigation }: any) => {
  const { categories, fetchCategories, createCategory, updateCategory, deleteCategory, isLoading } = useCategoryStore();
  const { showToast } = useToastStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    await fetchCategories();
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      await fetchCategories({ search: query });
    } else {
      await fetchCategories();
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast('error', 'Kategori adı gereklidir');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        showToast('success', 'Kategori güncellendi');
      } else {
        await createCategory(formData);
        showToast('success', 'Kategori oluşturuldu');
      }
      handleCloseModal();
      loadCategories();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'İşlem başarısız';
      showToast('error', errorMessage);
    }
  };

  const handleDelete = async (category: Category) => {
    // Web ve mobil için confirm
    const confirmDelete = Platform.OS === 'web' 
      ? window.confirm(`"${category.name}" kategorisini silmek istediğinize emin misiniz?`)
      : true; // Mobilde direkt sil, toast ile bildir

    if (!confirmDelete) return;

    try {
      await deleteCategory(category.id);
      showToast('success', 'Kategori silindi');
      loadCategories();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Kategori silinemedi';
      showToast('error', errorMessage);
    }
  };

  const renderCategoryCard = ({ item }: { item: Category }) => (
    <Card style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryIcon}>
          <MaterialCommunityIcons name="tag" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.categoryInfo}>
          <View style={styles.categoryTitleRow}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <View style={styles.productCountBadge}>
              <MaterialCommunityIcons name="hanger" size={14} color={COLORS.primary} />
              <Text style={styles.productCountText}>
                {item.product_count || item.productCount || 0}
              </Text>
            </View>
          </View>
          {item.description && (
            <Text style={styles.categoryDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleOpenModal(item)}
        >
          <MaterialCommunityIcons name="pencil" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Kategoriler</Text>
        <Button
          title="Yeni Kategori"
          onPress={() => handleOpenModal()}
          icon="plus"
          style={styles.newButton}
        />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={COLORS.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Kategori ara..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      {/* Categories List */}
      <FlatList
        data={categories}
        renderItem={renderCategoryCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="tag-off" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Henüz kategori yok</Text>
            <Text style={styles.emptySubtext}>Yeni bir kategori ekleyin</Text>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        title={editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
        onClose={handleCloseModal}
      >
        <View style={styles.modalContent}>
          <Input
            label="Kategori Adı *"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Örn: Ferace, Tunik, Şal"
          />
          <Input
            label="Açıklama"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Kategori açıklaması (opsiyonel)"
            multiline
            numberOfLines={3}
          />
          <View style={styles.modalButtons}>
            <Button
              title="İptal"
              onPress={handleCloseModal}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title={editingCategory ? 'Güncelle' : 'Oluştur'}
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.modalButton}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  newButton: {
    paddingHorizontal: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  list: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  productCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
    marginLeft: SPACING.sm,
  },
  productCountText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  categoryDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  modalContent: {
    gap: SPACING.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
});
