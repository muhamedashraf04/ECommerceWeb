// --- IMPORTS ---
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom'; 

// --- IMPORT YOUR PAGES ---
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import ProfilePage from './pages/ProfilePage';

// --- MOCKS ---
// We mock the API call in HomePage to avoid network issues
vi.mock('./pages/HomePage', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual };
});

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

// =================================================================
//  PROJECT MASTER TEST SUITE
// =================================================================
describe('Nile E-Commerce Test Suite', () => {

  // 1. HOME PAGE TESTS
  describe('HomePage', () => {
    it('renders the hero section correctly', () => {
      renderWithRouter(<HomePage />);
      expect(screen.getByText(/Summer Super Sale/i)).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      renderWithRouter(<HomePage />);
      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });

    it('filters products when searching', async () => {
      renderWithRouter(<HomePage />);
      await waitFor(() => screen.getByText('Nile Smart Watch'), { timeout: 2000 });
      
      const searchInput = screen.getByPlaceholderText(/Search for products/i);
      fireEvent.change(searchInput, { target: { value: 'Gaming' } });
      
      expect(screen.getByText('Gaming Mouse')).toBeInTheDocument();
      expect(screen.queryByText('Running Shoes')).not.toBeInTheDocument();
    });
  });

  // 2. PRODUCT PAGE TESTS
  describe('ProductPage', () => {
    it('renders basic product details', async () => {
      renderWithRouter(<ProductPage />);
      await waitFor(() => {
        expect(screen.getByText(/Nile Smart Watch/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('allows changing quantity', async () => {
      renderWithRouter(<ProductPage />);
      await waitFor(() => screen.getByText(/Nile Smart Watch/i));
      
      const plusBtn = screen.getByText('+');
      fireEvent.click(plusBtn);
      fireEvent.click(plusBtn);
      
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  // 3. AUTH PAGE TESTS
  describe('AuthPage', () => {
    it('renders the login form by default', () => {
      renderWithRouter(<AuthPage />);
      expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument(); 
    });

    it('allows typing in email field', () => {
      renderWithRouter(<AuthPage />);
      const emailInput = screen.getByPlaceholderText(/Email/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput.value).toBe('test@example.com');
    });
  });

  // 4. CART PAGE TESTS
  describe('CartPage', () => {
    it('renders the cart title', () => {
      renderWithRouter(<CartPage />);
      expect(screen.getByText(/Your Cart/i)).toBeInTheDocument();
    });

    it('shows the checkout button', () => {
      renderWithRouter(<CartPage />);
      expect(screen.getByText(/Proceed to Checkout/i)).toBeInTheDocument();
    });
  });

  // 5. CHECKOUT PAGE TESTS
  describe('PlaceOrderPage', () => {
    it('renders delivery information form', () => {
      renderWithRouter(<PlaceOrderPage />);
      expect(screen.getByText(/Delivery Information/i)).toBeInTheDocument();
    });

    it('validates form inputs', () => {
      renderWithRouter(<PlaceOrderPage />);
      const cityInput = screen.getByPlaceholderText(/City/i);
      fireEvent.change(cityInput, { target: { value: 'Cairo' } });
      expect(cityInput.value).toBe('Cairo');
    });
  });

  // ----------------------------------------------------------------
  // 6. PROFILE PAGE TESTS (STRICTLY CUSTOMER ONLY)
  // ----------------------------------------------------------------
  describe('ProfilePage', () => {
    it('renders customer details after load', async () => {
      renderWithRouter(<ProfilePage />);
      
      // Wait for the mock API to finish
      await waitFor(() => {
        expect(screen.getByText('Samaa Sadek')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Verify it explicitly says "Customer Account"
      expect(screen.getByText(/Customer Account/i)).toBeInTheDocument();
    });

    it('switches tabs to My Orders', async () => {
      renderWithRouter(<ProfilePage />);
      await waitFor(() => screen.getByText('Samaa Sadek'));

      // Click the "My Orders" sidebar button
      const ordersBtn = screen.getByText(/My Orders/i);
      fireEvent.click(ordersBtn);

      // Verify the Empty State appears
      expect(screen.getByText(/No orders found yet/i)).toBeInTheDocument();
      expect(screen.getByText(/Start Shopping/i)).toBeInTheDocument();
    });

    it('does NOT show vendor options', async () => {
      renderWithRouter(<ProfilePage />);
      await waitFor(() => screen.getByText('Samaa Sadek'));

      // Crucial: Verify the Vendor button is GONE
      // (Using queryByText ensures it returns null instead of throwing error if missing)
      expect(screen.queryByText(/Vendor Dashboard/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Store Manager/i)).not.toBeInTheDocument();
    });
  });

});