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
  // Backend'den gelen snake_case'i camelCase'e çevir
  private transformProduct(backendProduct: any): Product {
    return {
      id: backendProduct.id,
      name: backendProduct.name,
      barcode: backendProduct.barcode,
      sku: backendProduct.sku,
      description: backendProduct.description,
      categoryId: backendProduct.category_id,
      category: backendProduct.category,
      purchasePrice: backendProduct.purchase_price,
      salePrice: backendProduct.sale_price,
      stock: backendProduct.stock_quantity,
      minStock: backendProduct.min_stock_level,
      imageUrl: backendProduct.image_url,
      isActive: backendProduct.is_active,
      createdAt: backendProduct.created_at,
      updatedAt: backendProduct.updated_at,
      brand: backendProduct.brand,
      sizes: backendProduct.sizes,
      colors: backendProduct.colors,
    };
  }

  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const response = await apiService.get<any>('/products/', filters);
    
    // Backend response'u transform et
    return {
      items: response.items.map((item: any) => this.transformProduct(item)),
      total: response.total,
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
    };
  }

  async getProduct(id: string): Promise<Product> {
    const response = await apiService.get<any>(`/products/${id}/`);
    return this.transformProduct(response);
  }

  async createProduct(data: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      const backendData = {
        name: data.name,
        barcode: data.barcode || null,
        sku: data.barcode || null,
        description: data.description || null,
        category_id: null,
        purchase_price: data.purchasePrice || 0,
        sale_price: data.salePrice || 0,
        stock_quantity: data.stock || 0,
        min_stock_level: data.minStock || 5,
        image_url: data.imageUrl || null, // Artık images array'ini JSON string olarak saklayacağız
      };
      
      const response = await apiService.post<Product>('/products/', backendData);
      return {
        success: true,
        data: response,
        message: 'Ürün başarıyla oluşturuldu',
      };
    } catch (error: any) {
      const errorDetail = error.response?.data?.detail || 'Ürün oluşturulamadı';
      let userMessage = errorDetail;
      
      if (errorDetail.includes('Barcode already exists')) {
        userMessage = 'Bu barkod zaten sistemde kayıtlı. Lütfen farklı bir barkod girin.';
      } else if (errorDetail.includes('already exists')) {
        userMessage = 'Bu ürün zaten sistemde kayıtlı.';
      }
      
      return {
        success: false,
        message: userMessage,
      };
    }
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      // Frontend'den gelen camelCase'i backend'in beklediği snake_case'e çevir
      const backendData: any = {};
      
      if (data.name !== undefined) backendData.name = data.name;
      if (data.barcode !== undefined) backendData.barcode = data.barcode;
      if (data.sku !== undefined) backendData.sku = data.sku;
      if (data.description !== undefined) backendData.description = data.description;
      if (data.categoryId !== undefined) backendData.category_id = data.categoryId;
      if (data.purchasePrice !== undefined) backendData.purchase_price = data.purchasePrice;
      if (data.salePrice !== undefined) backendData.sale_price = data.salePrice;
      if (data.stock !== undefined) backendData.stock_quantity = data.stock;
      if (data.minStock !== undefined) backendData.min_stock_level = data.minStock;
      if (data.imageUrl !== undefined) backendData.image_url = data.imageUrl;
      if (data.isActive !== undefined) backendData.is_active = data.isActive;
      
      const response = await apiService.put<any>(`/products/${id}`, backendData);
      
      return {
        success: true,
        data: this.transformProduct(response),
        message: 'Ürün başarıyla güncellendi',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Ürün güncellenemedi',
      };
    }
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      await apiService.delete<void>(`/products/${id}`);
      return {
        success: true,
        message: 'Ürün başarıyla silindi',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Ürün silinemedi',
      };
    }
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    return await apiService.patch<Product>(`/products/${id}/stock/`, { quantity });
  }
}

export const productService = new ProductService();
export default productService;
