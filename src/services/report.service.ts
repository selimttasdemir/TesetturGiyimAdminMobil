import api from './api.service';

export interface DashboardStats {
  today_sales: number;
  today_transactions: number;
  monthly_sales: number;
  monthly_transactions: number;
  total_sales: number;
  total_transactions: number;
  low_stock_items: number;
  total_products: number;
}

export interface DailySale {
  date: string;
  amount: number;
  transactions: number;
  avg_ticket: number;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  quantity_sold: number;
  total_revenue: number;
}

export interface RevenueChart {
  date: string;
  revenue: number;
  gross_revenue: number;
  discounts: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  barcode: string;
  current_stock: number;
  min_stock: number;
  shortage: number;
}

const reportService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/reports/dashboard') as any;
    console.log('getDashboardStats response:', response);
    return response;
  },

  async getDailySales(days: number = 7): Promise<DailySale[]> {
    const response = await api.get(`/reports/daily-sales?days=${days}`) as any;
    console.log('getDailySales response:', response);
    return response;
  },

  async getTopProducts(limit: number = 10, days?: number): Promise<TopProduct[]> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (days) params.append('days', days.toString());
    const response = await api.get(`/reports/top-products?${params.toString()}`) as any;
    console.log('getTopProducts response:', response);
    return response;
  },

  async getRevenueChart(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<RevenueChart[]> {
    const response = await api.get(`/reports/revenue-chart?period=${period}`) as any;
    console.log('getRevenueChart response:', response);
    return response;
  },

  async getLowStockProducts(): Promise<LowStockProduct[]> {
    const response = await api.get('/reports/low-stock') as any;
    console.log('getLowStockProducts response:', response);
    return response;
  },
};

export default reportService;
