import { create } from 'zustand';
import { Product } from '../types';
import productService from '../services/product.service';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;

  // Actions
  fetchProducts: (filters?: any) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  createProduct: (data: Partial<Product>) => Promise<boolean>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  clearSelectedProduct: () => void;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,

  fetchProducts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await productService.getProducts(filters);
      set({ 
        products: response.items, 
        isLoading: false,
        totalItems: response.total,
        currentPage: response.page,
        totalPages: response.totalPages,
      });
    } catch (error: any) {
      console.error('Fetch products error:', error);
      set({ 
        error: error.response?.data?.detail || 'Ürünler yüklenirken hata oluştu',
        isLoading: false 
      });
    }
  },

  fetchProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const product = await productService.getProduct(id);
      set({ selectedProduct: product, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ürün bulunamadı',
        isLoading: false,
      });
    }
  },

  searchProducts: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.getProducts({ search: query });
      set({
        products: response.items,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Arama başarısız',
        isLoading: false,
      });
    }
  },

  createProduct: async (data: Partial<Product>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productService.createProduct(data);
      if (response.success) {
        // Refresh the list
        await get().fetchProducts();
        set({ isLoading: false });
        return true;
      } else {
        set({ error: response.message || 'Ürün eklenemedi', isLoading: false });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ürün eklenemedi',
        isLoading: false,
      });
      return false;
    }
  },

  updateProduct: async (id: string, data: Partial<Product>) => {
    set({ isLoading: true, error: null });
    try {
      await productService.updateProduct(id, data);
      // Refresh the list
      await get().fetchProducts();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ürün güncellenemedi',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await productService.deleteProduct(id);
      // Remove from list
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ürün silinemedi',
        isLoading: false,
      });
      throw error;
    }
  },

  clearSelectedProduct: () => set({ selectedProduct: null }),
  clearError: () => set({ error: null }),
}));
