import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test/test-utils';
import Shop from './Shop';
import * as productsApi from '../api/generated/products/products';

vi.mock('../api/generated/products/products');

const mockProducts = {
  data: [
    {
      id: 1,
      name: 'Product 1',
      description: 'Description 1',
      price: 99.99,
      availableCount: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Product 2',
      description: 'Description 2',
      price: 49.99,
      availableCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Product 3',
      description: 'Description 3',
      price: 149.99,
      availableCount: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 3,
    totalPages: 1,
  },
};

describe('Shop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state', () => {
    vi.mocked(productsApi.useProductsControllerFindAll).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<Shop />);

    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    const errorMessage = 'Failed to fetch products';
    vi.mocked(productsApi.useProductsControllerFindAll).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error(errorMessage),
    } as any);

    render(<Shop />);

    expect(screen.getByText(/Error loading products/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(errorMessage))).toBeInTheDocument();
  });

  it('should display products when loaded successfully', () => {
    vi.mocked(productsApi.useProductsControllerFindAll).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      error: null,
    } as any);

    render(<Shop />);

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('Product 3')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('should show stock availability correctly', () => {
    vi.mocked(productsApi.useProductsControllerFindAll).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      error: null,
    } as any);

    render(<Shop />);

    expect(screen.getByText('10 in stock')).toBeInTheDocument();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    expect(screen.getByText('5 in stock')).toBeInTheDocument();
  });

  it('should disable "Add to Cart" button for out of stock products', () => {
    vi.mocked(productsApi.useProductsControllerFindAll).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      error: null,
    } as any);

    render(<Shop />);

    const addToCartButtons = screen.getAllByRole('button', { name: /Add to Cart/i });

    // Product 2 is out of stock (index 1)
    expect(addToCartButtons[1]).toBeDisabled();
    expect(addToCartButtons[0]).not.toBeDisabled();
    expect(addToCartButtons[2]).not.toBeDisabled();
  });

  it('should add product to cart when "Add to Cart" is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(productsApi.useProductsControllerFindAll).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      error: null,
    } as any);

    render(<Shop />);

    const addToCartButtons = screen.getAllByRole('button', { name: /Add to Cart/i });

    // Click first product's "Add to Cart" button
    await user.click(addToCartButtons[0]);

    // Cart button should show count
    await waitFor(() => {
      expect(screen.getByText(/Cart \(1\)/)).toBeInTheDocument();
    });
  });

  it('should display message when no products available', () => {
    vi.mocked(productsApi.useProductsControllerFindAll).mockReturnValue({
      data: { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
      isLoading: false,
      error: null,
    } as any);

    render(<Shop />);

    expect(screen.getByText('No products available.')).toBeInTheDocument();
  });

  it('should display "Admin Dashboard" link', () => {
    vi.mocked(productsApi.useProductsControllerFindAll).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      error: null,
    } as any);

    render(<Shop />);

    const adminLink = screen.getByRole('link', { name: /Admin Dashboard/i });
    expect(adminLink).toBeInTheDocument();
    expect(adminLink).toHaveAttribute('href', '/admin');
  });

  it('should display all product information', () => {
    vi.mocked(productsApi.useProductsControllerFindAll).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      error: null,
    } as any);

    render(<Shop />);

    // Check first product
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('10 in stock')).toBeInTheDocument();
  });
});
