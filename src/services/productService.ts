import { unparse } from 'papaparse';
import type { Product } from '@/types/product';

const API_URL = 'http://localhost:3001/api';

/**
 * Fetches all products from the API.
 * Products are sorted by modification date in descending order.
 * @returns Array of products.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error('Error fetching products');
    const products = await response.json();
    return products.sort(
      (a: Product, b: Product) =>
        new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime(),
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Fetches a single product by its ID.
 * @param id Product ID to fetch.
 * @returns Product if found, otherwise undefined.
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

/**
 * Checks if a product with the given name and unit already exists.
 * This is a helper function for UI logic before calling addProduct.
 * @param name Product name.
 * @param unit Product unit.
 * @returns Existing product if found, otherwise undefined.
 */
export async function checkExistingProduct(
  name: string,
  unit: string,
): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find(
    (p) =>
      p.name.toLowerCase() === name.toLowerCase() &&
      p.unit.toLowerCase() === unit.toLowerCase(),
  );
}

/**
 * Adds a new product to the warehouse or updates the quantity if it exists.
 * @param productData New product data, without id, dateAdded, and dateModified.
 * @returns Added or updated product.
 */
export async function addProduct(
  productData: Omit<Product, 'id' | 'dateAdded' | 'dateModified'>,
): Promise<Product> {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) throw new Error('Error adding product');
    return await response.json();
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

/**
 * Updates an existing product.
 * @param id Product ID to update.
 * @param updates Partial data to update the product (without id and dateAdded).
 * @returns Updated product if found and updated, otherwise undefined.
 */
export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'dateAdded'>>,
): Promise<Product | undefined> {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error('Error updating product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

/**
 * Deletes a product from the warehouse.
 * @param id Product ID to delete.
 * @returns True if the product was successfully deleted, false otherwise.
 */
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 404) return false;
      throw new Error('Error deleting product');
    }

    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

/**
 * Imports products into the warehouse from the provided array.
 * @param importedProducts Array of products to import.
 * @param strategy Import strategy: 'replace' (overwrites existing warehouse) or 'merge' (merges with existing, overwriting duplicates by ID).
 */
export async function importProducts(
  importedProducts: Product[],
  strategy: 'replace' | 'merge',
): Promise<void> {
  try {
    if (strategy === 'replace') {
      // First, delete all existing products
      const existingProducts = await getProducts();
      await Promise.all(existingProducts.map((p) => deleteProduct(p.id)));

      // Then add new products
      await Promise.all(importedProducts.map((p) => addProduct(p)));
    } else if (strategy === 'merge') {
      // Add or update each product
      await Promise.all(
        importedProducts.map((p) =>
          updateProduct(p.id, p).catch(() => addProduct(p)),
        ),
      );
    }
  } catch (error) {
    console.error('Error importing products:', error);
    throw error;
  }
}

/**
 * Exports the current warehouse as an array of products.
 * @returns Array of all products in the warehouse.
 */
export async function exportProducts(): Promise<Product[]> {
  return getProducts();
}

/**
 * Generates a CSV report.
 * @param productsToReport Array of products to include in the report.
 * @param type Report type: 'full' (all product data) or 'shortages' (products below minimumStockLevel).
 * @param globalMinStock Optional global minimum stock level, used if a product does not have its own minimumStockLevel for the shortages report.
 * @returns String containing CSV data.
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
    dataForCSV = productsToReport.filter((p) => {
      const threshold =
        p.minimumStockLevel !== undefined
          ? p.minimumStockLevel
          : globalMinStock;
      // If no threshold, treat quantity === 0 as shortage
      if (threshold === undefined) {
        return p.quantity === 0;
      }
      return p.quantity < threshold;
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

  const selectedData = dataForCSV.map((product) => {
    const selectedProduct: Record<string, unknown> = {};
    columns.forEach((column) => {
      selectedProduct[column] = product[column];
    });
    return selectedProduct;
  });

  if (selectedData.length === 0) {
    return unparse({ fields: columns.map(String), data: [] });
  }

  return unparse(selectedData, {
    columns: columns.map(String),
    header: true,
  });
}
