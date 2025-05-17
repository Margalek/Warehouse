import { v4 as uuidv4 } from 'uuid';
import { formatISO } from 'date-fns';
import Papa from 'papaparse';
import type { Product } from '@/types/product';
import * as localStorageService from './localStorageService';

/**
 * The key used to store inventory data in Local Storage.
 */
export const INVENTORY_STORAGE_KEY = 'warehouseInventoryData';

/**
 * Retrieves all products from Local Storage.
 * Products are sorted by dateModified in descending order by default.
 * @returns An array of products.
 */
export function getProducts(): Product[] {
  const products =
    localStorageService.getItem<Product[]>(INVENTORY_STORAGE_KEY) || [];
  // Default sort: By Date Modified (Newest first) as per example implementation,
  // though requirements doc doesn't explicitly state default sort for this raw getter.
  return products.sort(
    (a, b) =>
      new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime(),
  );
}

/**
 * Retrieves a single product by its ID.
 * @param id The ID of the product to retrieve.
 * @returns The product if found, otherwise undefined.
 */
export function getProductById(id: string): Product | undefined {
  const products = getProducts();
  return products.find((p) => p.id === id);
}

/**
 * Checks if a product with the given name and unit already exists.
 * This is a helper for UI logic before calling addProduct.
 * @param name The name of the product.
 * @param unit The unit of the product.
 * @returns The existing product if found, otherwise undefined.
 */
export function checkExistingProduct(
  name: string,
  unit: string,
): Product | undefined {
  const products = getProducts();
  return products.find(
    (p) =>
      p.name.toLowerCase() === name.toLowerCase() &&
      p.unit.toLowerCase() === unit.toLowerCase(),
  );
}

/**
 * Adds a new product to the inventory or updates quantity if it exists (based on name and unit).
 * If a product with the same name and unit exists, its quantity is updated.
 * Otherwise, a new product is created.
 * @param productData The data for the new product, excluding id, dateAdded, and dateModified.
 * @returns The added or updated product.
 */
export function addProduct(
  productData: Omit<Product, 'id' | 'dateAdded' | 'dateModified'>,
): Product {
  const products = getProducts();
  const now = formatISO(new Date());

  const existingProduct = checkExistingProduct(
    productData.name,
    productData.unit,
  );

  if (existingProduct) {
    // Update existing product's quantity and location if provided
    existingProduct.quantity += productData.quantity;
    existingProduct.location =
      productData.location !== undefined
        ? productData.location
        : existingProduct.location;
    existingProduct.minimumStockLevel =
      productData.minimumStockLevel !== undefined
        ? productData.minimumStockLevel
        : existingProduct.minimumStockLevel;
    existingProduct.dateModified = now;
    localStorageService.setItem(INVENTORY_STORAGE_KEY, products);
    return existingProduct;
  } else {
    // Add new product
    const newProduct: Product = {
      ...productData,
      id: uuidv4(),
      dateAdded: now,
      dateModified: now,
    };
    products.push(newProduct);
    localStorageService.setItem(INVENTORY_STORAGE_KEY, products);
    return newProduct;
  }
}

/**
 * Updates an existing product.
 * @param id The ID of the product to update.
 * @param updates The partial data to update the product with (excluding id and dateAdded).
 * @returns The updated product if found and updated, otherwise undefined.
 */
export function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'dateAdded'>>,
): Product | undefined {
  const products = getProducts();
  const productIndex = products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    return undefined;
  }

  const updatedProduct = {
    ...products[productIndex],
    ...updates,
    dateModified: formatISO(new Date()),
  };
  products[productIndex] = updatedProduct;
  localStorageService.setItem(INVENTORY_STORAGE_KEY, products);
  return updatedProduct;
}

/**
 * Deletes a product from the inventory.
 * @param id The ID of the product to delete.
 * @returns True if the product was deleted successfully, false otherwise.
 */
export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const initialLength = products.length;
  const updatedProducts = products.filter((p) => p.id !== id);

  if (updatedProducts.length < initialLength) {
    localStorageService.setItem(INVENTORY_STORAGE_KEY, updatedProducts);
    return true;
  }
  return false;
}

/**
 * Imports products into the inventory from a given array.
 * @param importedProducts An array of products to import.
 * @param strategy The import strategy: 'replace' (overwrites existing inventory) or 'merge' (merges with existing, overwriting duplicates by ID).
 */
export function importProducts(
  importedProducts: Product[],
  strategy: 'replace' | 'merge',
): void {
  if (strategy === 'replace') {
    localStorageService.setItem(INVENTORY_STORAGE_KEY, importedProducts);
  } else if (strategy === 'merge') {
    const currentProducts = getProducts();
    const productMap = new Map(currentProducts.map((p) => [p.id, p]));
    importedProducts.forEach((p) => productMap.set(p.id, p));
    localStorageService.setItem(
      INVENTORY_STORAGE_KEY,
      Array.from(productMap.values()),
    );
  }
}

/**
 * Exports the current inventory as an array of products.
 * @returns An array of all products in the inventory.
 */
export function exportProducts(): Product[] {
  return getProducts();
}

/**
 * Generates a CSV string for reporting.
 * @param productsToReport Array of products to include in the report.
 * @param type Type of report: 'full' (all product data) or 'shortages' (products below minimumStockLevel).
 * @param globalMinStock An optional global minimum stock level, used if a product doesn't have its own minimumStockLevel for shortages report.
 * @returns A string containing the CSV data.
 */
export function generateReportCSV(
  productsToReport: Product[],
  type: 'full' | 'shortages',
  globalMinStock?: number,
): string {
  let dataForCSV: Product[];
  let columns: (keyof Product)[];

  if (type === 'full') {
    dataForCSV = productsToReport;
    columns = [
      'id',
      'name',
      'quantity',
      'unit',
      'location',
      'dateAdded',
      'dateModified',
      'minimumStockLevel',
    ];
  } else {
    // 'shortages'
    dataForCSV = productsToReport.filter((p) => {
      const threshold =
        p.minimumStockLevel !== undefined
          ? p.minimumStockLevel
          : globalMinStock;
      return threshold !== undefined ? p.quantity < threshold : false;
    });
    columns = [
      'id',
      'name',
      'quantity',
      'unit',
      'location',
      'minimumStockLevel',
      'dateModified',
    ];
  }

  // Select only the specified columns for the CSV
  const selectedData = dataForCSV.map((product) => {
    const selectedProduct: Partial<Product> = {};
    columns.forEach((column) => {
      selectedProduct[column] = product[column];
    });
    return selectedProduct;
  });

  if (selectedData.length === 0) {
    // Papa.unparse requires at least one row or explicit fields for header when data is empty.
    // To ensure header is always present even for empty data:
    return Papa.unparse({ fields: columns.map(String), data: [] });
  }

  return Papa.unparse(selectedData, {
    columns: columns.map(String), // PapaParse expects column names as strings
    header: true,
  });
}
