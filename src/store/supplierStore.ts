import { create } from 'zustand';
import { Supplier } from '../types';
import supplierService from '../services/supplier.service';

interface SupplierStore {
  suppliers: Supplier[];
  currentSupplier: Supplier | null;
  isLoading: boolean;
  error: string | null;

  fetchSuppliers: (filters?: any) => Promise<void>;
  createSupplier: (data: Partial<Supplier>) => Promise<boolean>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<boolean>;
  deleteSupplier: (id: string) => Promise<boolean>;
  setCurrentSupplier: (supplier: Supplier | null) => void;
  clearError: () => void;
}

export const useSupplierStore = create<SupplierStore>((set) => ({
  suppliers: [],
  currentSupplier: null,
  isLoading: false,
  error: null,

  fetchSuppliers: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await supplierService.getSuppliers(filters);
      set({ suppliers: response.items, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createSupplier: async (data: Partial<Supplier>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await supplierService.createSupplier(data);
      if (response.success && response.data) {
        set((state) => ({
          suppliers: [...state.suppliers, response.data!],
          isLoading: false,
        }));
        return true;
      }
      set({ error: response.message || 'Tedarikçi eklenemedi', isLoading: false });
      return false;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  updateSupplier: async (id: string, data: Partial<Supplier>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await supplierService.updateSupplier(id, data);
      if (response.success && response.data) {
        set((state) => ({
          suppliers: state.suppliers.map((s) => (s.id === id ? response.data! : s)),
          currentSupplier: state.currentSupplier?.id === id ? response.data! : state.currentSupplier,
          isLoading: false,
        }));
        return true;
      }
      set({ error: response.message || 'Tedarikçi güncellenemedi', isLoading: false });
      return false;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  deleteSupplier: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await supplierService.deleteSupplier(id);
      if (response.success) {
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== id),
          currentSupplier: state.currentSupplier?.id === id ? null : state.currentSupplier,
          isLoading: false,
        }));
        return true;
      }
      set({ error: response.message || 'Tedarikçi silinemedi', isLoading: false });
      return false;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  setCurrentSupplier: (supplier) => set({ currentSupplier: supplier }),
  clearError: () => set({ error: null }),
}));
