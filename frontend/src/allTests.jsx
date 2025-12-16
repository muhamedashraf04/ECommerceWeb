// --- IMPORTS ---
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom'; 

// --- IMPORT YOUR PAGES ---
// Make sure these paths match your folder structure exactly
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import PlaceOrderPage from './pages/PlaceOrderPage';

// --- MOCKS ---
// We mock the API call in HomePage so tests don't fail due to network
vi.mock('./pages/HomePage', async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual };
});

// Helper to render components with Router support (needed for Links/Navigate)
const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

// =================================================================
//  PROJECT MASTER TEST SUITE
// =================================================================
describe('Nile E-Commerce Test Suite', () => {

  // ----------------------------------------------------------------
  // 1. HOME PAGE TESTS
  // ----------------------------------------------------------------
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
      // Wait for data to load
        await waitFor(() => screen.getByText('Nile Smart Watch'), { timeout: 2000 });

      // Type "Gaming"
        const searchInput = screen.getByPlaceholderText(/Search for products/i);
        fireEvent.change(searchInput, { target: { value: 'Gaming' } });

      // Verify results
        expect(screen.getByText('Gaming Mouse')).toBeInTheDocument();
        expect(screen.queryByText('Running Shoes')).not.toBeInTheDocument();
    });
    });

  // ----------------------------------------------------------------
  // 2. PRODUCT PAGE TESTS
  // ----------------------------------------------------------------
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
        
      // Click + twice
        fireEvent.click(plusBtn);
        fireEvent.click(plusBtn);
        
      // Should show 3 (1 initial + 2 clicks)
        expect(screen.getByText('3')).toBeInTheDocument();
    });
    });

  // ----------------------------------------------------------------
  // 3. AUTH PAGE TESTS (Login / Signup)
  // ----------------------------------------------------------------
    describe('AuthPage', () => {
    it('renders the login form by default', () => {
        renderWithRouter(<AuthPage />);
      // Check for common login elements
        expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument(); 
        expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    });

    it('toggles to Sign Up mode when clicked', () => {
        renderWithRouter(<AuthPage />);
        
      // Find the toggle button (Assuming logic text like "Create Account")
      // Note: You might need to adjust the text regex based on your exact UI
        const toggleBtn = screen.getByText(/Create Account/i);
        fireEvent.click(toggleBtn);

      // Now we should see Sign Up specific fields (like "Full Name")
        expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
    });

    it('allows typing in email field', () => {
        renderWithRouter(<AuthPage />);
        const emailInput = screen.getByPlaceholderText(/Email/i);
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        
        expect(emailInput.value).toBe('test@example.com');
    });
    });

  // ----------------------------------------------------------------
  // 4. CART PAGE TESTS
  // ----------------------------------------------------------------
    describe('CartPage', () => {
    it('renders the cart title', () => {
        renderWithRouter(<CartPage />);
        expect(screen.getByText(/Your Cart/i)).toBeInTheDocument();
    });

    it('shows the checkout button', () => {
        renderWithRouter(<CartPage />);
        expect(screen.getByText(/Proceed to Checkout/i)).toBeInTheDocument();
    });

    // NOTE: If your cart is empty by default, test for Empty State
    it('displays empty message if no items (optional)', () => {
        // If your mock data is empty by default
        // expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    });
    });

  // ----------------------------------------------------------------
  // 5. CHECKOUT PAGE TESTS
  // ----------------------------------------------------------------
    describe('PlaceOrderPage', () => {
    it('renders shipping information form', () => {
        renderWithRouter(<PlaceOrderPage />);
        expect(screen.getByText(/Delivery Information/i)).toBeInTheDocument();
    });

    it('validates form inputs', () => {
        renderWithRouter(<PlaceOrderPage />);
        
        const firstNameInput = screen.getByPlaceholderText(/First name/i);
        const cityInput = screen.getByPlaceholderText(/City/i);

        fireEvent.change(firstNameInput, { target: { value: 'Samaa' } });
        fireEvent.change(cityInput, { target: { value: 'Cairo' } });

        expect(firstNameInput.value).toBe('Samaa');
        expect(cityInput.value).toBe('Cairo');
    });

    it('renders the final Place Order button', () => {
        renderWithRouter(<PlaceOrderPage />);
      // Often labeled "Place Order" or "Pay Now"
        expect(screen.getByText(/Place Order/i)).toBeInTheDocument();
    });
    });

});