import { Routes, Route } from 'react-router-dom'; 
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import ProductPage from './pages/ProductPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import VendorPage from './pages/VendorPage';
import OrdersPage from './pages/OrdersPage';

function App() {
  return (
      <Routes>
        {/* 1. Auth Page (NO Layout, NO Navigation Bar) */}
        <Route path="/auth" element={<AuthPage />} />

        {/* 2. All Other Pages (Wrapped in MainLayout) */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/prod/:id" element={<ProductPage />} />
                <Route path="/checkout" element={<PlaceOrderPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/vendor" element={<VendorPage />} />
                <Route path="/Order" element={<OrdersPage />} />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
  );
}

export default App;