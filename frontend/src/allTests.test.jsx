import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

// --- IMPORTS ---
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import ProfilePage from './pages/ProfilePage';
import MainLayout from './layouts/MainLayout'; 

// --- MOCKS ---
vi.mock('./pages/HomePage', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual };
});

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Nile E-Commerce Test Suite', () => {

  // 1. LAYOUT & NAVIGATION
  describe('Main Layout (Navigation)', () => {
    it('renders the persistent navbar correctly', () => {
      renderWithRouter(
        <MainLayout>
          <div>Page Content</div>
        </MainLayout>
      );
      // This will pass once you save MainLayout.jsx
      expect(screen.getByText(/NILE/i)).toBeInTheDocument();
      expect(screen.getByText(/Home/i)).toBeInTheDocument();
    });
  });

  // 2. HOME PAGE
  describe('HomePage', () => {
    it('shows search bar', async () => {
      renderWithRouter(<HomePage />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  // 3. PRODUCT PAGE
  describe('ProductPage', () => {
    it('renders basic product details', async () => {
      renderWithRouter(<ProductPage />);
      await waitFor(() => {
        expect(screen.getByText(/Nile Smart Watch/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('allows changing quantity', async () => {
        renderWithRouter(<ProductPage />);
        await waitFor(() => screen.getByText(/Nile Smart Watch/i), { timeout: 3000 });
        
        const plusBtn = screen.getByText('+');
        fireEvent.click(plusBtn);
        fireEvent.click(plusBtn);
        expect(screen.getByText('3')).toBeInTheDocument();
      });
  });

  // 4. AUTH PAGE
  describe('AuthPage', () => {
    it('renders the login form', () => {
      renderWithRouter(<AuthPage />);
      expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument(); 
    });

    it('allows typing in email field', () => {
        renderWithRouter(<AuthPage />);
        // FIXED: Using placeholder "you@example.com" because your labels aren't linked with IDs
        const emailInput = screen.getByPlaceholderText(/you@example.com/i);
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        expect(emailInput.value).toBe('test@example.com');
      });
  });

  // 5. CART PAGE
  describe('CartPage', () => {
    it('renders the cart title', async () => {
      renderWithRouter(<CartPage />);
      // FIXED: Your app says "Shopping Bag", not "Your Cart"
      await waitFor(() => {
          expect(screen.getByText(/Shopping Bag/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows the checkout button', async () => {
        renderWithRouter(<CartPage />);
        // FIXED: Your button says "Checkout (EGP...)", so we match "Checkout" loosely
        await waitFor(() => {
            expect(screen.getByText(/Checkout/i)).toBeInTheDocument();
        }, { timeout: 3000 });
      });
  });

  // 6. CHECKOUT PAGE
  describe('PlaceOrderPage', () => {
    it('renders delivery information form', async () => {
      renderWithRouter(<PlaceOrderPage />);
      // Wait for "Shipping Address" header
      await waitFor(() => {
          expect(screen.getByText(/Shipping Address/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('validates form inputs', async () => {
        renderWithRouter(<PlaceOrderPage />);
        // Wait for page load
        await waitFor(() => {
            expect(screen.getByText(/Shipping Address/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        // FIXED: Use strict regex (^...$) so it doesn't match "123 Nile St, Cairo"
        const cityInput = screen.getByPlaceholderText(/^Cairo$/i);
        
        fireEvent.change(cityInput, { target: { value: 'Giza' } });
        expect(cityInput.value).toBe('Giza');
      });
  });
  // 7. PROFILE PAGE
  describe('ProfilePage', () => {
    it('renders customer details after load', async () => {
      renderWithRouter(<ProfilePage />);
      await waitFor(() => {
        expect(screen.getByText('Samaa Sadek')).toBeInTheDocument();
      }, { timeout: 3000 });
      expect(screen.getByText(/Customer Account/i)).toBeInTheDocument();
    });
  });

});