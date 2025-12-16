import { Link } from 'react-router-dom';
import { useOrdersControllerFindAll } from '../api/generated/orders/orders';
import type { OrderResponse } from '../api/generated/models';

function Orders() {
  const { data, isLoading, error } = useOrdersControllerFindAll();

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading orders...</div>;
  }

  if (error) {
    const errorMessage = (error as Error)?.message || 'Unknown error';
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error loading orders: {errorMessage}
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

  const orders = data || [];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#e6e6e6ff' }}>All Orders</h1>
        <Link
          to="/"
          style={{
            padding: '8px 16px',
            background: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          Back to Shop
        </Link>
      </div>

      {orders.length === 0 ? (
        <p style={{ color: '#e6e6e6ff' }}>No orders found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #ddd',
            }}
          >
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#333', fontWeight: 'bold' }}>
                  Order ID
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#333', fontWeight: 'bold' }}>
                  Customer ID
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#333', fontWeight: 'bold' }}>
                  Status
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#333', fontWeight: 'bold' }}>
                  Total
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#333', fontWeight: 'bold' }}>
                  Order Date
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#333', fontWeight: 'bold' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: OrderResponse) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px', color: '#e6e6e6ff' }}>{order.id}</td>
                  <td style={{ padding: '12px', color: '#e6e6e6ff' }}>{order.customerId}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        background:
                          order.status === 'DELIVERED' ? '#28a745' :
                          order.status === 'DISPATCHED' ? '#17a2b8' :
                          order.status === 'CANCELLED' ? '#dc3545' :
                          '#ffc107',
                        color: order.status === 'PENDING' ? '#000' : '#fff',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#e6e6e6ff', fontWeight: 'bold' }}>
                    ${order.orderTotal.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', color: '#e6e6e6ff' }}>
                    {new Date(order.orderCreatedDate as string).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Link
                      to={`/orders/${order.id}`}
                      style={{
                        padding: '6px 12px',
                        background: '#007bff',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                      }}
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Orders;
