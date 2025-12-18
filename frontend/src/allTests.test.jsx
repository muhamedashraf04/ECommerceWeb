// src/AllTests.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom'; 


//import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
//import ProfilePage from './pages/ProfilePage';
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
      expect(screen.getByText(/NILE/i)).toBeInTheDocument();
      expect(screen.getByText(/Home/i)).toBeInTheDocument();
    });
  });
/*
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
      // Wait for loader to vanish and text to appear
      await waitFor(() => {
        expect(screen.getByText(/Nile Smart Watch/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('allows changing quantity', async () => {
        renderWithRouter(<ProductPage />);
        // 1. Wait for loading to finish
        await waitFor(() => screen.getByText(/Nile Smart Watch/i), { timeout: 3000 });
        
        // 2. Now find the button
        const plusBtn = screen.getByText('+');
        fireEvent.click(plusBtn);
        fireEvent.click(plusBtn);
        
        expect(screen.getByText('3')).toBeInTheDocument();
      });
  });
*/
  // 4. AUTH PAGE
  describe('AuthPage', () => {
    it('renders the login form', () => {
      renderWithRouter(<AuthPage />);
      expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument(); 
    });

    it('allows typing in email field', () => {
        renderWithRouter(<AuthPage />);
        
        // FIX: Your placeholder is "you@example.com", NOT "Email"
        // Alternatively, we can find by the Label "Email Address"
        const emailInput = screen.getByLabelText(/Email Address/i);
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        expect(emailInput.value).toBe('test@example.com');
      });
  });

  // 5. CART PAGE
  describe('CartPage', () => {
    it('renders the cart title', async () => {
      renderWithRouter(<CartPage />);
      // FIX: Wait for "Loading your bag..." to finish
      await waitFor(() => {
          expect(screen.getByText(/Your Cart/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows the checkout button', async () => {
        renderWithRouter(<CartPage />);
        // FIX: Wait for loading
        await waitFor(() => {
            expect(screen.getByText(/Proceed to Checkout/i)).toBeInTheDocument();
        }, { timeout: 3000 });
      });
  });

  // 6. CHECKOUT PAGE
  describe('PlaceOrderPage', () => {
    it('renders delivery information form', async () => {
      renderWithRouter(<PlaceOrderPage />);
      // FIX: Wait for "Loading Checkout..." to finish
      await waitFor(() => {
          expect(screen.getByText(/Delivery Information/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('validates form inputs', async () => {
        renderWithRouter(<PlaceOrderPage />);
        
        // FIX: Wait for loading first!
        await waitFor(() => {
            expect(screen.getByText(/Delivery Information/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        const cityInput = screen.getByPlaceholderText(/City/i);
        fireEvent.change(cityInput, { target: { value: 'Cairo' } });
        expect(cityInput.value).toBe('Cairo');
      });
  });
/*
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
*/
});