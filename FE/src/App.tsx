import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Shop from './pages/Shop';
import AdminDashboard from './pages/AdminDashboard';
import CreateProduct from './pages/CreateProduct';
import EditProduct from './pages/EditProduct';
import Orders from './pages/Orders';
import OrderConfirmation from './pages/OrderConfirmation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/new" element={<CreateProduct />} />
        <Route path="/admin/edit/:id" element={<EditProduct />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderConfirmation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
