const API_BASE_URL = 'http://localhost:3000';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  availableCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProducts {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  availableCount: number;
}

export interface OrderProduct {
  id: number;
  quantity: number;
}

export interface CreateOrderDto {
  customerId: string;
  products: OrderProduct[];
}

export interface OrderResponse {
  id: string;
  customerId: string;
  orderCreatedDate: string;
  orderUpdatedDate: string;
  status: string;
  orderTotal: number;
  products: Array<{
    id: number;
    quantity: number;
    name: string;
  }>;
}

// Products API
export const productsApi = {
  getAll: async (page = 1, limit = 100): Promise<PaginatedProducts> => {
    const response = await fetch(`${API_BASE_URL}/products?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  create: async (product: CreateProductDto): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },
};

// Orders API
export const ordersApi = {
  create: async (order: CreateOrderDto): Promise<OrderResponse> => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }
    return response.json();
  },

  getById: async (id: string): Promise<OrderResponse> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    if (!response.ok) throw new Error('Failed to fetch order');
    return response.json();
  },
};
