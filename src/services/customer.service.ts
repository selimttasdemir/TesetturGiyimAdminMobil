import apiService from './api.service';
import { Customer, ApiResponse, PaginatedResponse } from '../types';

interface CustomerFilters {
  search?: string;
  hasBalance?: boolean;
  page?: number;
  pageSize?: number;
}

class CustomerService {
  async getCustomers(filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    return await apiService.get<PaginatedResponse<Customer>>('/customers/', filters);
  }

  async getCustomer(id: string): Promise<Customer> {
    return await apiService.get<Customer>(`/customers/${id}/`);
  }

  async createCustomer(data: Partial<Customer>): Promise<ApiResponse<Customer>> {
    return await apiService.post<ApiResponse<Customer>>('/customers/', data);
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<ApiResponse<Customer>> {
    return await apiService.put<ApiResponse<Customer>>(`/customers/${id}/`, data);
  }

  async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    return await apiService.delete<ApiResponse<void>>(`/customers/${id}/`);
  }

  async getCustomerSales(id: string): Promise<any[]> {
    return await apiService.get(`/customers/${id}/sales/`);
  }

  async addPayment(customerId: string, amount: number, note?: string): Promise<ApiResponse<void>> {
    return await apiService.post<ApiResponse<void>>(`/customers/${customerId}/payment/`, {
      amount,
      note,
    });
  }

  async getCustomersWithDebt(): Promise<Customer[]> {
    return await apiService.get<Customer[]>('/customers/with-debt/');
  }
}

export default new CustomerService();
