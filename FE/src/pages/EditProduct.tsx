import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProductsControllerFindOne, useProductsControllerUpdate } from '../api/generated/products/products';
import Modal from '../components/Modal';

function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);

  const { data: product, isLoading, error } = useProductsControllerFindOne(productId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);
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

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setAvailableCount(product.availableCount);
    }
  }, [product]);

  const { mutate: updateProduct, isPending } = useProductsControllerUpdate({
    mutation: {
      onSuccess: () => {
        navigate('/admin');
      },
      onError: (error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unknown error';
        showModal('Update Failed', `Failed to update product: ${message}`, 'error');
      },
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (price <= 0) {
      showModal('Invalid Price', 'Please enter a valid price greater than 0', 'warning');
      return;
    }

    if (availableCount < 0) {
      showModal('Invalid Count', 'Available count cannot be negative', 'warning');
      return;
    }

    updateProduct({
      id: productId,
      data: {
        name,
        description,
        price,
        availableCount,
      },
    });
  };

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error loading product
      </div>
    );
  }

  return (
    <>
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />

      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Edit Product</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Product Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        <div>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div>
          <label htmlFor="price" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Price
          </label>
          <input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
            min="0.01"
            step="0.01"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        <div>
          <label htmlFor="availableCount" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Available Count
          </label>
          <input
            id="availableCount"
            type="number"
            value={availableCount}
            onChange={(e) => setAvailableCount(Number(e.target.value))}
            required
            min="0"
            step="1"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={isPending}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              background: isPending ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isPending ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {isPending ? 'Updating...' : 'Update'}
          </button>

          <Link
            to="/admin"
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'block',
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
    </>
  );
}

export default EditProduct;
