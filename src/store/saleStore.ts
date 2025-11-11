import { create } from 'zustand';
import { Sale, Product, SaleItem as SaleItemType } from '../types';
import saleService from '../services/sale.service';

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface SaleState {
  sales: Sale[];
  selectedSale: Sale | null;
  cart: CartItem[];
  isLoading: boolean;
  error: string | null;

  // Cart actions
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  applyDiscount: (productId: string, discount: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartSubtotal: () => number;
  getCartTax: () => number;

  // Sale actions
  fetchSales: (filters?: any) => Promise<void>;
  fetchSale: (id: string) => Promise<void>;
  createSale: (paymentMethod: string, customerId?: string, paidAmount?: number) => Promise<any>;
  clearError: () => void;
}

const TAX_RATE = 0.18; // %18 KDV

export const useSaleStore = create<SaleState>((set, get) => ({
  sales: [],
  selectedSale: null,
  cart: [],
  isLoading: false,
  error: null,

  addToCart: (product: Product, quantity: number) => {
    const cart = get().cart;
    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      // Update quantity
      set({
        cart: cart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                total: (item.quantity + quantity) * item.unitPrice * (1 - item.discount / 100),
              }
            : item
        ),
      });
    } else {
      // Add new item
      set({
        cart: [
          ...cart,
          {
            product,
            quantity,
            unitPrice: product.salePrice,
            discount: 0,
            total: quantity * product.salePrice,
          },
        ],
      });
    }
  },

  removeFromCart: (productId: string) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    }));
  },

  updateCartItem: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    set({
      cart: get().cart.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              total: quantity * item.unitPrice * (1 - item.discount / 100),
            }
          : item
      ),
    });
  },

  applyDiscount: (productId: string, discount: number) => {
    set({
      cart: get().cart.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              discount,
              total: item.quantity * item.unitPrice * (1 - discount / 100),
            }
          : item
      ),
    });
  },

  clearCart: () => set({ cart: [] }),

  getCartSubtotal: () => {
    return get().cart.reduce((sum, item) => sum + item.total, 0);
  },

  getCartTax: () => {
    return get().getCartSubtotal() * TAX_RATE;
  },

  getCartTotal: () => {
    return get().getCartSubtotal() + get().getCartTax();
  },

  fetchSales: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await saleService.getSales(filters);
      console.log('Store received sales:', response);
      // Backend direkt array döndürüyor, PaginatedResponse değil
      const salesArray = Array.isArray(response) ? response : response.items || [];
      set({
        sales: salesArray,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Satışlar yüklenemedi',
        isLoading: false,
      });
    }
  },

  fetchSale: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const sale = await saleService.getSale(id);
      set({ selectedSale: sale, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Satış bulunamadı',
        isLoading: false,
      });
    }
  },

  createSale: async (paymentMethod: string, customerId?: string, paidAmount?: number) => {
    set({ isLoading: true, error: null });
    try {
      const cart = get().cart;
      
      const saleData = {
        items: cart.map((item) => ({
          product_id: parseInt(item.product.id), // Backend integer bekliyor
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount || 0,
        })),
        payment_method: paymentMethod,
        customer_id: customerId ? parseInt(customerId) : undefined,
        paid_amount: paidAmount,
        discount: 0,
        tax: get().getCartTax(),
        notes: '',
      };

      console.log('Sending sale data:', saleData); // Debug için
      const response = await saleService.createSale(saleData as any);
      
      // Clear cart after successful sale
      set({ cart: [], isLoading: false });
      return response;
    } catch (error: any) {
      console.error('Sale creation error:', error.response?.data || error);
      set({
        error: error.response?.data?.detail || error.response?.data?.message || 'Satış oluşturulamadı',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
