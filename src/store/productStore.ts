import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import type { Product } from '@/types/product';
import * as productService from '@/services/productService';

export interface ProductState {
  /** List of all products in the warehouse. */
  products: Product[];
  /** True if any asynchronous operation is in progress. */
  isLoading: boolean;
  /** Stores an error message if an operation fails, otherwise null. */
  error: string | null;
  /** Fetches all products from the product service and updates the store. */
  fetchProducts: () => Promise<void>;
  /**
   * Adds a new product or updates an existing one (by name/unit) via the product service.
   * Fetches products again on success.
   * @param productData New product data.
   * @returns Promise that resolves to the added/updated product or null on error.
   */
  addProduct: (
    productData: Omit<Product, 'id' | 'dateAdded' | 'dateModified'>,
  ) => Promise<Product | null>;
  /**
   * Updates an existing product by its ID via the product service.
   * Fetches products again on success.
   * @param id Product ID to update.
   * @param updates Partial data to update the product.
   * @returns Promise that resolves to the updated product or null if not found or error.
   */
  updateProduct: (
    id: string,
    updates: Partial<Omit<Product, 'id' | 'dateAdded'>>,
  ) => Promise<Product | null>;
  /**
   * Deletes a product by its ID via the product service.
   * Fetches products again on success.
   * @param id Product ID to delete.
   * @returns Promise that resolves to true if deletion succeeded, false otherwise.
   */
  deleteProduct: (id: string) => Promise<boolean>;
}

// Define the StateCreator type for clarity
type ProductStoreCreator = StateCreator<
  ProductState,
  [], // No middleware for now that changes set/get signatures e.g. devtools
  [], // No middleware for now that changes set/get signatures
  ProductState // Slice type if splitting store, here it's the full state
>;

const productStoreCreator: ProductStoreCreator = (set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const products = await productService.getProducts();
      set({ products, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  addProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const product = await productService.addProduct(productData);
      await get().fetchProducts();
      return product;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
      return null;
    }
  },

  updateProduct: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const product = await productService.updateProduct(id, updates);
      if (product) {
        await get().fetchProducts();
        return product;
      }
      return null;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
      return null;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = await productService.deleteProduct(id);
      if (success) {
        await get().fetchProducts();
      }
      return success;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
      return false;
    }
  },
});

/**
 * Zustand store hook for managing product state and actions.
 *
 * Provides access to the product list, loading states, error states,
 * and functions to fetch, add, update, and delete products.
 * @see ProductState for detailed descriptions of available state and actions.
 */
export const useProductStore = create<ProductState>(productStoreCreator);
