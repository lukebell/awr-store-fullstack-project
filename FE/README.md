# E-Commerce Frontend Application

React + TypeScript + Vite frontend application for the e-commerce platform. This application consumes the backend API and provides a complete shopping experience with product browsing, cart management, and order placement.

## Features

### Stage 1 - Product Catalog & Admin UI
- **Shop Page (/)**: Browse products with "Add to Cart" functionality
- **Admin Dashboard (/admin)**: View all products in a table format with delete functionality
- **Create Product Form (/admin/new)**: Form to create new products with validation

### Stage 2 - Checkout & Order Confirmation
- **Shopping Cart Component**: Sidebar cart with advanced features:
  - Direct quantity input field (in addition to +/- buttons)
  - Real-time inventory validation
  - Out-of-stock detection with warning labels
  - Quantity limit enforcement (can't exceed available stock)
  - Cart persistence via localStorage
  - Automatic validation on cart open and page visibility changes
  - Disabled checkout when cart has invalid items
- **Order Confirmation Page (/orders/:id)**: Display order details after successful placement

### Stage 3 - Inventory Validation
- **Real-time Stock Checking**: Backend endpoint to check product quantities by IDs
- **Cart Validation System**: Validates cart against current inventory before checkout
- **Visual Feedback**: Red warning labels and disabled buttons for invalid quantities
- **Automatic Validation**: Triggers on cart open, page visibility change, and quantity updates
- **Persistence**: Cart data saved in localStorage survives page refreshes

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v7** - Client-side routing
- **TanStack Query (React Query)** - Server state management
- **Axios** - HTTP client for API requests
- **Orval** - API client generator from OpenAPI/Swagger specs
- **React Context API** - Cart state management

## Project Structure

```
FE/
├── src/
│   ├── api/
│   │   ├── generated/          # Auto-generated API client from Swagger
│   │   │   ├── models/         # TypeScript types
│   │   │   ├── products/       # Product API hooks
│   │   │   └── orders/         # Order API hooks
│   │   └── custom-fetch.ts     # Custom axios instance with error handling
│   ├── components/
│   │   └── Cart.tsx            # Shopping cart sidebar component
│   ├── context/
│   │   └── CartContext.tsx     # Cart state management
│   ├── pages/
│   │   ├── Shop.tsx            # Main shop page
│   │   ├── AdminDashboard.tsx  # Admin product management
│   │   ├── CreateProduct.tsx   # Product creation form
│   │   └── OrderConfirmation.tsx # Order confirmation page
│   ├── App.tsx                 # Router configuration
│   └── main.tsx                # App entry point with providers
├── orval.config.ts             # Orval configuration
└── package.json
```

## Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Backend API running** on `http://localhost:3000`

## Setup Instructions

### 1. Install Dependencies

```bash
cd FE
npm i
```

### 2. Ensure Backend is Running

The frontend expects the backend API to be available at `http://localhost:3000`. Make sure the backend is running before starting the frontend.

From the root directory:
```bash
cd BE
docker-compose up -d
```

Or if running locally:
```bash
cd BE
npm run start:dev
```

### 3. Generate API Client (Optional)

The API client is already generated, but if you make changes to the backend API, regenerate it:

```bash
npm run generate:api
```

This command:
- Fetches the OpenAPI spec from `http://localhost:3000/api-json`
- Generates TypeScript types in `src/api/generated/models/`
- Generates React Query hooks in `src/api/generated/products/` and `src/api/generated/orders/`

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run generate:api` - Generate API client from backend Swagger spec
- `npm test` - Run tests in watch mode
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage report

## Usage Guide

### Shopping Flow (Customer)

1. **Browse Products**: Visit the shop page at `/` to see all available products
2. **Add to Cart**: Click "Add to Cart" on any product
3. **Manage Cart**: Click the "Cart" button (top right) to open the cart sidebar
   - Adjust quantities with +/- buttons or type directly in the input field
   - Real-time inventory validation checks stock availability
   - Warning labels appear for out-of-stock or over-quantity items
   - Remove items with the "Remove" button
   - View total price (updated automatically)
4. **Checkout**: Click "Place Order" to create an order
   - Button is disabled if cart contains invalid items
   - Must fix quantity issues before placing order
5. **Confirmation**: You'll be redirected to `/orders/:id` showing your order details
6. **Cart Persistence**: Your cart is saved in localStorage and persists across:
   - Page refreshes
   - Browser restarts
   - Tab switches

### Admin Flow (Product Management)

1. **View Products**: Navigate to `/admin` from the shop page
2. **Create Product**: Click "Create New Product" to go to `/admin/new`
   - Fill in: name, description, price, available count
   - Submit to create the product
3. **Delete Product**: In the admin dashboard, click "Delete" on any product

## Key Features Implementation

### Type-Safe API Client

The app uses Orval to auto-generate TypeScript types and React Query hooks from the backend's Swagger documentation:

```typescript
// Auto-generated hook usage
const { data, isLoading } = useProductsControllerFindAll();
const { mutate: createOrder } = useOrdersControllerCreate();
```

### Cart State Management with Inventory Validation

Cart state is managed via React Context (`CartContext`) with persistent storage and real-time inventory validation. The cart combines **React state** for fast access with **localStorage** for persistence across sessions.

#### Why Both React Context and localStorage?

**React Context** provides:
- Fast in-memory state access while app is running
- Easy component updates and re-renders
- Type-safe cart operations

**localStorage** provides:
- Cart persistence across page refreshes
- Cart preservation when browser closes
- Seamless user experience (cart items survive browser restarts)

**How they work together:**
```typescript
// Initial load: Read from localStorage
const [cart, setCart] = useState(() => {
  const savedCart = localStorage.getItem('cart');
  return savedCart ? JSON.parse(savedCart) : [];
});

// On every change: Save to localStorage
useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(cart));
}, [cart]);
```

#### Available Cart Methods

- `addToCart(product)` - Add product to cart or increment quantity
- `removeFromCart(productId)` - Remove item from cart
- `updateQuantity(productId, quantity)` - Update item quantity (with validation)
- `clearCart()` - Clear all items and validation state
- `getCartTotal()` - Calculate total price
- `getCartCount()` - Get total item count
- `validateCart()` - Manually trigger inventory validation
- `cartValidation` - Array of validation results for each cart item
- `hasInvalidItems` - Boolean indicating if any items are invalid
- `isValidatingCart` - Boolean indicating validation in progress

#### Inventory Validation System

The cart includes real-time inventory validation to ensure customers can only order available products:

**When validation occurs:**
1. **On cart open** - When user opens the cart sidebar
2. **On page visibility change** - When user switches back to the browser tab
3. **On cart size change** - When items are added or removed
4. **After quantity update** - When user changes item quantities

**Validation checks:**
- **Out of stock**: Product has 0 available inventory
- **Exceeds stock**: Requested quantity exceeds available inventory

**User feedback:**
```
⚠️ This product is out of stock. Please remove it from your cart.
⚠️ Only 5 available in stock. Please adjust quantity.
```

**Enforcement:**
- Increment (+) button disabled when max stock reached
- Place Order button disabled when cart has invalid items
- Quantity input field shows red border for invalid items
- Cart items with errors have pink background highlight
- Warning message displayed above Place Order button

#### Cart Validation Flow

```
User opens cart
    ↓
