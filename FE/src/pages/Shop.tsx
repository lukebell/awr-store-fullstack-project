import { Link } from 'react-router-dom';
import { useProductsControllerFindAll } from '../api/generated/products/products';
import { useCart } from '../context/CartContext';
import Cart from '../components/Cart';
import type { PaginatedProductsResponseDataItem } from '../api/generated/models';

function Shop() {
  const { data, isLoading, error } = useProductsControllerFindAll();
  const { addToCart } = useCart();

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading products...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error loading products: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  const products = data?.data || [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ flex: 1, padding: '20px' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Shop</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/orders" style={{ padding: '8px 16px', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
              View Orders
            </Link>
            <Link to="/admin" style={{ padding: '8px 16px', background: '#333', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
              Admin Dashboard
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {products.map((product: PaginatedProductsResponseDataItem) => (
              <div
                key={product.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <h3 style={{ margin: '0 0 8px 0' }}>{product.name}</h3>
                <p style={{ margin: '0 0 8px 0', color: '#666', flex: 1 }}>{product.description}</p>
                <p style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                  ${product.price.toFixed(2)}
                </p>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: product.availableCount > 0 ? '#666' : 'red' }}>
                  {product.availableCount > 0 ? `${product.availableCount} in stock` : 'Out of stock'}
                </p>
                <button
                  onClick={() => addToCart(product as any)}
                  disabled={product.availableCount === 0}
                  style={{
                    padding: '8px 16px',
                    background: product.availableCount > 0 ? '#007bff' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: product.availableCount > 0 ? 'pointer' : 'not-allowed',
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Cart />
    </div>
  );
}

export default Shop;
