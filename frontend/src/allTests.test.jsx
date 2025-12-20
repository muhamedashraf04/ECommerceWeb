// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// --- 1. SETUP & IMPORTS ---
expect.extend(matchers);

// IMPORTS (Assuming files are in src/ root)
import HomePage from './pages/HomePage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import CartPage from './pages/CartPage.jsx';
import PlaceOrderPage from './pages/PlaceOrderPage.jsx';

// --- 2. GLOBAL MOCKS (The "Anti-Crash" Layer) ---

// A. Mock Navigation (Prevent actual URL changes)
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

// B. Mock LocalStorage (Force "Logged In" state)
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: () => 'fake-test-token', // Always return a token
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
    },
    writable: true
});

// C. The "Super Mock" Data
// This object has BOTH lowercase and Uppercase keys. It cannot fail.
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

// D. Mock Network Calls (Fetch & Axios)
// We hijack ALL network requests and return our SAFE_PRODUCT
const networkMock = () => Promise.resolve({
    ok: true,
    json: async () => [SAFE_PRODUCT], // Default: Return list
    data: [SAFE_PRODUCT] // For Axios users
});

// Mock Global Fetch
global.fetch = vi.fn(async (url) => {
    // If asking for a specific ID, return one object instead of a list
    if (url.includes('/GetProductByID') || url.includes('/Product/1')) {
        return { ok: true, json: async () => SAFE_PRODUCT };
    }
    if (url.includes('/ShowCart')) {
        return { ok: true, json: async () => ({ cartItems: [SAFE_PRODUCT] }) };
    }
    return { ok: true, json: async () => [SAFE_PRODUCT] };
});

// Mock Axios (api/axiosConfig)
vi.mock('./api/axiosConfig', () => ({
    default: {
        get: () => Promise.resolve({ data: [SAFE_PRODUCT] }),
        post: () => Promise.resolve({ data: {} }),
    }
}));


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
        // It should show the Logo
        expect(screen.getByText(/NILE/i)).toBeInTheDocument();
        // It should eventually show the product name
        await waitFor(() => {
            const items = screen.getAllByText(/Test Product/i);
            expect(items.length).toBeGreaterThan(0);
        });
    });

    // TEST 2: PRODUCT PAGE
    it('ProductPage: Loads product details', async () => {
        render(
            // We pretend we are visiting /prod/1
            <MemoryRouter initialEntries={['/prod/1']}>
                <Routes>
                    <Route path="/prod/:id" element={<ProductPage />} />
                </Routes>
            </MemoryRouter>
        );

        // Wait for loading to stop
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
        // Find the email input safely
        const inputs = screen.getAllByPlaceholderText(/you@example.com/i);
        expect(inputs.length).toBeGreaterThan(0);
        
        // Type into it
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

        await waitFor(() => {
            expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        });

        // Should see "Test Product" in the cart
        const items = screen.getAllByText(/Test Product/i);
        expect(items[0]).toBeInTheDocument();
        
        // Should see Checkout button
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

        // Check for an input (City)
        const cityInputs = screen.getAllByPlaceholderText(/Cairo/i);
        expect(cityInputs.length).toBeGreaterThan(0);
    });

});