import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import ProductPage from './pages/ProductPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/prod" element={<ProductPage />} />
        <Route path="/checkout" element={<PlaceOrderPage />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
