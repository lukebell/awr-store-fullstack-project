import { useParams, Link } from 'react-router-dom';
import { useOrdersControllerFindOne } from '../api/generated/orders/orders';

function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useOrdersControllerFindOne(id || '');

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading order details...</div>;
  }

  if (error) {
    const errorMessage = (error as Error)?.message || 'Unknown error';
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error loading order: {errorMessage}
        </div>
        <Link
          to="/"
          style={{
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const order = data;

  if (!order) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Order not found.</p>
        <Link
          to="/"
          style={{
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div
        style={{
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ margin: '0 0 8px 0', color: '#155724' }}>Order Confirmed!</h2>
        <p style={{ margin: 0, color: '#155724' }}>
          Thank you for your order. Your order has been successfully placed.
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ color: '#333' }}>Order Details</h3>
        <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '4px' }}>
          <p style={{ margin: '0 0 8px 0', color: '#333' }}>
            <strong>Order ID:</strong> {order.id}
          </p>
          <p style={{ margin: '0 0 8px 0', color: '#333' }}>
            <strong>Customer ID:</strong> {order.customerId}
          </p>
          <p style={{ margin: '0 0 8px 0', color: '#333' }}>
            <strong>Status:</strong>{' '}
            <span
              style={{
                padding: '4px 8px',
                background: '#ffc107',
                color: '#000',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              {order.status}
            </span>
          </p>
          <p style={{ margin: '0 0 8px 0', color: '#333' }}>
            <strong>Order Date:</strong> {new Date(order.orderCreatedDate as string).toLocaleString()}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ color: '#333' }}>Items Ordered</h3>
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
          {order.products && order.products.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#333', fontWeight: 'bold' }}>
                    Product
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#333', fontWeight: 'bold' }}>
                    Price
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#333', fontWeight: 'bold' }}>
                    Quantity
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd', color: '#333', fontWeight: 'bold' }}>
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((item: any, index: number) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px', color: '#e6e6e6ff' }}>{item.name}</td>
                    <td style={{ padding: '12px', color: '#e6e6e6ff' }}>${item.price?.toFixed(2)}</td>
                    <td style={{ padding: '12px', color: '#e6e6e6ff' }}>{item.quantity}</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#e6e6e6ff' }}>
                      ${((item.price || 0) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ padding: '16px', margin: 0, color: '#666' }}>No items in this order.</p>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '4px',
          marginBottom: '24px',
        }}
      >
        <strong style={{ fontSize: '18px', color: '#333' }}>Total:</strong>
        <strong style={{ fontSize: '24px', color: '#28a745' }}>
          ${order.orderTotal.toFixed(2)}
        </strong>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Link
          to="/"
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            textDecoration: 'none',
            textAlign: 'center',
            display: 'block',
          }}
        >
          Continue Shopping
        </Link>

        <Link
              to="/orders"
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                background: '#03c175ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'block',
              }}
            >
              Back to orders
        </Link>
      </div>
    </div>
  );
}

export default OrderConfirmation;
