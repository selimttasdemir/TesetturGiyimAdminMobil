import apiService from './api.service';
import { Supplier, ApiResponse, PaginatedResponse } from '../types';

interface SupplierFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

class SupplierService {
  async getSuppliers(filters?: SupplierFilters): Promise<PaginatedResponse<Supplier>> {
    return await apiService.get<PaginatedResponse<Supplier>>('/suppliers/', filters);
  }

  async getSupplier(id: string): Promise<Supplier> {
    return await apiService.get<Supplier>(`/suppliers/${id}/`);
  }

  async createSupplier(data: Partial<Supplier>): Promise<ApiResponse<Supplier>> {
    try {
      console.log('Creating supplier with data:', data);
      const response = await apiService.post<Supplier>('/suppliers/', data);
      console.log('Supplier created successfully:', response);
      // Backend returns Supplier directly, wrap it in ApiResponse
      return {
        success: true,
        data: response,
        message: 'Tedarikçi başarıyla oluşturuldu',
      };
    } catch (error: any) {
      console.error('Supplier creation error:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.detail || 'Tedarikçi oluşturulamadı',
      };
    }
  }

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<ApiResponse<Supplier>> {
    try {
      const response = await apiService.put<Supplier>(`/suppliers/${id}/`, data);
      return {
        success: true,
        data: response,
        message: 'Tedarikçi başarıyla güncellendi',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Tedarikçi güncellenemedi',
      };
    }
  }

  async deleteSupplier(id: string): Promise<ApiResponse<void>> {
    try {
      await apiService.delete<void>(`/suppliers/${id}/`);
      return {
        success: true,
        message: 'Tedarikçi başarıyla silindi',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Tedarikçi silinemedi',
      };
    }
  }

  async getSupplierProducts(supplierId: string): Promise<any[]> {
    return await apiService.get<any[]>(`/suppliers/${supplierId}/products/`);
  }
}

export default new SupplierService();
