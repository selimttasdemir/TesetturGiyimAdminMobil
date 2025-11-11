// Kullanıcı Tipleri
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export enum UserRole {
  ADMIN = 'admin',
  ADMIN_1 = 'admin_1', // İlk Admin
  ADMIN_2 = 'admin_2', // İkinci Admin
  MANAGER = 'manager',
  CASHIER = 'cashier',
  STOCK_KEEPER = 'stock_keeper'
}

// Ürün Tipleri - Giyim Mağazası
export interface Product {
  id: string;
  barcode: string;
  sku?: string; // SKU (Stock Keeping Unit)
  name: string;
  category?: Category;
  categoryId?: string;
  description?: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit?: ProductUnit;
  shelfLocation?: string;
  supplier?: Supplier;
  image?: string;
  imageUrl?: string;
  images?: string[]; // Çoklu ürün görselleri
  isActive: boolean;
  
  // Giyim spesifik özellikler
  sizes?: ClothingSize[]; // Bedenler (S, M, L, XL, 36, 38, vb)
  colors?: ClothingColor[]; // Renkler
  material?: string; // Kumaş (Pamuk, Viskon, Polyester vb)
  brand?: string; // Marka
  season?: Season; // Sezon (Yaz, Kış, İlkbahar/Sonbahar, 4 Mevsim)
  pattern?: string; // Desen (Düz, Çiçekli, Çizgili vb)
  careInstructions?: string; // Bakım talimatları
  
  createdAt?: string;
  updatedAt?: string;
}

// Beden Tipleri
export interface ClothingSize {
  size: string; // 'XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', vb
  stock: number;
}

// Renk Tipleri
export interface ClothingColor {
  name: string; // 'Siyah', 'Beyaz', 'Lacivert', 'Mürdüm' vb
  hexCode?: string; // '#000000'
  stock: number;
}

// Sezon
export enum Season {
  SUMMER = 'yaz',
  WINTER = 'kış',
  SPRING_FALL = 'ilkbahar_sonbahar',
  ALL_SEASON = 'dort_mevsim'
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  createdAt?: string;
  product_count?: number;
  productCount?: number;
  icon?: string;
  color?: string;
}

export enum ProductUnit {
  PIECE = 'adet',
  KG = 'kg',
  GRAM = 'gram',
  LITER = 'litre',
  BOX = 'kutu',
  PACKAGE = 'paket'
}

// Tedarikçi Tipleri
export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  createdAt: string;
}

// Satın Alma / Tedarik Tipleri
export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: Supplier;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: PurchaseOrderStatus;
  purchasedBy: User; // Hangi admin aldı
  notes?: string;
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
  // Giyim için ek alanlar
  sizes?: { size: string; quantity: number }[];
  colors?: { name: string; quantity: number }[];
}

export enum PurchaseOrderStatus {
  DRAFT = 'taslak',
  ORDERED = 'siparis_verildi',
  DELIVERED = 'teslim_edildi',
  CANCELLED = 'iptal_edildi'
}

// Satış Tipleri
export interface Sale {
  id: string;
  saleNumber: string;
  sale_number?: string; // Backend snake_case version
  items: SaleItem[];
  subtotal: number;
  totalAmount: number; // Backend'den gelen totalAmount
  total_amount?: number; // Backend snake_case version
  tax: number;
  discount: number;
  total: number;
  finalAmount: number;
  final_amount?: number; // Backend snake_case version
  paymentMethod: PaymentMethod | string;
  payment_method?: string; // Backend snake_case version
  paidAmount: number;
  paid_amount?: number; // Backend snake_case version
  remainingAmount: number;
  remaining_amount?: number; // Backend snake_case version
  customer?: Customer;
  customerId?: string;
  customer_id?: number; // Backend snake_case version
  cashier: User;
  userId?: string;
  user_id?: number; // Backend snake_case version
  isPaid: boolean;
  status: string;
  notes?: string;
  createdAt: string;
  created_at?: string; // Backend snake_case version
}

export interface SaleItem {
  id?: number;
  saleId?: number;
  productId: number;
  product_id?: number; // Backend snake_case version
  product?: {
    id: number;
    name: string;
    sku: string;
    barcode?: string;
  };
  quantity: number;
  unitPrice: number;
  unit_price?: number; // Backend snake_case version
  discount: number;
  subtotal: number;
}

export enum PaymentMethod {
  CASH = 'nakit',
  CARD = 'kart',
  CREDIT = 'veresiye',
  MIXED = 'karma'
}

// Müşteri Tipleri
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number; // Veresiye borç
  loyaltyPoints: number;
  totalPurchase: number;
  lastPurchaseDate?: string;
  createdAt: string;
}

// Stok Tipleri
export interface StockMovement {
  id: string;
  product: Product;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  user: User;
  createdAt: string;
}

export enum StockMovementType {
  IN = 'giriş',
  OUT = 'çıkış',
  ADJUSTMENT = 'düzeltme',
  RETURN = 'iade'
}

// Rapor Tipleri
export interface DailySalesReport {
  date: string;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  totalTransactions: number;
  paymentMethods: {
    cash: number;
    card: number;
    credit: number;
  };
  topProducts: {
    product: Product;
    quantity: number;
    revenue: number;
  }[];
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  categoryBreakdown: {
    category: Category;
    count: number;
    value: number;
  }[];
}

// Bildirim Tipleri
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export enum NotificationType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  NEW_ORDER = 'new_order',
  PAYMENT_DUE = 'payment_due',
  SYSTEM = 'system'
}

// API Response Tipleri
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Navigation Tipleri
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Sales: undefined;
  Customers: undefined;
  Reports: undefined;
  Settings: undefined;
};

export type ProductStackParamList = {
  ProductList: undefined;
  ProductDetail: { productId: string };
  AddProduct: undefined;
  EditProduct: { productId: string };
  BarcodeScanner: { onBarcodeScanned: (barcode: string) => void };
};

export type SupplierStackParamList = {
  SupplierList: undefined;
  SupplierDetail: { supplierId: string };
  AddSupplier: undefined;
  EditSupplier: { supplierId: string };
};

export type PurchaseStackParamList = {
  PurchaseList: undefined;
  PurchaseDetail: { purchaseId: string };
  NewPurchase: undefined;
};

export type SalesStackParamList = {
  SalesList: undefined;
  NewSale: undefined;
  SaleDetail: { saleId: string };
};

export type CustomerStackParamList = {
  CustomerList: undefined;
  CustomerDetail: { customerId: string };
  AddCustomer: undefined;
  EditCustomer: { customerId: string };
};
