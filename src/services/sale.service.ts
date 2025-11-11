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
      console.log('Fetching sales with filters:', filters);
      const result = await apiService.get<PaginatedResponse<Sale>>('/sales/', filters);
      console.log('Sales API response:', result);
      return result;
    } catch (error: any) {
      console.error('Error fetching sales:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      // Hata olursa fırlat, mock data döndürme
      throw error;
    }
  }

  async getSale(id: string): Promise<Sale> {
    try {
      console.log('Fetching sale detail for ID:', id);
      const result = await apiService.get<Sale>(`/sales/${id}`);
      console.log('Sale detail response:', result);
      return result;
    } catch (error: any) {
      console.error('Error fetching sale detail:', error);
      console.error('Error response:', error.response?.data);
      throw new Error('Sale not found');
    }
  }

  async createSale(data: CreateSaleRequest): Promise<ApiResponse<Sale>> {
    return await apiService.post<ApiResponse<Sale>>('/sales/', data);
  }

  async cancelSale(id: string, reason?: string): Promise<ApiResponse<void>> {
    return await apiService.post<ApiResponse<void>>(`/sales/${id}/cancel/`, { reason });
  }

  async getDailySales(date?: string): Promise<Sale[]> {
    return await apiService.get<Sale[]>('/sales/daily/', { date });
  }

  async getDailyReport(date?: string): Promise<any> {
    return await apiService.get('/sales/daily-report/', { date });
  }

  async generateReceipt(saleId: string): Promise<Blob> {
    return await apiService.get<Blob>(`/sales/${saleId}/receipt/`);
  }
}

export default new SaleService();
