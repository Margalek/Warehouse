import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// import { MemoryRouter } from 'react-router-dom'; // No longer needed here
import App from '../App'; // Adjust path if App.tsx is elsewhere
import * as localStorageService from '../services/localStorageService';
import type { Product } from '@/types/product'; // Adjust path as necessary
import { v4 as uuidv4 } from 'uuid';

// Mock localStorageService
jest.mock('../services/localStorageService', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

const mockGetItem = localStorageService.getItem as jest.Mock;
const mockSetItem = localStorageService.setItem as jest.Mock;
const mockUuidv4 = uuidv4 as jest.Mock;

describe('Product Flow Integration Test', () => {
  let mockInventory: Product[] = [];

  beforeEach(() => {
    mockInventory = []; // Reset for each test

    mockGetItem.mockImplementation((key: string) => {
      if (key === 'warehouseInventoryData') {
        return JSON.parse(JSON.stringify(mockInventory)); // Return a copy to mimic real storage
      }
      return null;
    });

    mockSetItem.mockImplementation((key: string, value: Product[]) => {
      if (key === 'warehouseInventoryData') {
        mockInventory = JSON.parse(JSON.stringify(value)); // Store a copy
      }
    });

    (localStorageService.getItem as jest.Mock).mockClear();
    (localStorageService.setItem as jest.Mock).mockClear();
    (uuidv4 as jest.Mock).mockClear();

    mockUuidv4.mockReturnValue('test-uuid-123');
    window.history.pushState({}, '', '/');
  });

  test('should allow adding a product and see it on the dashboard', async () => {
    render(<App />); // Render App directly

    // 1. Navigate to Add Product Page

    await waitFor(() => {
      // Wait for Dashboard to load (e.g., a specific element)
      expect(
        screen.getByRole('heading', { name: /product dashboard/i, level: 1 }),
      ).toBeInTheDocument();
    });

    const addProductLink = screen.getByRole('link', { name: /add product/i }); // Changed from /add new product/i
    fireEvent.click(addProductLink);

    // 2. Verify navigation to AddProductPage (e.g., by a unique element on that page)
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /add new product/i, level: 1 }),
      ).toBeInTheDocument();
    });

    // 3. Fill out the product form
    fireEvent.change(screen.getByLabelText(/product name/i), {
      target: { value: 'Test Product 1' },
    });
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText(/unit/i), {
      target: { value: 'pcs' },
    });
    fireEvent.change(screen.getByLabelText(/location/i), {
      target: { value: 'Shelf A' },
    });
    fireEvent.change(screen.getByLabelText(/minimum stock level/i), {
      target: { value: '5' },
    });
    fireEvent.change(screen.getByLabelText(/tags/i), {
      target: { value: 'test, new' },
    });

    // 4. Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add product/i }));

    // 5. Verify navigation back to DashboardPage (or product is added to store)
    // And that localStorageService.setItem was called with the new product list
    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith(
        'warehouseInventoryData',
        expect.arrayContaining([
          expect.objectContaining({
            id: 'test-uuid-123', // from mocked uuid
            name: 'Test Product 1',
            quantity: 10,
            unit: 'pcs',
            location: 'Shelf A',
            minimumStockLevel: 5,
            tags: ['test', 'new'],
            // dateAdded and dateModified will be set by productService
          }),
        ]),
      );
    });

    // After submission, the form usually navigates back to dashboard.
    // Check for a dashboard element again.
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /product dashboard/i, level: 1 }),
      ).toBeInTheDocument();
    });

    // At this point, mockInventory in our test scope is updated via mockSetItem.
    // The DashboardPage, upon re-render, should fetch from the store,
    // which should have been updated by its addProduct action (which calls productService.addProduct,
    // which uses our mocked localStorageService that now has the updated mockInventory).

    // 7. Verify the product appears in the ProductTable on the DashboardPage
    // The ProductTable component should be rendered by DashboardPage
    await waitFor(() => {
      // Check for table content based on the product added
      // These will be cells within the table
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Quantity
      expect(screen.getByText('pcs')).toBeInTheDocument(); // Unit
      expect(screen.getByText('Shelf A')).toBeInTheDocument(); // Location
    });
  });
});
