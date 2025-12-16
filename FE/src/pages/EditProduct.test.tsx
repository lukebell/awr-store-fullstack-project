import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test/test-utils';
import EditProduct from './EditProduct';
import * as productsApi from '../api/generated/products/products';

vi.mock('../api/generated/products/products');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
  };
});

const mockProduct = {
  id: 1,
  name: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  availableCount: 10,
};

describe('EditProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productsApi.useProductsControllerFindOne).mockReturnValue({
      data: mockProduct,
      isLoading: false,
      error: null,
    } as any);
    vi.mocked(productsApi.useProductsControllerUpdate).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  it('should render the form with product data', async () => {
    render(<EditProduct />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Product Name/i)).toHaveValue('Test Product');
      expect(screen.getByLabelText(/Description/i)).toHaveValue('Test Description');
      expect(screen.getByLabelText(/Price/i)).toHaveValue(99.99);
      expect(screen.getByLabelText(/Available Count/i)).toHaveValue(10);
    });
  });

  it('should display loading state', () => {
    vi.mocked(productsApi.useProductsControllerFindOne).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<EditProduct />);

    expect(screen.getByText(/Loading product.../i)).toBeInTheDocument();
  });

  it('should display error state', () => {
    vi.mocked(productsApi.useProductsControllerFindOne).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    } as any);

    render(<EditProduct />);

    expect(screen.getByText(/Error loading product/i)).toBeInTheDocument();
  });

  it('should update form fields when user types', async () => {
    const user = userEvent.setup();
    render(<EditProduct />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Product Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const priceInput = screen.getByLabelText(/Price/i);
    const countInput = screen.getByLabelText(/Available Count/i);

    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Product');

    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Updated Description');

    await user.clear(priceInput);
    await user.type(priceInput, '149.99');

    await user.clear(countInput);
    await user.type(countInput, '20');

    expect(nameInput).toHaveValue('Updated Product');
    expect(descriptionInput).toHaveValue('Updated Description');
    expect(priceInput).toHaveValue(149.99);
    expect(countInput).toHaveValue(20);
  });

  it('should call updateProduct mutation with correct data on submit', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();

    vi.mocked(productsApi.useProductsControllerUpdate).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    render(<EditProduct />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Product Name/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const priceInput = screen.getByLabelText(/Price/i);
    const countInput = screen.getByLabelText(/Available Count/i);

    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Product');

    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Updated Description');

    await user.clear(priceInput);
    await user.type(priceInput, '149.99');

    await user.clear(countInput);
    await user.type(countInput, '20');

    const submitButton = screen.getByRole('button', { name: /Update/i });
    await user.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith({
      id: 1,
      data: {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 149.99,
        availableCount: 20,
      },
    });
  });

  it('should have minimum price validation in HTML', async () => {
    render(<EditProduct />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
    });

    const priceInput = screen.getByLabelText(/Price/i);

    // HTML5 validation prevents values below min
    expect(priceInput).toHaveAttribute('min', '0.01');
  });

  it('should have minimum available count validation in HTML', async () => {
    render(<EditProduct />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Available Count/i)).toBeInTheDocument();
    });

    const countInput = screen.getByLabelText(/Available Count/i);

    // HTML5 validation prevents negative values
    expect(countInput).toHaveAttribute('min', '0');
  });

  it('should disable submit button when pending', () => {
    vi.mocked(productsApi.useProductsControllerUpdate).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as any);

    render(<EditProduct />);

    const submitButton = screen.getByRole('button', { name: /Updating.../i });
    expect(submitButton).toBeDisabled();
  });

  it('should show "Updating..." text when pending', () => {
    vi.mocked(productsApi.useProductsControllerUpdate).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as any);

    render(<EditProduct />);

    expect(screen.getByRole('button', { name: /Updating.../i })).toBeInTheDocument();
  });

  it('should navigate to admin page on successful update', async () => {
    const user = userEvent.setup();
    let onSuccessCallback: any;

    vi.mocked(productsApi.useProductsControllerUpdate).mockImplementation((options: any) => {
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

    render(<EditProduct />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Update/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('should display error modal on mutation error', async () => {
    const user = userEvent.setup();
    let onErrorCallback: any;

    vi.mocked(productsApi.useProductsControllerUpdate).mockImplementation((options: any) => {
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

    render(<EditProduct />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /Update/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Update Failed')).toBeInTheDocument();
      expect(screen.getByText(/Failed to update product: Server error/i)).toBeInTheDocument();
    });
  });

  it('should require all fields', async () => {
    render(<EditProduct />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Product Name/i)).toBeRequired();
    expect(screen.getByLabelText(/Description/i)).toBeRequired();
    expect(screen.getByLabelText(/Price/i)).toBeRequired();
    expect(screen.getByLabelText(/Available Count/i)).toBeRequired();
  });

  it('should have correct input types and attributes', async () => {
    render(<EditProduct />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
    });

    const priceInput = screen.getByLabelText(/Price/i);
    const countInput = screen.getByLabelText(/Available Count/i);

    expect(priceInput).toHaveAttribute('type', 'number');
    expect(priceInput).toHaveAttribute('min', '0.01');
    expect(priceInput).toHaveAttribute('step', '0.01');

    expect(countInput).toHaveAttribute('type', 'number');
    expect(countInput).toHaveAttribute('min', '0');
    expect(countInput).toHaveAttribute('step', '1');
  });

  it('should display "Cancel" link to admin dashboard', async () => {
    render(<EditProduct />);

    await waitFor(() => {
      expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    });

    const cancelLink = screen.getByText(/Cancel/i);
    expect(cancelLink).toHaveAttribute('href', '/admin');
  });
});
