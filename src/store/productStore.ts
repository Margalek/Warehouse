import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import type { Product } from '@/types/product';
import * as productService from '@/services/productService';

export interface ProductState {
  /** Lista wszystkich produktów w magazynie. */
  products: Product[];
  /** True, jeśli jakakolwiek operacja asynchroniczna jest w toku. */
  isLoading: boolean;
  /** Przechowuje komunikat o błędzie, jeśli operacja się nie powiedzie, w przeciwnym razie null. */
  error: string | null;
  /** Pobiera wszystkie produkty z serwisu produktów i aktualizuje store. */
  fetchProducts: () => Promise<void>;
  /**
   * Dodaje nowy produkt lub aktualizuje istniejący (według nazwy/jednostki) poprzez serwis produktów.
   * Ponownie pobiera produkty po sukcesie.
   * @param productData Dane nowego produktu.
   * @returns Promise, który rozwiązuje się do dodanego/zaktualizowanego produktu lub null w przypadku błędu.
   */
  addProduct: (
    productData: Omit<Product, 'id' | 'dateAdded' | 'dateModified'>,
  ) => Promise<Product | null>;
  /**
   * Aktualizuje istniejący produkt według jego ID poprzez serwis produktów.
   * Ponownie pobiera produkty po sukcesie.
   * @param id ID produktu do aktualizacji.
   * @param updates Częściowe dane do aktualizacji produktu.
   * @returns Promise, który rozwiązuje się do zaktualizowanego produktu lub null, jeśli nie znaleziono lub wystąpił błąd.
   */
  updateProduct: (
    id: string,
    updates: Partial<Omit<Product, 'id' | 'dateAdded'>>,
  ) => Promise<Product | null>;
  /**
   * Usuwa produkt według jego ID poprzez serwis produktów.
   * Ponownie pobiera produkty po sukcesie.
   * @param id ID produktu do usunięcia.
   * @returns Promise, który rozwiązuje się do true, jeśli usunięcie się powiodło, false w przeciwnym razie.
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
        error: error instanceof Error ? error.message : 'Nieznany błąd',
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
        error: error instanceof Error ? error.message : 'Nieznany błąd',
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
        error: error instanceof Error ? error.message : 'Nieznany błąd',
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
        error: error instanceof Error ? error.message : 'Nieznany błąd',
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
