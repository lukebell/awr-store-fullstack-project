interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
}

function Modal({ isOpen, onClose, title, message, type = 'error' }: ModalProps) {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#d4edda',
          border: '#c3e6cb',
          text: '#155724',
          button: '#28a745',
        };
      case 'warning':
        return {
          bg: '#fff3cd',
          border: '#ffc107',
          text: '#856404',
          button: '#ffc107',
        };
      case 'info':
        return {
          bg: '#d1ecf1',
          border: '#bee5eb',
          text: '#0c5460',
          button: '#17a2b8',
        };
      case 'error':
      default:
        return {
          bg: '#f8d7da',
          border: '#f5c6cb',
          text: '#721c24',
          button: '#dc3545',
        };
    }
  };

  const colors = getColors();

  return (
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
      onClick={onClose}
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
        <div
          style={{
            backgroundColor: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: '4px',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <h3
            style={{
              margin: '0 0 8px 0',
              color: colors.text,
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            {title}
          </h3>
          <p style={{ margin: 0, color: colors.text }}>{message}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: colors.button,
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
