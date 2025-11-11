import { create } from 'zustand';
import { Category } from '../types';
import { categoryService } from '../services/category.service';

interface CategoryStore {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;

  fetchCategories: (params?: { search?: string }) => Promise<void>;
  getCategory: (id: string) => Promise<void>;
  createCategory: (data: { name: string; description?: string }) => Promise<void>;
  updateCategory: (id: string, data: { name?: string; description?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setSelectedCategory: (category: Category | null) => void;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,

  fetchCategories: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoryService.getCategories(params);
      set({ categories, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Kategoriler yüklenirken hata oluştu',
        isLoading: false 
      });
    }
  },

  getCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const category = await categoryService.getCategory(id);
      set({ selectedCategory: category, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Kategori yüklenirken hata oluştu',
        isLoading: false 
      });
    }
  },

  createCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await categoryService.createCategory(data);
      set((state) => ({ 
        categories: [...state.categories, newCategory],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Kategori oluşturulurken hata oluştu',
        isLoading: false 
      });
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCategory = await categoryService.updateCategory(id, data);
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? updatedCategory : c)),
        selectedCategory: updatedCategory,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Kategori güncellenirken hata oluştu',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await categoryService.deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Kategori silinirken hata oluştu',
        isLoading: false 
      });
      throw error;
    }
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  clearError: () => set({ error: null }),
}));
