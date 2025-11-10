import apiService from './api.service';
import { PurchaseOrder, ApiResponse, PaginatedResponse } from '../types';

interface PurchaseFilters {
  search?: string;
  supplierId?: string;
  status?: string;
  purchasedBy?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

class PurchaseService {
  async getPurchaseOrders(filters?: PurchaseFilters): Promise<PaginatedResponse<PurchaseOrder>> {
    return await apiService.get<PaginatedResponse<PurchaseOrder>>('/purchases/', filters);
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    return await apiService.get<PurchaseOrder>(`/purchases/${id}/`);
  }

  async createPurchaseOrder(data: Partial<PurchaseOrder>): Promise<ApiResponse<PurchaseOrder>> {
    return await apiService.post<ApiResponse<PurchaseOrder>>('/purchases/', data);
  }

  async updatePurchaseOrder(id: string, data: Partial<PurchaseOrder>): Promise<ApiResponse<PurchaseOrder>> {
    return await apiService.put<ApiResponse<PurchaseOrder>>(`/purchases/${id}/`, data);
  }

  async deletePurchaseOrder(id: string): Promise<ApiResponse<void>> {
    return await apiService.delete<ApiResponse<void>>(`/purchases/${id}/`);
  }

  async updatePurchaseStatus(id: string, status: string): Promise<ApiResponse<PurchaseOrder>> {
    return await apiService.put<ApiResponse<PurchaseOrder>>(`/purchases/${id}/status/`, { status });
  }
}

export default new PurchaseService();
