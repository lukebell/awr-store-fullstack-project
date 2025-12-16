import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test/test-utils';
import Orders from './Orders';
import * as ordersApi from '../api/generated/orders/orders';
import type { OrderResponse } from '../api/generated/models';

vi.mock('../api/generated/orders/orders');

const mockOrders: OrderResponse[] = [
  {
    id: 'order-1',
    customerId: 'customer-123',
    status: 'DELIVERED',
    orderCreatedDate: '2025-12-15T10:00:00Z',
    orderUpdatedDate: '2025-12-15T10:00:00Z',
    orderTotal: 199.98,
    products: [
      {
        id: 1,
        name: 'Product 1',
        price: 99.99,
        quantity: 2,
      },
    ],
  },
  {
    id: 'order-2',
    customerId: 'customer-456',
    status: 'DISPATCHED',
    orderCreatedDate: '2025-12-14T09:00:00Z',
    orderUpdatedDate: '2025-12-14T09:00:00Z',
    orderTotal: 49.99,
    products: [
      {
        id: 2,
        name: 'Product 2',
        price: 49.99,
        quantity: 1,
      },
    ],
  },
  {
    id: 'order-3',
    customerId: 'customer-789',
    status: 'PENDING',
    orderCreatedDate: '2025-12-13T08:00:00Z',
    orderUpdatedDate: '2025-12-13T08:00:00Z',
    orderTotal: 299.97,
    products: [
      {
        id: 3,
        name: 'Product 3',
        price: 99.99,
        quantity: 3,
      },
    ],
  },
  {
    id: 'order-4',
    customerId: 'customer-101',
    status: 'CANCELLED',
    orderCreatedDate: '2025-12-12T07:00:00Z',
    orderUpdatedDate: '2025-12-12T07:00:00Z',
    orderTotal: 149.98,
    products: [
      {
        id: 4,
        name: 'Product 4',
        price: 74.99,
        quantity: 2,
      },
    ],
  },
];

