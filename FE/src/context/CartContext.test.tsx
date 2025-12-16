import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider, useCart } from './CartContext';
import type { PaginatedProductsResponseDataItem } from '../api/generated/models';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the API hook
vi.mock('../api/generated/products/products', () => ({
  useProductsControllerCheckQuantities: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

const mockProduct: PaginatedProductsResponseDataItem = {
  id: 1,
  name: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  availableCount: 10,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockProduct2: PaginatedProductsResponseDataItem = {
  id: 2,
  name: 'Test Product 2',
  description: 'Test Description 2',
  price: 49.99,
  availableCount: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <CartProvider>{children}</CartProvider>
      </QueryClientProvider>
    );
  };

  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    expect(result.current.cart).toEqual([]);
    expect(result.current.getCartCount()).toBe(0);
    expect(result.current.getCartTotal()).toBe(0);
  });

  it('should add product to cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0]).toEqual({ ...mockProduct, quantity: 1 });
    expect(result.current.getCartCount()).toBe(1);
    expect(result.current.getCartTotal()).toBe(99.99);
  });

  it('should increment quantity when adding existing product', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.addToCart(mockProduct);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(2);
    expect(result.current.getCartCount()).toBe(2);
    expect(result.current.getCartTotal()).toBe(199.98);
  });

  it('should add multiple different products', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.addToCart(mockProduct2);
    });

    expect(result.current.cart).toHaveLength(2);
    expect(result.current.getCartCount()).toBe(2);
    expect(result.current.getCartTotal()).toBe(149.98);
  });

  it('should remove product from cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.addToCart(mockProduct2);
    });

    act(() => {
      result.current.removeFromCart(mockProduct.id);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].id).toBe(mockProduct2.id);
    expect(result.current.getCartTotal()).toBe(49.99);
  });

  it('should update product quantity', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.updateQuantity(mockProduct.id, 5);
    });

    expect(result.current.cart[0].quantity).toBe(5);
    expect(result.current.getCartCount()).toBe(5);
    expect(result.current.getCartTotal()).toBe(499.95);
  });

  it('should remove product when quantity updated to 0', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.updateQuantity(mockProduct.id, 0);
    });

    expect(result.current.cart).toHaveLength(0);
  });

  it('should remove product when quantity updated to negative', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.updateQuantity(mockProduct.id, -1);
    });

    expect(result.current.cart).toHaveLength(0);
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.addToCart(mockProduct2);
    });

    expect(result.current.cart).toHaveLength(2);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cart).toHaveLength(0);
    expect(result.current.getCartCount()).toBe(0);
    expect(result.current.getCartTotal()).toBe(0);
  });

  it('should calculate cart total correctly with multiple items', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.addToCart(mockProduct);
      result.current.addToCart(mockProduct2);
    });

    // (99.99 * 2) + (49.99 * 1) = 249.97
    expect(result.current.getCartTotal()).toBe(249.97);
  });

  it('should throw error when useCart is used outside CartProvider', () => {
    expect(() => {
      renderHook(() => useCart());
    }).toThrow('useCart must be used within a CartProvider');
  });
});
