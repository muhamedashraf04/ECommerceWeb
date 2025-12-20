// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// --- 1. SETUP & IMPORTS ---
expect.extend(matchers);

// IMPORTS
import HomePage from './pages/HomePage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import CartPage from './pages/CartPage.jsx';
import PlaceOrderPage from './pages/PlaceOrderPage.jsx';

// --- 2. GLOBAL MOCKS (The "Anti-Crash" Layer) ---

// A. Mock Navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

// B. Mock LocalStorage
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: () => 'fake-test-token',
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
    },
    writable: true
});

// C. The "Super Mock" Data
const SAFE_PRODUCT = {
    id: 1, Id: 1, productId: 1, ProductId: 1,
    name: "Test Product", Name: "Test Product",
    price: 100, Price: 100,
    description: "Test Desc", Description: "Test Desc",
    category: "Test Cat", Category: "Test Cat",
    image: "https://via.placeholder.com/150", Image: "https://via.placeholder.com/150",
    imageUrl: "https://via.placeholder.com/150", ImageUrl: "https://via.placeholder.com/150",
    qty: 1, Qty: 1, quantity: 1, Quantity: 1
};

// D. Mock Axios (The Critical Fix)
vi.mock('./api/axiosConfig', () => ({
    default: {
        get: vi.fn((url) => {
            // FIX: If the URL is for a specific product, return an OBJECT
            if (url && (url.includes('GetProductByID') || url.includes('/Product/GetProductByID'))) {
                return Promise.resolve({ data: SAFE_PRODUCT });
            }
            // Default: Return an ARRAY for lists (HomePage, ShowCart, etc.)
            return Promise.resolve({ data: [SAFE_PRODUCT] });
        }),
        post: () => Promise.resolve({ data: {} }),
        put: () => Promise.resolve({ data: {} }),
        delete: () => Promise.resolve({ data: {} }),
        patch: () => Promise.resolve({ data: {} }),
    }
}));

// E. Mock Global Fetch (Backup)
global.fetch = vi.fn(async (url) => {
    if (url.includes('/GetProductByID')) {
        return { ok: true, json: async () => SAFE_PRODUCT };
    }
    return { ok: true, json: async () => [SAFE_PRODUCT] };
});

// --- 3. THE TESTS ---

describe('Nile E-Commerce Simple Test Suite', () => {

    afterEach(() => { cleanup(); });

    // TEST 1: HOME PAGE
    it('HomePage: Renders without crashing', async () => {
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );
        expect(screen.getByText(/NILE/i)).toBeInTheDocument();
        await waitFor(() => {
            const items = screen.getAllByText(/Test Product/i);
            expect(items.length).toBeGreaterThan(0);
        });
    });

    // TEST 2: PRODUCT PAGE
    it('ProductPage: Loads product details', async () => {
        render(
            <MemoryRouter initialEntries={['/prod/1']}>
                <Routes>
                    <Route path="/prod/:id" element={<ProductPage />} />
                </Routes>
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        });
    });

    // TEST 3: AUTH PAGE
    it('AuthPage: Shows login input', () => {
        render(
            <MemoryRouter>
                <AuthPage />
            </MemoryRouter>
        );
        const inputs = screen.getAllByPlaceholderText(/you@example.com/i);
        expect(inputs.length).toBeGreaterThan(0);
        fireEvent.change(inputs[0], { target: { value: 'test@test.com' } });
        expect(inputs[0].value).toBe('test@test.com');
    });

    // TEST 4: CART PAGE
    it('CartPage: Shows items and checkout', async () => {
        render(
            <MemoryRouter>
                <CartPage />
            </MemoryRouter>
        );

        // Wait for "Unknown Product" to disappear or "Test Product" to appear
        await waitFor(() => {
            expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        });

        // Debug: Log what is actually rendered if it fails
        // screen.debug(); 

        // Now this should pass because the Mock returns an Object for ID calls
        const items = screen.getAllByText(/Test Product/i);
        expect(items[0]).toBeInTheDocument();
        
        const checkout = screen.getAllByText(/Checkout/i);
        expect(checkout.length).toBeGreaterThan(0);
    });

    // TEST 5: CHECKOUT PAGE
    it('PlaceOrderPage: Renders the form', async () => {
        render(
            <MemoryRouter>
                <PlaceOrderPage />
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        });
        const cityInputs = screen.getAllByPlaceholderText(/Cairo/i);
        expect(cityInputs.length).toBeGreaterThan(0);
    });

});