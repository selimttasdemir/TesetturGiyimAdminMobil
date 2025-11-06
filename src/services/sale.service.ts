import apiService from './api.service';
import { Sale, ApiResponse, PaginatedResponse } from '../types';

interface CreateSaleRequest {
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  paymentMethod: string;
  customerId?: string;
  discount?: number;
}

interface SaleFilters {
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  customerId?: string;
  cashierId?: string;
  page?: number;
  pageSize?: number;
}

class SaleService {
  async getSales(filters?: SaleFilters): Promise<PaginatedResponse<Sale>> {
    try {
      return await apiService.get<PaginatedResponse<Sale>>('/sales', filters);
    } catch (error) {
      // Mock data for development - Backend not ready yet
      console.log('Backend not available, returning mock data');
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: filters?.pageSize || 10,
        totalPages: 0,
      };
    }
  }

  async getSale(id: string): Promise<Sale> {
    try {
      return await apiService.get<Sale>(`/sales/${id}`);
    } catch (error) {
      throw new Error('Sale not found');
    }
  }

  async createSale(data: CreateSaleRequest): Promise<ApiResponse<Sale>> {
    return await apiService.post<ApiResponse<Sale>>('/sales', data);
  }

  async cancelSale(id: string, reason?: string): Promise<ApiResponse<void>> {
    return await apiService.post<ApiResponse<void>>(`/sales/${id}/cancel`, { reason });
  }

  async getDailySales(date?: string): Promise<Sale[]> {
    return await apiService.get<Sale[]>('/sales/daily', { date });
  }

  async getDailyReport(date?: string): Promise<any> {
    return await apiService.get('/sales/daily-report', { date });
  }

  async generateReceipt(saleId: string): Promise<Blob> {
    return await apiService.get<Blob>(`/sales/${saleId}/receipt`);
  }
}

export default new SaleService();
