import apiService from './api.service';
import { Product, ApiResponse, PaginatedResponse } from '../types';

interface ProductFilters {
  search?: string;
  category?: string;
  minStock?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

class ProductService {
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    try {
      return await apiService.get<PaginatedResponse<Product>>('/products', filters);
    } catch (error) {
      // Mock data for development - Backend not ready yet
      console.log('Backend not available, returning mock data');
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: filters?.pageSize || 20,
        totalPages: 0,
      };
    }
  }

  async getProduct(id: string): Promise<Product> {
    return await apiService.get<Product>(`/products/${id}`);
  }

  async getProductByBarcode(barcode: string): Promise<Product> {
    return await apiService.get<Product>(`/products/barcode/${barcode}`);
  }

  async createProduct(data: Partial<Product>): Promise<ApiResponse<Product>> {
    return await apiService.post<ApiResponse<Product>>('/products', data);
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    return await apiService.put<ApiResponse<Product>>(`/products/${id}`, data);
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return await apiService.delete<ApiResponse<void>>(`/products/${id}`);
  }

  async getLowStockProducts(): Promise<Product[]> {
    return await apiService.get<Product[]>('/products/low-stock');
  }

  async uploadProductImage(productId: string, imageUri: string): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'product.jpg',
    } as any);

    return await apiService.upload<ApiResponse<string>>(
      `/products/${productId}/image`,
      formData
    );
  }
}

export default new ProductService();
