import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../context/CartContext';
import { vi } from 'vitest';

// Mock the checkQuantities API hook globally for all tests
vi.mock('../api/generated/products/products', () => ({
  useProductsControllerCheckQuantities: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useProductsControllerFindAll: vi.fn(),
  useProductsControllerCreate: vi.fn(),
  useProductsControllerFindOne: vi.fn(),
  useProductsControllerUpdate: vi.fn(),
  useProductsControllerRemove: vi.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();

  // Clear localStorage before rendering to ensure clean state
  localStorage.clear();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </CartProvider>
    </QueryClientProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
