import { Routes, Route } from 'react-router-dom'; 
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import ProductPage from './pages/ProductPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';

function App() {
  return (
    <MainLayout>
      <Routes>
        {/* 1. Make HomePage the default "/" path */}
        <Route path="/" element={<HomePage />} />
        
        {/* 2. Other Pages */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/prod" element={<ProductPage />} />
        <Route path="/checkout" element={<PlaceOrderPage />} />

        {/* 3. REMOVED the duplicate "/" and the "/Home" redirect */}
      </Routes>
    </MainLayout>
  );
}

export default App;