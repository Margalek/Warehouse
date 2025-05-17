import { create, StateCreator } from 'zustand';
import type { Product } from '@/types/product';
import * as productService from '@/services/productService';

export interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => void;
  addProduct: (
    productData: Omit<Product, 'id' | 'dateAdded' | 'dateModified'>,
  ) => Promise<Product | null>; // Return product or null on error
  updateProduct: (
    id: string,
    updates: Partial<Omit<Product, 'id' | 'dateAdded'>>,
  ) => Promise<Product | null>; // Return product or null on error
  deleteProduct: (id: string) => Promise<boolean>; // Return true on success, false on error
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
      // The productService.addProduct handles the logic of checking existing product by name/unit
      // and updates quantity or creates new. It returns the added/updated product.
      const newProduct = productService.addProduct(productData);
      // No need to manually set({ products: ... }) if getProducts() is called by fetch or reflects the change
      get().fetchProducts(); // Re-fetch all products to ensure store is in sync
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
        get().fetchProducts(); // Re-fetch to update the list
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
        get().fetchProducts(); // Re-fetch to update the list
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

export const useProductStore = create<ProductState>(productStoreCreator);
