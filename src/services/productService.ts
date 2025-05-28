import { unparse } from 'papaparse';
import type { Product } from '@/types/product';

const API_URL = 'http://localhost:3001/api';

/**
 * Pobiera wszystkie produkty z API.
 * Produkty są sortowane według daty modyfikacji w porządku malejącym.
 * @returns Tablica produktów.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error('Błąd podczas pobierania produktów');
    const products = await response.json();
    return products.sort(
      (a: Product, b: Product) =>
        new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime(),
    );
  } catch (error) {
    console.error('Błąd podczas pobierania produktów:', error);
    throw error;
  }
}

/**
 * Pobiera pojedynczy produkt według jego ID.
 * @param id ID produktu do pobrania.
 * @returns Produkt, jeśli znaleziono, w przeciwnym razie undefined.
 */
export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

/**
 * Sprawdza, czy produkt o podanej nazwie i jednostce już istnieje.
 * Jest to pomocnicza funkcja dla logiki UI przed wywołaniem addProduct.
 * @param name Nazwa produktu.
 * @param unit Jednostka produktu.
 * @returns Istniejący produkt, jeśli znaleziono, w przeciwnym razie undefined.
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
 * Dodaje nowy produkt do magazynu lub aktualizuje ilość, jeśli istnieje.
 * @param productData Dane nowego produktu, bez id, dateAdded i dateModified.
 * @returns Dodany lub zaktualizowany produkt.
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

    if (!response.ok) throw new Error('Błąd podczas dodawania produktu');
    return await response.json();
  } catch (error) {
    console.error('Błąd podczas dodawania produktu:', error);
    throw error;
  }
}

/**
 * Aktualizuje istniejący produkt.
 * @param id ID produktu do aktualizacji.
 * @param updates Częściowe dane do aktualizacji produktu (bez id i dateAdded).
 * @returns Zaktualizowany produkt, jeśli znaleziono i zaktualizowano, w przeciwnym razie undefined.
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
      throw new Error('Błąd podczas aktualizacji produktu');
    }

    return await response.json();
  } catch (error) {
    console.error('Błąd podczas aktualizacji produktu:', error);
    throw error;
  }
}

/**
 * Usuwa produkt z magazynu.
 * @param id ID produktu do usunięcia.
 * @returns True, jeśli produkt został pomyślnie usunięty, false w przeciwnym razie.
 */
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 404) return false;
      throw new Error('Błąd podczas usuwania produktu');
    }

    return true;
  } catch (error) {
    console.error('Błąd podczas usuwania produktu:', error);
    throw error;
  }
}

/**
 * Importuje produkty do magazynu z podanej tablicy.
 * @param importedProducts Tablica produktów do zaimportowania.
 * @param strategy Strategia importu: 'replace' (nadpisuje istniejący magazyn) lub 'merge' (łączy z istniejącym, nadpisując duplikaty według ID).
 */
export async function importProducts(
  importedProducts: Product[],
  strategy: 'replace' | 'merge',
): Promise<void> {
  try {
    if (strategy === 'replace') {
      // Najpierw usuń wszystkie istniejące produkty
      const existingProducts = await getProducts();
      await Promise.all(existingProducts.map((p) => deleteProduct(p.id)));

      // Następnie dodaj nowe produkty
      await Promise.all(importedProducts.map((p) => addProduct(p)));
    } else if (strategy === 'merge') {
      // Dodaj lub zaktualizuj każdy produkt
      await Promise.all(
        importedProducts.map((p) =>
          updateProduct(p.id, p).catch(() => addProduct(p)),
        ),
      );
    }
  } catch (error) {
    console.error('Błąd podczas importowania produktów:', error);
    throw error;
  }
}

/**
 * Eksportuje bieżący magazyn jako tablicę produktów.
 * @returns Tablica wszystkich produktów w magazynie.
 */
export async function exportProducts(): Promise<Product[]> {
  return getProducts();
}

/**
 * Generuje raport CSV.
 * @param productsToReport Tablica produktów do uwzględnienia w raporcie.
 * @param type Typ raportu: 'full' (wszystkie dane produktu) lub 'shortages' (produkty poniżej minimumStockLevel).
 * @param globalMinStock Opcjonalny globalny minimalny poziom zapasów, używany, jeśli produkt nie ma własnego minimumStockLevel dla raportu niedoborów.
 * @returns String zawierający dane CSV.
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
