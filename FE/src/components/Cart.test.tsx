import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test/test-utils';
import Cart from './Cart';
import { useCart } from '../context/CartContext';
import * as ordersApi from '../api/generated/orders/orders';
import type { PaginatedProductsResponseDataItem } from '../api/generated/models';

vi.mock('../api/generated/orders/orders');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockProduct1: PaginatedProductsResponseDataItem = {
  id: 1,
  name: 'Test Product 1',
  description: 'Description 1',
  price: 99.99,
  availableCount: 10,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockProduct2: PaginatedProductsResponseDataItem = {
  id: 2,
  name: 'Test Product 2',
  description: 'Description 2',
  price: 49.99,
  availableCount: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Helper component to add products to cart
const CartWithProducts = () => {
  const { addToCart } = useCart();

  React.useEffect(() => {
    addToCart(mockProduct1);
    addToCart(mockProduct2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps to only run once

  return <Cart />;
};

describe('Cart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ordersApi.useOrdersControllerCreate).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  it('should display cart button with item count', () => {
    render(<Cart />);

    expect(screen.getByRole('button', { name: /Cart \(0\)/i })).toBeInTheDocument();
  });

  it('should open cart sidebar when cart button is clicked', async () => {
    const user = userEvent.setup();
    render(<Cart />);

    const cartButton = screen.getByRole('button', { name: /Cart/i });
    await user.click(cartButton);

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
  });

  it('should display empty cart message when cart is empty', async () => {
    const user = userEvent.setup();
    render(<Cart />);

    const cartButton = screen.getByRole('button', { name: /Cart/i });
    await user.click(cartButton);

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should close cart when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Cart />);

    const cartButton = screen.getByRole('button', { name: /Cart/i });
    await user.click(cartButton);

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /×/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Shopping Cart')).not.toBeInTheDocument();
    });
  });

  it('should display cart items with correct information', async () => {
    const user = userEvent.setup();
    render(<CartWithProducts />);

    const cartButton = screen.getByRole('button', { name: /Cart \(2\)/i });
    await user.click(cartButton);

    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.getByText('$99.99 each')).toBeInTheDocument();
    expect(screen.getByText('$49.99 each')).toBeInTheDocument();
  });

  it('should increase quantity when + button is clicked', async () => {
    const user = userEvent.setup();
    render(<CartWithProducts />);

    const cartButton = screen.getByRole('button', { name: /Cart/i });
    await user.click(cartButton);

    const plusButtons = screen.getAllByRole('button', { name: '+' });
    await user.click(plusButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cart \(3\)/i })).toBeInTheDocument();
    });
  });

  it('should decrease quantity when - button is clicked', async () => {
    const user = userEvent.setup();
    render(<CartWithProducts />);

    const cartButton = screen.getByRole('button', { name: /Cart/i });
    await user.click(cartButton);

    // First add one more to have quantity of 2
    const plusButtons = screen.getAllByRole('button', { name: '+' });
    await user.click(plusButtons[0]);

    // Then decrease
    const minusButtons = screen.getAllByRole('button', { name: '-' });
    await user.click(minusButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cart \(2\)/i })).toBeInTheDocument();
    });
  });

  it('should remove item when Remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<CartWithProducts />);

    const cartButton = screen.getByRole('button', { name: /Cart \(2\)/i });
    await user.click(cartButton);

    const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
    await user.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Test Product 1')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cart \(1\)/i })).toBeInTheDocument();
    });
  });

  it('should display correct total', async () => {
    const user = userEvent.setup();
    render(<CartWithProducts />);

    const cartButton = screen.getByRole('button', { name: /Cart/i });
    await user.click(cartButton);

    // Total should be 99.99 + 49.99 = 149.98
    expect(screen.getByText('$149.98')).toBeInTheDocument();
  });

  it('should disable Place Order button when cart is empty', async () => {
    const user = userEvent.setup();
    render(<Cart />);

    const cartButton = screen.getByRole('button', { name: /Cart/i });
    await user.click(cartButton);

    const placeOrderButton = screen.getByRole('button', { name: /Place Order/i });
    expect(placeOrderButton).toBeDisabled();
  });

  it('should call createOrder mutation when Place Order is clicked', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();

    vi.mocked(ordersApi.useOrdersControllerCreate).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    render(<CartWithProducts />);

    const cartButton = screen.getByRole('button', { name: /Cart/i });
    await user.click(cartButton);

    const placeOrderButton = screen.getByRole('button', { name: /Place Order/i });
    await user.click(placeOrderButton);

    expect(mockMutate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        customerId: expect.any(String),
        products: expect.arrayContaining([
          { id: 1, quantity: 1 },
          { id: 2, quantity: 1 },
        ]),
      }),
    });
  });

  it('should show processing state when order is being placed', async () => {
    const user = userEvent.setup();
    vi.mocked(ordersApi.useOrdersControllerCreate).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as any);

    render(<CartWithProducts />);

    const cartButton = screen.getByRole('button', { name: /Cart/i });
    await user.click(cartButton);

    expect(screen.getByRole('button', { name: /Processing.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Processing.../i })).toBeDisabled();
  });

  it('should display subtotal for each item', async () => {
    const user = userEvent.setup();
    render(<CartWithProducts />);

    const cartButton = screen.getByRole('button', { name: /Cart/i });
    await user.click(cartButton);

    expect(screen.getByText('Subtotal: $99.99')).toBeInTheDocument();
    expect(screen.getByText('Subtotal: $49.99')).toBeInTheDocument();
  });
});
