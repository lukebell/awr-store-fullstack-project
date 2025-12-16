import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test/test-utils';
import CreateProduct from './CreateProduct';
import * as productsApi from '../api/generated/products/products';

vi.mock('../api/generated/products/products');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CreateProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productsApi.useProductsControllerCreate).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  it('should render the form with all fields', () => {
    render(<CreateProduct />);

    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Available Count/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument();
  });

  it('should display "Back to Dashboard" link', () => {
    render(<CreateProduct />);

    const backLink = screen.getByRole('link', { name: /Back to Dashboard/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/admin');
  });

  it('should update form fields when user types', async () => {
    const user = userEvent.setup();
    render(<CreateProduct />);

    const nameInput = screen.getByLabelText(/Product Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const priceInput = screen.getByLabelText(/Price/i);
    const countInput = screen.getByLabelText(/Available Count/i);

    await user.type(nameInput, 'New Product');
    await user.type(descriptionInput, 'This is a test product');
    await user.type(priceInput, '99.99');
    await user.type(countInput, '10');

    expect(nameInput).toHaveValue('New Product');
    expect(descriptionInput).toHaveValue('This is a test product');
    expect(priceInput).toHaveValue(99.99);
    expect(countInput).toHaveValue(10);
  });

  it('should call createProduct mutation with correct data on submit', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();

    vi.mocked(productsApi.useProductsControllerCreate).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    render(<CreateProduct />);

    await user.type(screen.getByLabelText(/Product Name/i), 'Test Product');
    await user.type(screen.getByLabelText(/Description/i), 'Test Description');
    await user.type(screen.getByLabelText(/Price/i), '99.99');
    await user.type(screen.getByLabelText(/Available Count/i), '10');

    const submitButton = screen.getByRole('button', { name: /Create/i });
    await user.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith({
      data: {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        availableCount: 10,
      },
    });
  });

  it('should have minimum price validation in HTML', () => {
    render(<CreateProduct />);

    const priceInput = screen.getByLabelText(/Price/i);

    // HTML5 validation prevents values below min
    expect(priceInput).toHaveAttribute('min', '0.01');
  });

  it('should accept zero as valid available count', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();

    vi.mocked(productsApi.useProductsControllerCreate).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    render(<CreateProduct />);

    await user.type(screen.getByLabelText(/Product Name/i), 'Test Product');
    await user.type(screen.getByLabelText(/Description/i), 'Test Description');
    await user.type(screen.getByLabelText(/Price/i), '99.99');
    await user.type(screen.getByLabelText(/Available Count/i), '0');

    const submitButton = screen.getByRole('button', { name: /Create/i });
    await user.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        availableCount: 0,
      }),
    });
  });

  it('should disable submit button when pending', () => {
    vi.mocked(productsApi.useProductsControllerCreate).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as any);

    render(<CreateProduct />);

    const submitButton = screen.getByRole('button', { name: /Creating.../i });
    expect(submitButton).toBeDisabled();
  });

  it('should show "Creating..." text when pending', () => {
    vi.mocked(productsApi.useProductsControllerCreate).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as any);

    render(<CreateProduct />);

    expect(screen.getByRole('button', { name: /Creating.../i })).toBeInTheDocument();
  });

  it('should navigate to admin page on successful creation', async () => {
    const user = userEvent.setup();
    let onSuccessCallback: any;

    vi.mocked(productsApi.useProductsControllerCreate).mockImplementation((options: any) => {
      onSuccessCallback = options?.mutation?.onSuccess;
      return {
        mutate: vi.fn(() => {
          if (onSuccessCallback) {
            onSuccessCallback();
          }
        }),
        isPending: false,
      } as any;
    });

    render(<CreateProduct />);

    await user.type(screen.getByLabelText(/Product Name/i), 'Test Product');
    await user.type(screen.getByLabelText(/Description/i), 'Test Description');
    await user.type(screen.getByLabelText(/Price/i), '99.99');
    await user.type(screen.getByLabelText(/Available Count/i), '10');

    const submitButton = screen.getByRole('button', { name: /Create/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('should require all fields', () => {
    render(<CreateProduct />);

    expect(screen.getByLabelText(/Product Name/i)).toBeRequired();
    expect(screen.getByLabelText(/Description/i)).toBeRequired();
    expect(screen.getByLabelText(/Price/i)).toBeRequired();
    expect(screen.getByLabelText(/Available Count/i)).toBeRequired();
  });

  it('should have correct input types and attributes', () => {
    render(<CreateProduct />);

    const priceInput = screen.getByLabelText(/Price/i);
    const countInput = screen.getByLabelText(/Available Count/i);

    expect(priceInput).toHaveAttribute('type', 'number');
    expect(priceInput).toHaveAttribute('min', '0.01');
    expect(priceInput).toHaveAttribute('step', '0.01');

    expect(countInput).toHaveAttribute('type', 'number');
    expect(countInput).toHaveAttribute('min', '0');
    expect(countInput).toHaveAttribute('step', '1');
  });

  it('should display error modal on mutation error', async () => {
    const user = userEvent.setup();
    let onErrorCallback: any;

    vi.mocked(productsApi.useProductsControllerCreate).mockImplementation((options: any) => {
      onErrorCallback = options?.mutation?.onError;
      return {
        mutate: vi.fn(() => {
          if (onErrorCallback) {
            onErrorCallback(new Error('Server error'));
          }
        }),
        isPending: false,
      } as any;
    });

    render(<CreateProduct />);

    await user.type(screen.getByLabelText(/Product Name/i), 'Test Product');
    await user.type(screen.getByLabelText(/Description/i), 'Test Description');
    await user.type(screen.getByLabelText(/Price/i), '99.99');
    await user.type(screen.getByLabelText(/Available Count/i), '10');

    const submitButton = screen.getByRole('button', { name: /Create/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Creation Failed')).toBeInTheDocument();
      expect(screen.getByText(/Failed to create product: Server error/i)).toBeInTheDocument();
    });
  });
});
