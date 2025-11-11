import apiService from './api.service';
import { Category } from '../types';

export const categoryService = {
  async getCategories(params?: { search?: string; skip?: number; limit?: number }): Promise<Category[]> {
    return apiService.get<Category[]>('/categories/', params);
  },

  async getCategory(id: string): Promise<Category> {
    return apiService.get<Category>(`/categories/${id}`);
  },

  async createCategory(data: { name: string; description?: string }): Promise<Category> {
    return apiService.post<Category>('/categories/', data);
  },

  async updateCategory(id: string, data: { name?: string; description?: string }): Promise<Category> {
    return apiService.put<Category>(`/categories/${id}`, data);
  },

  async deleteCategory(id: string): Promise<void> {
    return apiService.delete<void>(`/categories/${id}`);
  },

  async getCategoryProductsCount(id: string): Promise<{ category_id: number; product_count: number }> {
    return apiService.get<{ category_id: number; product_count: number }>(`/categories/${id}/products-count`);
  },
};
