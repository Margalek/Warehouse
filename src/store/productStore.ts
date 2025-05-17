import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import type { Product } from '@/types/product';
import * as productService from '@/services/productService';

export interface ProductState {
  /** The list of all products in the inventory. */
  products: Product[];
  /** True if any product-related asynchronous operation is in progress. */
  isLoading: boolean;
  /** Stores an error message if an operation fails, otherwise null. */
  error: string | null;
  /** Fetches all products from the product service and updates the store. */
  fetchProducts: () => void;
  /**
   * Adds a new product or updates an existing one (by name/unit) via the product service.
   * Re-fetches products on success.
   * @param productData The data for the new product.
   * @returns A promise that resolves to the added/updated product, or null on error.
   */
  addProduct: (
    productData: Omit<Product, 'id' | 'dateAdded' | 'dateModified'>,
  ) => Promise<Product | null>;
  /**
   * Updates an existing product by its ID via the product service.
   * Re-fetches products on success.
   * @param id The ID of the product to update.
   * @param updates The partial data to update the product with.
   * @returns A promise that resolves to the updated product, or null if not found or on error.
   */
  updateProduct: (
    id: string,
    updates: Partial<Omit<Product, 'id' | 'dateAdded'>>,
  ) => Promise<Product | null>;
  /**
   * Deletes a product by its ID via the product service.
   * Re-fetches products on success.
   * @param id The ID of the product to delete.
   * @returns A promise that resolves to true if deletion was successful, false otherwise.
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

  fetchProducts: () => {
    set({ isLoading: true, error: null });
    try {
      const products = productService.getProducts();
      set({ products, isLoading: false });
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Failed to fetch products';
      set({ error, isLoading: false });
      console.error(error);
    }
  },

  addProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const newProduct = productService.addProduct(productData);
      get().fetchProducts();
      return newProduct;
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Failed to add product';
      set({ error, isLoading: false });
      console.error(error);
      return null;
    }
  },

  updateProduct: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProduct = productService.updateProduct(id, updates);
      if (updatedProduct) {
        get().fetchProducts();
        return updatedProduct;
      }
      throw new Error('Product not found or update failed');
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Failed to update product';
      set({ error, isLoading: false });
      console.error(error);
      return null;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const success = productService.deleteProduct(id);
      if (success) {
        get().fetchProducts();
        return true;
      }
      throw new Error('Product not found or deletion failed');
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Failed to delete product';
      set({ error, isLoading: false });
      console.error(error);
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
