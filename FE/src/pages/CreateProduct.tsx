import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProductsControllerCreate } from '../api/generated/products/products';
import Modal from '../components/Modal';

function CreateProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    availableCount: '',
  });
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

  const { mutate: createProduct, isPending } = useProductsControllerCreate({
    mutation: {
      onSuccess: () => {
        navigate('/admin');
      },
      onError: (error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unknown error';
        showModal('Creation Failed', `Failed to create product: ${message}`, 'error');
      },
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const price = parseFloat(formData.price);
    const availableCount = parseInt(formData.availableCount, 10);

    if (isNaN(price) || price <= 0) {
      showModal('Invalid Price', 'Please enter a valid price greater than 0', 'warning');
      return;
    }

    if (isNaN(availableCount) || availableCount < 0) {
      showModal('Invalid Count', 'Please enter a valid available count (0 or greater)', 'warning');
      return;
    }

    createProduct({
      data: {
        name: formData.name,
        description: formData.description,
        price,
        availableCount,
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Create New Product</h1>
        <Link
          to="/admin"
          style={{
            padding: '8px 16px',
            background: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          Back to Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="name"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
            }}
          >
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="description"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
            }}
          >
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="price"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
            }}
          >
            Price ($) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0.01"
            step="0.01"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="availableCount"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
            }}
          >
            Available Count *
          </label>
          <input
            type="number"
            id="availableCount"
            name="availableCount"
            value={formData.availableCount}
            onChange={handleChange}
            required
            min="0"
            step="1"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          style={{
            width: '100%',
            padding: '12px',
            background: isPending ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
    </>
  );
}

export default CreateProduct;