describe('Orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ordersApi.useOrdersControllerFindAll).mockReturnValue({
      data: mockOrders,
      isLoading: false,
      error: null,
    } as any);
  });

  it('should render page title', () => {
    render(<Orders />);
    expect(screen.getByText('All Orders')).toBeInTheDocument();
  });

  it('should display Back to Shop button', () => {
    render(<Orders />);
    const backButton = screen.getByText(/Back to Shop/i);
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveAttribute('href', '/');
  });

  it('should display loading state', () => {
    vi.mocked(ordersApi.useOrdersControllerFindAll).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<Orders />);
    expect(screen.getByText(/Loading orders.../i)).toBeInTheDocument();
  });

  it('should display error state with error message', () => {
    vi.mocked(ordersApi.useOrdersControllerFindAll).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load orders'),
    } as any);

    render(<Orders />);
    expect(screen.getByText(/Error loading orders:/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed to load orders/i)).toBeInTheDocument();
  });

  it('should display Back to Shop button on error', () => {
    vi.mocked(ordersApi.useOrdersControllerFindAll).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load orders'),
    } as any);

    render(<Orders />);
    const backButton = screen.getByText(/Back to Shop/i);
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveAttribute('href', '/');
  });

  it('should display empty state when no orders exist', () => {
    vi.mocked(ordersApi.useOrdersControllerFindAll).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<Orders />);
    expect(screen.getByText(/No orders found/i)).toBeInTheDocument();
  });

  it('should display all table headers', () => {
    render(<Orders />);
    expect(screen.getByText('Order ID')).toBeInTheDocument();
    expect(screen.getByText('Customer ID')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Order Date')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should display all orders in table', () => {
    render(<Orders />);
    expect(screen.getByText('order-1')).toBeInTheDocument();
    expect(screen.getByText('order-2')).toBeInTheDocument();
    expect(screen.getByText('order-3')).toBeInTheDocument();
    expect(screen.getByText('order-4')).toBeInTheDocument();
  });

  it('should display customer IDs correctly', () => {
    render(<Orders />);
    expect(screen.getByText('customer-123')).toBeInTheDocument();
    expect(screen.getByText('customer-456')).toBeInTheDocument();
    expect(screen.getByText('customer-789')).toBeInTheDocument();
    expect(screen.getByText('customer-101')).toBeInTheDocument();
  });

  it('should display all order statuses', () => {
    render(<Orders />);
    expect(screen.getByText('DELIVERED')).toBeInTheDocument();
    expect(screen.getByText('DISPATCHED')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('CANCELLED')).toBeInTheDocument();
  });

  it('should display order totals correctly', () => {
    render(<Orders />);
    expect(screen.getByText('$199.98')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText('$299.97')).toBeInTheDocument();
    expect(screen.getByText('$149.98')).toBeInTheDocument();
  });

  it('should display formatted order dates', () => {
    render(<Orders />);
    const date1 = new Date('2025-12-15T10:00:00Z').toLocaleDateString();
    const date2 = new Date('2025-12-14T09:00:00Z').toLocaleDateString();
    const date3 = new Date('2025-12-13T08:00:00Z').toLocaleDateString();
    const date4 = new Date('2025-12-12T07:00:00Z').toLocaleDateString();

    expect(screen.getByText(date1)).toBeInTheDocument();
    expect(screen.getByText(date2)).toBeInTheDocument();
    expect(screen.getByText(date3)).toBeInTheDocument();
    expect(screen.getByText(date4)).toBeInTheDocument();
  });

  it('should display View Details links for all orders', () => {
    render(<Orders />);
    const viewDetailsLinks = screen.getAllByText(/View Details/i);
    expect(viewDetailsLinks).toHaveLength(4);
  });

  it('should have correct href for View Details links', () => {
    render(<Orders />);
    const viewDetailsLinks = screen.getAllByText(/View Details/i);

    expect(viewDetailsLinks[0]).toHaveAttribute('href', '/orders/order-1');
    expect(viewDetailsLinks[1]).toHaveAttribute('href', '/orders/order-2');
    expect(viewDetailsLinks[2]).toHaveAttribute('href', '/orders/order-3');
    expect(viewDetailsLinks[3]).toHaveAttribute('href', '/orders/order-4');
  });

  it('should handle single order', () => {
    const singleOrder: OrderResponse[] = [
      {
        id: 'single-order',
        customerId: 'customer-999',
        status: 'PENDING',
        orderCreatedDate: '2025-12-15T12:00:00Z',
        orderUpdatedDate: '2025-12-15T12:00:00Z',
        orderTotal: 99.99,
        products: [
          {
            id: 5,
            name: 'Product 5',
            price: 99.99,
            quantity: 1,
          },
        ],
      },
    ];

    vi.mocked(ordersApi.useOrdersControllerFindAll).mockReturnValue({
      data: singleOrder,
      isLoading: false,
      error: null,
    } as any);

    render(<Orders />);
    expect(screen.getByText('single-order')).toBeInTheDocument();
    expect(screen.getByText('customer-999')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('should handle order with zero total', () => {
    const freeOrder: OrderResponse[] = [
      {
        id: 'free-order',
        customerId: 'customer-000',
        status: 'DELIVERED',
        orderCreatedDate: '2025-12-15T12:00:00Z',
        orderUpdatedDate: '2025-12-15T12:00:00Z',
        orderTotal: 0,
        products: [],
      },
    ];

    vi.mocked(ordersApi.useOrdersControllerFindAll).mockReturnValue({
      data: freeOrder,
      isLoading: false,
      error: null,
    } as any);

    render(<Orders />);
    expect(screen.getByText('free-order')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('should render table with correct structure', () => {
    render(<Orders />);
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should have correct number of rows', () => {
    render(<Orders />);
    const rows = screen.getAllByRole('row');
    // 1 header row + 4 data rows = 5 total
    expect(rows).toHaveLength(5);
  });
});
