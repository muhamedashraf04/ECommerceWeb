import { Routes, Route } from 'react-router-dom'; 
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import ProductPage from './pages/ProductPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTES (No Navbar/Layout) */}
      <Route path="/auth" element={<AuthPage />} />

      <Route path="/*" element={
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/prod/:id" element={<ProductPage />} />
            <Route path="/checkout" element={<PlaceOrderPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </MainLayout>
      } />
    </Routes>
  );
}

export default App;