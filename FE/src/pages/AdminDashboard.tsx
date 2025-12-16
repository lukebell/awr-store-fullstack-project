import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductsControllerFindAll } from '../api/generated/products/products';
import { useProductsControllerRemove } from '../api/generated/products/products';
import { useQueryClient } from '@tanstack/react-query';
import { getProductsControllerFindAllQueryKey } from '../api/generated/products/products';
import Modal from '../components/Modal';

function AdminDashboard() {
  const { data, isLoading, error } = useProductsControllerFindAll();
  const queryClient = useQueryClient();
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
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    productId: number | null;
    productName: string;
  }>({
    isOpen: false,
    productId: null,
    productName: '',
  });

  const showModal = (title: string, message: string, type: 'error' | 'success' | 'warning' | 'info' = 'error') => {
    setModalState({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const { mutate: deleteProduct } = useProductsControllerRemove({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getProductsControllerFindAllQueryKey() });
        setConfirmDelete({ isOpen: false, productId: null, productName: '' });
        showModal('Success', 'Product deleted successfully', 'success');
      },
      onError: (error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unknown error';
        setConfirmDelete({ isOpen: false, productId: null, productName: '' });
        showModal('Deletion Failed', `Failed to delete product: ${message}`, 'error');
      },
    },
  });

  const handleDelete = (id: number, name: string) => {
    setConfirmDelete({ isOpen: true, productId: id, productName: name });
  };

  const confirmDeleteAction = () => {
    if (confirmDelete.productId !== null) {
      deleteProduct({ id: confirmDelete.productId });
    }
  };

  const cancelDelete = () => {
    setConfirmDelete({ isOpen: false, productId: null, productName: '' });
  };

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
    <>
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />

      {/* Confirmation Dialog for Delete */}
      {confirmDelete.isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={cancelDelete}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 24px 0', color: '#666' }}>
              Are you sure you want to delete "{confirmDelete.productName}"?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={cancelDelete}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAction}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            to="/admin/new"
            style={{
              padding: '8px 16px',
              background: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            + New Product
          </Link>
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
      </div>

      {products.length === 0 ? (
        <p>No products found. Create your first product!</p>
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
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Description</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Price</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Stock</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{product.id}</td>
                  <td style={{ padding: '12px' }}>{product.name}</td>
                  <td style={{ padding: '12px' }}>{product.description}</td>
                  <td style={{ padding: '12px' }}>${product.price.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>{product.availableCount}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        to={`/admin/edit/${product.id}`}
                        style={{
                          padding: '6px 12px',
                          background: '#007bff',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          display: 'inline-block',
                        }}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        style={{
                          padding: '6px 12px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  );
}

export default AdminDashboard;