validateCart() called
    ↓
API: POST /products/check-quantities { ids: [1, 2, 3] }
    ↓
Response: [{ id: 1, availableCount: 10 }, ...]
    ↓
Compare cart quantities vs available stock
    ↓
Update cartValidation state
    ↓
UI shows warnings for invalid items
    ↓
Place Order button disabled if hasInvalidItems = true
```

#### Example Usage

```typescript
const {
  cart,
  cartValidation,
  hasInvalidItems,
  addToCart,
  updateQuantity,
  validateCart
} = useCart();

// Add product to cart
addToCart(product);

// Update quantity with automatic validation
updateQuantity(productId, 5);

// Check if cart has validation errors
if (hasInvalidItems) {
  // Show error message
  // Disable checkout button
}

// Get validation for specific item
const validation = cartValidation.find(v => v.productId === productId);
if (validation?.isOutOfStock) {
  // Item is out of stock
}
if (validation?.exceedsStock) {
  // Quantity exceeds available stock
}
```

### Error Handling

- API errors are caught and displayed to users via alerts
- Loading states prevent duplicate requests
- Form validation prevents invalid submissions

### React Query Integration

- Automatic request deduplication
- Background refetching disabled for better UX
- Query invalidation on mutations (e.g., after creating/deleting products)

## Configuration

### API Base URL

To change the backend URL, update two files:

**orval.config.ts**:
```typescript
export default defineConfig({
  api: {
    input: { target: 'http://your-backend-url/api-json' },
    output: { baseUrl: 'http://your-backend-url' }
  }
});
```

Then regenerate the API client: `npm run generate:api`

### React Query Options

Modify query defaults in **src/main.tsx**:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

## Troubleshooting

### Backend Connection Issues

**Error**: "Failed to fetch" or network errors
- Ensure backend is running at `http://localhost:3000`
- Check CORS is enabled on the backend (should be enabled by default)
- Verify the backend Swagger is accessible at `http://localhost:3000/api-json`

