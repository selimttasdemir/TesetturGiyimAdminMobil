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
import { useResponsiveGrid } from '../../hooks/useResponsiveGrid';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { ConfirmModal, InfoModal } from '../../components/common';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { Category } from '../../types';

export const CategoriesScreen = ({ navigation }: any) => {
    const { categories, fetchCategories, createCategory, updateCategory, deleteCategory, isLoading } = useCategoryStore();
    const { showToast } = useToastStore();
    const gridConfig = useResponsiveGrid(280, 160);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [infoModal, setInfoModal] = useState<{
        visible: boolean;
        title: string;
        message: string;
    }>({ visible: false, title: '', message: '' });

    const showInfo = (title: string, message: string) => {
        setInfoModal({ visible: true, title, message });
    };

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
            showInfo('Hata', 'Kategori adı gereklidir');
            return;
        }

        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, formData);
                showInfo('Başarılı', 'Kategori güncellendi');
            } else {
                await createCategory(formData);
                showInfo('Başarılı', 'Kategori oluşturuldu');
            }
            handleCloseModal();
            loadCategories();
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'İşlem başarısız';
            showInfo('Hata', errorMessage);
        }
    };

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) return;

        setShowDeleteConfirm(false);
        try {
            await deleteCategory(categoryToDelete.id);
            showInfo('Başarılı', 'Kategori silindi');
            loadCategories();
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Kategori silinemedi';
            showInfo('Hata', errorMessage);
        } finally {
            setCategoryToDelete(null);
        }
    };

    const renderCategoryCard = ({ item }: { item: Category }) => (
        <View style={[styles.gridItem, { width: gridConfig.itemWidth }]}>
            <TouchableOpacity
                style={[styles.categoryCard, { minHeight: gridConfig.cardHeight }]}
                activeOpacity={0.7}
                onPress={() => handleOpenModal(item)}
            >
                <View style={styles.categoryIconLarge}>
                    <MaterialCommunityIcons name="tag" size={32} color={COLORS.primary} />
                </View>

                <Text style={styles.categoryName} numberOfLines={2}>
                    {item.name || 'İsimsiz Kategori'}
                </Text>

                {item.description && (
                    <Text style={styles.categoryDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}

                <View style={styles.productCountBadge}>
                    <MaterialCommunityIcons name="hanger" size={14} color={COLORS.primary} />
                    <Text style={styles.productCountText}>
                        {item.product_count || item.productCount || 0} ürün
                    </Text>
                </View>

                <View style={styles.categoryActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleOpenModal(item);
                        }}
                    >
                        <MaterialCommunityIcons name="pencil" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(item);
                        }}
                    >
                        <MaterialCommunityIcons name="delete" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </View>
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
                numColumns={gridConfig.numColumns}
                key={`grid-${gridConfig.numColumns}`}
                columnWrapperStyle={gridConfig.numColumns > 1 ? styles.gridRow : undefined}
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
                <View>
                    <Input
                        label="Kategori Adı *"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        placeholder="Örn: Ferace, Tunik, Şal"
                        style={{ marginBottom: SPACING.md }}
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
                            style={styles.modalButtonFirst}
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

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                visible={showDeleteConfirm}
                title="Kategoriyi Sil"
                message={`"${categoryToDelete?.name}" kategorisini silmek istediğinizden emin misiniz?`}
                icon="delete"
                iconColor={COLORS.error}
                confirmText="Sil"
                cancelText="İptal"
                confirmButtonColor={COLORS.error}
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setCategoryToDelete(null);
                }}
            />

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
        padding: 16,
    },
    gridRow: {
        justifyContent: 'flex-start',
        marginBottom: 16,
        gap: 16,
    },
    gridItem: {
        marginBottom: 16,
    },
    categoryCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        ...(Platform.OS === 'web'
            ? { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
            : { elevation: 2 }) as any,
    },
    categoryIconLarge: {
        width: 64,
        height: 64,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: `${COLORS.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 6,
        textAlign: 'center',
        width: '100%',
        paddingHorizontal: 4,
    },
    categoryDescription: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 8,
        width: '100%',
        paddingHorizontal: 4,
    },
    productCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.primary}10`,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        alignSelf: 'center',
    },
    productCountText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
        marginLeft: 4,
    },
    categoryActions: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        flexDirection: 'row',
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
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
    modalButtons: {
        flexDirection: 'row',
        marginTop: SPACING.md,
    },
    modalButton: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    modalButtonFirst: {
        flex: 1,
        marginLeft: 0,
    },
});
