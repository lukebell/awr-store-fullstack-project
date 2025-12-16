import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrdersControllerCreate } from '../api/generated/orders/orders';
import Modal from './Modal';

function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount, cartValidation, hasInvalidItems, validateCart } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Validate cart when the cart is opened
  useEffect(() => {
    if (isOpen && cart.length > 0) {
      validateCart();
    }
  }, [isOpen]);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
  });

  const showModal = (title: string, message: string, type: 'error' | 'success' | 'warning' | 'info' = 'error') => {
    setModalState({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const { mutate: createOrder, isPending } = useOrdersControllerCreate({
    mutation: {
      onSuccess: (response) => {
        clearCart();
        const orderId = response.id;
        navigate(`/orders/${orderId}`);
      },
      onError: (error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unknown error';
        showModal('Order Failed', `Failed to create order: ${message}`, 'error');
      },
    },
  });

  const handleCheckout = () => {
    if (cart.length === 0) {
      showModal('Empty Cart', 'Your cart is empty', 'warning');
      return;
    }

    const orderData = {
      customerId: '550e8400-e29b-41d4-a716-446655440000', // Hardcoded UUID for demo
      products: cart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    };

    createOrder({ data: orderData });
  };

  const getItemValidation = (productId: number) => {
    return cartValidation.find((v) => v.productId === productId);
  };

  const handleQuantityInputChange = (productId: number, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      updateQuantity(productId, numValue);
    }
  };

  return (
    <>
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          zIndex: 1000,
        }}
      >
        Cart ({getCartCount()})
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '400px',
            height: '100vh',
            background: 'white',
            boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 999,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Shopping Cart</h2>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
            {cart.length === 0 ? (
              <p style={{ color: '#666' }}>Your cart is empty</p>
            ) : (
              <div>
                {cart.map((item) => {
                  const validation = getItemValidation(item.id);
                  const hasError = validation && (validation.isOutOfStock || validation.exceedsStock);

                  return (
                    <div
                      key={item.id}
                      style={{
                        borderBottom: '1px solid #eee',
                        padding: '16px 0',
                        backgroundColor: hasError ? '#fff5f5' : 'transparent',
                      }}
                    >
                      <h4 style={{ margin: '0 0 8px 0' }}>{item.name}</h4>
                      <p style={{ margin: '0 0 8px 0', color: '#666' }}>
                        ${item.price.toFixed(2)} each
                      </p>

                      {validation?.isOutOfStock && (
                        <div style={{
                          padding: '8px',
                          backgroundColor: '#fee',
                          color: '#c00',
                          borderRadius: '4px',
                          marginBottom: '8px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                        }}>
                          ⚠️ This product is out of stock. Please remove it from your cart.
                        </div>
                      )}

                      {validation && !validation.isOutOfStock && validation.exceedsStock && (
                        <div style={{
                          padding: '8px',
                          backgroundColor: '#fee',
                          color: '#c00',
                          borderRadius: '4px',
                          marginBottom: '8px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                        }}>
                          ⚠️ Only {validation.availableCount} available in stock. Please adjust quantity.
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            padding: '4px 12px',
                            background: '#c616a0ff',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max={validation?.availableCount}
                          value={item.quantity}
                          onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                          style={{
                            width: '60px',
                            padding: '4px 8px',
                            textAlign: 'center',
                            border: hasError ? '2px solid #c00' : '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                          }}
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={validation && item.quantity >= validation.availableCount}
                          style={{
                            padding: '4px 12px',
                            background: validation && item.quantity >= validation.availableCount ? '#ccc' : '#c616a0ff',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: validation && item.quantity >= validation.availableCount ? 'not-allowed' : 'pointer',
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            marginLeft: 'auto',
                            padding: '4px 12px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <p style={{ margin: '8px 0 0 0', fontWeight: 'bold' }}>
                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ borderTop: '2px solid #333', paddingTop: '16px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <strong>Total:</strong>
              <strong>${getCartTotal().toFixed(2)}</strong>
            </div>
            {hasInvalidItems && (
              <div style={{
                padding: '8px',
                backgroundColor: '#fee',
                color: '#c00',
                borderRadius: '4px',
                marginBottom: '12px',
                fontSize: '13px',
                textAlign: 'center',
              }}>
                Please fix cart items before placing order
              </div>
            )}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isPending || hasInvalidItems}
              style={{
                width: '100%',
                padding: '12px',
                background: cart.length > 0 && !isPending && !hasInvalidItems ? '#28a745' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: cart.length > 0 && !isPending && !hasInvalidItems ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {isPending ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Cart;