### API Client Out of Sync

**Issue**: TypeScript errors about missing properties
- Regenerate the API client: `npm run generate:api`
- Ensure the backend is running when you regenerate

### Build Errors

**Error**: TypeScript compilation errors
- Run `npm run lint` to check for linting issues
- Ensure all dependencies are installed: `npm install`
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

## Development Notes

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`:
   ```typescript
   <Route path="/your-path" element={<YourComponent />} />
   ```

### Using Generated API Hooks

After running `npm run generate:api`, hooks are available:

**Queries** (GET requests):
```typescript
import { useProductsControllerFindAll, useProductsControllerFindOne } from '../api/generated/products/products';

const { data, isLoading, error } = useProductsControllerFindAll();
const { data: product } = useProductsControllerFindOne(productId);
```

**Mutations** (POST, PUT, PATCH, DELETE):
```typescript
import { useProductsControllerCreate } from '../api/generated/products/products';

const { mutate, isPending } = useProductsControllerCreate({
  mutation: {
    onSuccess: (data) => { /* ... */ },
    onError: (error) => { /* ... */ },
  },
});

// Call mutation
mutate({ data: productData });
```

### Custom Axios Instance

The app uses a custom axios instance (`src/api/custom-fetch.ts`) configured in Orval:
- Uses **axios** for HTTP requests (matching the backend's HTTP client library)
- Automatically sets `Content-Type: application/json`
- Includes response interceptor for centralized error handling
- Provides consistent error messages across the application
- Base URL configured to `http://localhost:3000`

## Testing

The application includes comprehensive component tests using **Vitest** and **React Testing Library**.

### Test Stack

- **Vitest** - Fast unit test framework (Vite-native)
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom DOM matchers
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM implementation for Node.js

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

The following components have comprehensive test coverage:

#### CartContext Tests ([src/context/CartContext.test.tsx](src/context/CartContext.test.tsx))
- ✅ Initialize with empty cart
- ✅ Add products to cart
- ✅ Increment quantity for existing products
- ✅ Remove products from cart
- ✅ Update product quantities
- ✅ Clear cart
- ✅ Calculate cart total and count
- ✅ Error handling for missing provider

#### Shop Page Tests ([src/pages/Shop.test.tsx](src/pages/Shop.test.tsx))
- ✅ Loading state display
- ✅ Error state handling
- ✅ Product list rendering
- ✅ Stock availability display
- ✅ Add to cart functionality
- ✅ Disabled state for out-of-stock products
- ✅ Empty state handling

#### Cart Component Tests ([src/components/Cart.test.tsx](src/components/Cart.test.tsx))
- ✅ Cart button with item count
- ✅ Open/close cart sidebar
- ✅ Empty cart message
- ✅ Display cart items
- ✅ Increase/decrease quantities
- ✅ Remove items
- ✅ Calculate and display total
- ✅ Place order functionality
- ✅ Loading states during checkout

#### CreateProduct Page Tests ([src/pages/CreateProduct.test.tsx](src/pages/CreateProduct.test.tsx))
- ✅ Form rendering with all fields
- ✅ Form field validation
- ✅ Submit with valid data
- ✅ Error handling for invalid inputs
- ✅ Loading states during creation
- ✅ Navigation on success
- ✅ Error alerts on failure

### Test Utilities

The project includes custom test utilities ([src/test/test-utils.tsx](src/test/test-utils.tsx)) that wrap components with all necessary providers:
- QueryClientProvider (React Query)
- CartProvider (Cart context)
- BrowserRouter (Routing)

This ensures components are tested in an environment that closely matches production.

### Writing New Tests

When adding new components, create a test file with the `.test.tsx` extension:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

## Production Build

Build the application for production:

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

Preview the production build:

```bash
npm run preview
```

Deploy the `dist/` folder to your hosting service (Vercel, Netlify, AWS S3, etc.).
