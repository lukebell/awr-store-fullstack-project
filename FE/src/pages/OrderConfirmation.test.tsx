import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test/test-utils';
import OrderConfirmation from './OrderConfirmation';
import * as ordersApi from '../api/generated/orders/orders';

vi.mock('../api/generated/orders/orders');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-order-id' }),
  };
});

const mockOrder = {
  id: 'test-order-id',
  customerId: 'customer-123',
  status: 'PENDING',
  orderCreatedDate: '2025-12-15T10:00:00Z',
  orderUpdatedDate: '2025-12-15T10:00:00Z',
  orderTotal: 299.98,
  products: [
    {
      id: 1,
      name: 'Product 1',
      price: 99.99,
      quantity: 2,
    },
    {
      id: 2,
      name: 'Product 2',
      price: 49.99,
      quantity: 2,
    },
  ],
};

describe('OrderConfirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ordersApi.useOrdersControllerFindOne).mockReturnValue({
      data: mockOrder,
      isLoading: false,
      error: null,
    } as any);
  });

  it('should render order confirmation with success message', () => {
    render(<OrderConfirmation />);

    expect(screen.getByText(/Order Confirmed!/i)).toBeInTheDocument();
    expect(screen.getByText(/Thank you for your order/i)).toBeInTheDocument();
  });

  it('should display order details correctly', () => {
    render(<OrderConfirmation />);

    expect(screen.getByText(/Order ID:/i)).toBeInTheDocument();
    expect(screen.getByText(mockOrder.id)).toBeInTheDocument();
    expect(screen.getByText(/Customer ID:/i)).toBeInTheDocument();
    expect(screen.getByText(mockOrder.customerId)).toBeInTheDocument();
    expect(screen.getByText(/Status:/i)).toBeInTheDocument();
    expect(screen.getByText(mockOrder.status)).toBeInTheDocument();
  });

  it('should display order date', () => {
    render(<OrderConfirmation />);

    const formattedDate = new Date(mockOrder.orderCreatedDate).toLocaleString();
    expect(screen.getByText(/Order Date:/i)).toBeInTheDocument();
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  it('should display all ordered products', () => {
    render(<OrderConfirmation />);

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('should display product prices correctly', () => {
    render(<OrderConfirmation />);

    const priceElements = screen.getAllByText(/\$99\.99/);
    expect(priceElements.length).toBeGreaterThan(0);
  });

  it('should display product quantities', () => {
    render(<OrderConfirmation />);

    const quantities = screen.getAllByText('2');
    expect(quantities.length).toBeGreaterThan(0);
  });

  it('should calculate and display subtotals correctly', () => {
    render(<OrderConfirmation />);

    // Product 1: 99.99 * 2 = 199.98
    expect(screen.getByText('$199.98')).toBeInTheDocument();
    // Product 2: 49.99 * 2 = 99.98
    expect(screen.getByText('$99.98')).toBeInTheDocument();
  });

  it('should display order total correctly', () => {
    render(<OrderConfirmation />);

    expect(screen.getByText(/Total:/i)).toBeInTheDocument();
    expect(screen.getByText('$299.98')).toBeInTheDocument();
  });

  it('should display "Continue Shopping" link', () => {
    render(<OrderConfirmation />);

    const continueLink = screen.getByText(/Continue Shopping/i);
    expect(continueLink).toBeInTheDocument();
    expect(continueLink).toHaveAttribute('href', '/');
  });

  it('should display loading state', () => {
    vi.mocked(ordersApi.useOrdersControllerFindOne).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<OrderConfirmation />);

    expect(screen.getByText(/Loading order details.../i)).toBeInTheDocument();
  });

  it('should display error state with error message', () => {
    vi.mocked(ordersApi.useOrdersControllerFindOne).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load order'),
    } as any);

    render(<OrderConfirmation />);

    expect(screen.getByText(/Error loading order:/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed to load order/i)).toBeInTheDocument();
  });

  it('should display "Back to Shop" link on error', () => {
    vi.mocked(ordersApi.useOrdersControllerFindOne).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load order'),
    } as any);

    render(<OrderConfirmation />);

    const backLink = screen.getByText(/Back to Shop/i);
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/');
  });

  it('should display not found message when order is null', () => {
    vi.mocked(ordersApi.useOrdersControllerFindOne).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any);

    render(<OrderConfirmation />);

    expect(screen.getByText(/Order not found/i)).toBeInTheDocument();
  });

  it('should display message when order has no products', () => {
    const emptyOrder = {
      ...mockOrder,
      products: [],
    };

    vi.mocked(ordersApi.useOrdersControllerFindOne).mockReturnValue({
      data: emptyOrder,
      isLoading: false,
      error: null,
    } as any);

    render(<OrderConfirmation />);

    expect(screen.getByText(/No items in this order/i)).toBeInTheDocument();
  });

  it('should have correct table headers for items', () => {
    render(<OrderConfirmation />);

    const headers = screen.getAllByRole('columnheader');
    const headerTexts = headers.map(h => h.textContent);

    expect(headerTexts).toContain('Product');
    expect(headerTexts).toContain('Price');
    expect(headerTexts).toContain('Quantity');
    expect(headerTexts).toContain('Subtotal');
  });

  it('should handle order with single product', () => {
    const singleProductOrder = {
      ...mockOrder,
      products: [
        {
          id: 1,
          name: 'Single Product',
          price: 150.00,
          quantity: 1,
        },
      ],
      orderTotal: 150.00,
    };

    vi.mocked(ordersApi.useOrdersControllerFindOne).mockReturnValue({
      data: singleProductOrder,
      isLoading: false,
      error: null,
    } as any);

    render(<OrderConfirmation />);

    expect(screen.getByText('Single Product')).toBeInTheDocument();
    const priceElements = screen.getAllByText('$150.00');
    expect(priceElements.length).toBeGreaterThan(0);
  });

  it('should handle product with zero price gracefully', () => {
    const freeProductOrder = {
      ...mockOrder,
      products: [
        {
          id: 1,
          name: 'Free Product',
          price: 0,
          quantity: 1,
        },
      ],
      orderTotal: 0,
    };

    vi.mocked(ordersApi.useOrdersControllerFindOne).mockReturnValue({
      data: freeProductOrder,
      isLoading: false,
      error: null,
    } as any);

    render(<OrderConfirmation />);

    expect(screen.getByText('Free Product')).toBeInTheDocument();
    const zeroElements = screen.getAllByText('$0.00');
    expect(zeroElements.length).toBeGreaterThan(0);
  });
});
