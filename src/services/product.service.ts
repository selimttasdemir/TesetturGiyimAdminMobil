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
      return await apiService.get<PaginatedResponse<Product>>('/products/', filters);
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
    return await apiService.get<Product>(`/products/${id}/`);
  }

  async getProductByBarcode(barcode: string): Promise<Product> {
    return await apiService.get<Product>(`/products/barcode/${barcode}/`);
  }

  async createProduct(data: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      // Backend'in beklediği formata dönüştür
      const backendData = {
        name: data.name,
        barcode: data.barcode || null,
        sku: data.barcode || null, // SKU olarak barkod kullan
        description: data.description || null,
        category_id: null, // Şimdilik kategori ID'si yok
        purchase_price: data.purchasePrice || 0,
        sale_price: data.salePrice || 0,
        stock_quantity: data.stock || 0,
        min_stock_level: data.minStock || 5,
        image_url: null,
      };

      console.log('Sending to backend:', backendData);
      const response = await apiService.post<Product>('/products/', backendData);
      console.log('Backend response:', response);
      
      return {
        success: true,
        data: response,
        message: 'Ürün başarıyla eklendi',
      };
    } catch (error: any) {
      console.error('Product creation error:', error);
      console.error('Error details:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.detail || 'Ürün eklenemedi',
      };
    }
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    return await apiService.put<ApiResponse<Product>>(`/products/${id}/`, data);
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return await apiService.delete<ApiResponse<void>>(`/products/${id}/`);
  }

  async getLowStockProducts(): Promise<Product[]> {
    return await apiService.get<Product[]>('/products/low-stock/');
  }

  async uploadProductImage(productId: string, imageUri: string): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'product.jpg',
    } as any);

    return await apiService.upload<ApiResponse<string>>(
      `/products/${productId}/image/`,
      formData
    );
  }
}

export default new ProductService();
