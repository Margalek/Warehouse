import * as productService from './productService';
import * as localStorageService from './localStorageService';
import type { Product } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';
import { formatISO } from 'date-fns'; // Using date-fns for date formatting
import { unparse } from 'papaparse';

// Mock localStorageService
jest.mock('./localStorageService');
const mockedLocalStorageService = localStorageService as jest.Mocked<
  typeof localStorageService
>;

// Mock uuid
jest.mock('uuid');
const mockedUuidv4 = uuidv4 as jest.Mock;

// Mock papaparse
jest.mock('papaparse');
const mockedUnparse = unparse as jest.Mock;

const INVENTORY_STORAGE_KEY = 'warehouseInventoryData';

describe('productService', () => {
  let mockProducts: Product[];
  const baseTime = new Date(2023, 0, 1, 0, 0, 0); // Jan 1, 2023, 00:00:00

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(baseTime);

    mockedLocalStorageService.getItem.mockReset();
    mockedLocalStorageService.setItem.mockReset();
    mockedUuidv4.mockReset();
    mockedUnparse.mockReset();

    mockProducts = [
      {
        id: '1',
        name: 'Test Product 1',
        quantity: 10,
        unit: 'pcs',
        dateAdded: formatISO(baseTime),
        dateModified: formatISO(baseTime),
        location: 'A1',
        minimumStockLevel: 5,
      },
      {
        id: '2',
        name: 'Test Product 2',
        quantity: 20,
        unit: 'kg',
        dateAdded: formatISO(baseTime),
        dateModified: formatISO(baseTime),
        location: 'B2',
        minimumStockLevel: 10,
      },
    ];
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getProducts', () => {
    it('should return products from localStorage', () => {
      mockedLocalStorageService.getItem.mockReturnValue(mockProducts);
      const products = productService.getProducts();
      expect(products).toEqual(mockProducts);
      expect(mockedLocalStorageService.getItem).toHaveBeenCalledWith(
        INVENTORY_STORAGE_KEY,
      );
    });

    it('should return an empty array if no products in localStorage', () => {
      mockedLocalStorageService.getItem.mockReturnValue(null);
      const products = productService.getProducts();
      expect(products).toEqual([]);
      expect(mockedLocalStorageService.getItem).toHaveBeenCalledWith(
        INVENTORY_STORAGE_KEY,
      );
    });
  });

  describe('addProduct', () => {
    it('should add a new product, generate id and timestamps, and save to localStorage', () => {
      const newProductData = {
        name: 'New Product',
        quantity: 50,
        unit: 'ltr',
        location: 'C3',
        minimumStockLevel: 15,
      };
      const generatedId = 'new-uuid';
      mockedUuidv4.mockReturnValue(generatedId);
      // Simulate that these products are currently in localStorage
      mockedLocalStorageService.getItem.mockReturnValue(mockProducts);

      // Advance time slightly to ensure timestamps are different if product service creates new dates
      jest.advanceTimersByTime(1000);
      const expectedTimestampAfterAdvance = formatISO(new Date()); // Capture timestamp SUT will use

      const addedProduct = productService.addProduct(newProductData);

      expect(mockedUuidv4).toHaveBeenCalledTimes(1);
      expect(addedProduct).toBeDefined();
      expect(addedProduct.id).toBe(generatedId);
      expect(addedProduct.name).toBe(newProductData.name);
      // Check timestamps against the advanced time
      expect(addedProduct.dateAdded).toBe(expectedTimestampAfterAdvance);
      expect(addedProduct.dateModified).toBe(expectedTimestampAfterAdvance);

      // The mockProducts array instance should have been mutated by addProduct
      expect(mockedLocalStorageService.setItem).toHaveBeenCalledWith(
        INVENTORY_STORAGE_KEY,
        mockProducts, // This is the array instance that was mutated
      );
      // Verify the new product is the last one in the mutated array and matches the returned one
      expect(mockProducts[mockProducts.length - 1]).toEqual(addedProduct);
    });

    it('should update quantity if product with the same name and unit exists', () => {
      const existingProductData = {
        name: 'Test Product 1',
        quantity: 5,
        unit: 'pcs',
      };
      // Original dateModified for product '1'
      const originalDateModified = mockProducts.find(
        (p) => p.id === '1',
      )!.dateModified;
      mockedLocalStorageService.getItem.mockReturnValue(mockProducts);

      // Advance time to ensure dateModified will change
      jest.advanceTimersByTime(2000);
      const expectedUpdatedTimestamp = formatISO(new Date());

      const updatedProduct = productService.addProduct(existingProductData);

      expect(updatedProduct).toBeDefined();
      expect(updatedProduct.id).toBe('1');
      expect(updatedProduct.name).toBe('Test Product 1');
      expect(updatedProduct.quantity).toBe(15); // 10 + 5
      expect(mockedUuidv4).not.toHaveBeenCalled();
      expect(updatedProduct.dateModified).toBe(expectedUpdatedTimestamp);
      expect(updatedProduct.dateModified).not.toEqual(originalDateModified);

      // Check that the correct item was passed to setItem
      // The mockProducts array itself is mutated
      const productInStorage = mockProducts.find((p) => p.id === '1');
      expect(productInStorage).toEqual(updatedProduct);
      expect(mockedLocalStorageService.setItem).toHaveBeenCalledWith(
        INVENTORY_STORAGE_KEY,
        mockProducts,
      );
    });

    it('should create a new product if name matches but unit is different', () => {
      const newProductDataWithSameName = {
        name: 'Test Product 1',
        quantity: 5,
        unit: 'box',
      };
      const generatedId = 'another-uuid';
      mockedUuidv4.mockReturnValue(generatedId);
      mockedLocalStorageService.getItem.mockReturnValue(mockProducts);

      jest.advanceTimersByTime(3000);
      const expectedTimestamp = formatISO(new Date());

      const newProduct = productService.addProduct(newProductDataWithSameName);

      expect(newProduct).toBeDefined();
      expect(newProduct.id).toBe(generatedId);
      expect(newProduct.name).toBe(newProductDataWithSameName.name);
      expect(newProduct.unit).toBe('box');
      expect(newProduct.dateAdded).toBe(expectedTimestamp);
      expect(newProduct.dateModified).toBe(expectedTimestamp);
      expect(mockedUuidv4).toHaveBeenCalledTimes(1);

      // Check setItem call
      expect(mockedLocalStorageService.setItem).toHaveBeenCalledWith(
        INVENTORY_STORAGE_KEY,
        mockProducts,
      );
      expect(mockProducts[mockProducts.length - 1]).toEqual(newProduct);
    });
  });

  describe('getProductById', () => {
    it('should return the product with the given id', () => {
      mockedLocalStorageService.getItem.mockReturnValue(mockProducts);
      const product = productService.getProductById('1');
      expect(product).toEqual(mockProducts[0]);
      expect(mockedLocalStorageService.getItem).toHaveBeenCalledWith(
        INVENTORY_STORAGE_KEY,
      );
    });

    it('should return undefined if product with the given id does not exist', () => {
      mockedLocalStorageService.getItem.mockReturnValue(mockProducts);
      const product = productService.getProductById('non-existent-id');
      expect(product).toBeUndefined();
      expect(mockedLocalStorageService.getItem).toHaveBeenCalledWith(
        INVENTORY_STORAGE_KEY,
      );
    });

    it('should return undefined if products list is empty', () => {
      mockedLocalStorageService.getItem.mockReturnValue([]);
      const product = productService.getProductById('1');
      expect(product).toBeUndefined();
      expect(mockedLocalStorageService.getItem).toHaveBeenCalledWith(
        INVENTORY_STORAGE_KEY,
      );
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product and its dateModified', () => {
      mockedLocalStorageService.getItem.mockReturnValue(mockProducts);
      const updates = { name: 'Updated Name', quantity: 100 };
      const productIdToUpdate = '1';
      const originalProduct = mockProducts.find(
        (p) => p.id === productIdToUpdate,
      );

      jest.advanceTimersByTime(5000); // Advance time to ensure dateModified changes
      const expectedTimestamp = formatISO(new Date());

      const updatedProduct = productService.updateProduct(
        productIdToUpdate,
        updates,
      );

      expect(updatedProduct).toBeDefined();
      expect(updatedProduct?.id).toBe(productIdToUpdate);
      expect(updatedProduct?.name).toBe(updates.name);
      expect(updatedProduct?.quantity).toBe(updates.quantity);
      expect(updatedProduct?.dateModified).toBe(expectedTimestamp);
      expect(updatedProduct?.dateModified).not.toBe(
        originalProduct?.dateModified,
      );
      expect(updatedProduct?.dateAdded).toBe(originalProduct?.dateAdded); // dateAdded should not change

      const expectedUpdatedProducts = mockProducts.map((p) =>
        p.id === productIdToUpdate ? updatedProduct : p,
      );
      expect(mockedLocalStorageService.setItem).toHaveBeenCalledWith(
        INVENTORY_STORAGE_KEY,
        expect.arrayContaining(expectedUpdatedProducts),
      );
      // Check that the specific product in the argument to setItem matches the updated product
      const setItemCall = mockedLocalStorageService.setItem.mock
        .calls[0][1] as Product[];
      expect(setItemCall.find((p) => p.id === productIdToUpdate)).toEqual(
        updatedProduct,
      );
    });

    it('should return undefined if product to update does not exist', () => {
      mockedLocalStorageService.getItem.mockReturnValue(mockProducts);
      const updates = { name: 'Updated Name' };
      const updatedProduct = productService.updateProduct(
        'non-existent-id',
        updates,
      );

      expect(updatedProduct).toBeUndefined();
      expect(mockedLocalStorageService.setItem).not.toHaveBeenCalled();
    });

    it('should not change other properties if not provided in updates', () => {
      mockedLocalStorageService.getItem.mockReturnValue(mockProducts);
      const updates = { quantity: 150 };
      const productIdToUpdate = '2';
      const originalProduct = mockProducts.find(
        (p) => p.id === productIdToUpdate,
      )!;

      jest.advanceTimersByTime(6000);
      const expectedTimestamp = formatISO(new Date());

      const updatedProduct = productService.updateProduct(
        productIdToUpdate,
        updates,
      );

      expect(updatedProduct).toBeDefined();
      expect(updatedProduct?.id).toBe(originalProduct.id);
      expect(updatedProduct?.name).toBe(originalProduct.name); // Name should remain the same
      expect(updatedProduct?.quantity).toBe(updates.quantity);
      expect(updatedProduct?.unit).toBe(originalProduct.unit);
      expect(updatedProduct?.location).toBe(originalProduct.location);
      expect(updatedProduct?.minimumStockLevel).toBe(
        originalProduct.minimumStockLevel,
      );
      expect(updatedProduct?.dateModified).toBe(expectedTimestamp);
      expect(updatedProduct?.dateAdded).toBe(originalProduct.dateAdded);

      expect(mockedLocalStorageService.setItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteProduct', () => {
    it('should delete an existing product and return true', () => {
      mockedLocalStorageService.getItem.mockReturnValue(mockProducts);
      const productIdToDelete = '1';
      const initialLength = mockProducts.length;

      const result = productService.deleteProduct(productIdToDelete);

      expect(result).toBe(true);

      const expectedRemainingProducts = mockProducts.filter(
        (p) => p.id !== productIdToDelete,
      );
      expect(mockedLocalStorageService.setItem).toHaveBeenCalledWith(
        INVENTORY_STORAGE_KEY,
        expectedRemainingProducts,
      );
      // Ensure the setItem was called with an array that doesn't contain the deleted product
      const setItemCall = mockedLocalStorageService.setItem.mock
        .calls[0][1] as Product[];
      expect(setItemCall.length).toBe(initialLength - 1);
      expect(
        setItemCall.find((p) => p.id === productIdToDelete),
      ).toBeUndefined();
    });

    it('should return false if product to delete does not exist', () => {
      mockedLocalStorageService.getItem.mockReturnValue(mockProducts);
      const result = productService.deleteProduct('non-existent-id');

      expect(result).toBe(false);
      expect(mockedLocalStorageService.setItem).not.toHaveBeenCalled();
    });

    it('should handle deleting from an empty list of products', () => {
      mockedLocalStorageService.getItem.mockReturnValue([]);
      const result = productService.deleteProduct('1');

      expect(result).toBe(false);
      expect(mockedLocalStorageService.setItem).not.toHaveBeenCalled();
    });
  });

  describe('exportProducts', () => {
    it('should return all products from localStorage', () => {
      mockedLocalStorageService.getItem.mockReturnValue(mockProducts);
      const exportedProducts = productService.exportProducts();
      expect(exportedProducts).toEqual(mockProducts); // getProducts sorts them, so this should be fine if mockProducts is pre-sorted or sort order isn't strictly tested here.
      expect(mockedLocalStorageService.getItem).toHaveBeenCalledWith(
        INVENTORY_STORAGE_KEY,
      );
    });

    it('should return an empty array if no products exist', () => {
      mockedLocalStorageService.getItem.mockReturnValue(null);
      const exportedProducts = productService.exportProducts();
      expect(exportedProducts).toEqual([]);
      expect(mockedLocalStorageService.getItem).toHaveBeenCalledWith(
        INVENTORY_STORAGE_KEY,
      );
    });
  });

  describe('importProducts', () => {
    const importedProducts: Product[] = [
      {
        id: 'import-1',
        name: 'Imported Product 1',
        quantity: 100,
        unit: 'kg',
        dateAdded: formatISO(new Date(2023, 5, 1)), // June 1, 2023
        dateModified: formatISO(new Date(2023, 5, 15)), // June 15, 2023
        location: 'Z1',
        minimumStockLevel: 50,
      },
      {
        id: 'import-2',
        name: 'Imported Product 2',
        quantity: 200,
        unit: 'pcs',
        dateAdded: formatISO(new Date(2023, 6, 1)), // July 1, 2023
        dateModified: formatISO(new Date(2023, 6, 10)), // July 10, 2023
        location: 'Z2',
      },
    ];

    describe("strategy: 'replace'", () => {
      it('should replace all existing products with imported products', () => {
        // mockProducts contains 2 items initially
        mockedLocalStorageService.getItem.mockReturnValue(mockProducts);

        productService.importProducts(importedProducts, 'replace');

        expect(mockedLocalStorageService.setItem).toHaveBeenCalledWith(
          INVENTORY_STORAGE_KEY,
          importedProducts,
        );
      });

      it('should add imported products if current inventory is empty', () => {
        mockedLocalStorageService.getItem.mockReturnValue([]); // Empty initial inventory

        productService.importProducts(importedProducts, 'replace');

        expect(mockedLocalStorageService.setItem).toHaveBeenCalledWith(
          INVENTORY_STORAGE_KEY,
          importedProducts,
        );
      });

      it('should clear existing products if an empty list is imported', () => {
        mockedLocalStorageService.getItem.mockReturnValue(mockProducts);
        const emptyImportList: Product[] = [];

        productService.importProducts(emptyImportList, 'replace');

        expect(mockedLocalStorageService.setItem).toHaveBeenCalledWith(
          INVENTORY_STORAGE_KEY,
          emptyImportList,
        );
      });
    });

    describe("strategy: 'merge'", () => {
      it('should merge new products and update existing ones', () => {
        // mockProducts has ids '1' and '2'
        // importedProducts has ids 'import-1', 'import-2'
        // Create a product in importedProducts that will update an existing one from mockProducts
        const productsToImport: Product[] = [
          ...importedProducts, // 'import-1', 'import-2'
          {
            id: '1', // This ID matches mockProducts[0]
            name: 'Updated Test Product 1',
            quantity: 99,
            unit: 'box',
            dateAdded: formatISO(new Date(2023, 0, 1)), // original dateAdded
            dateModified: formatISO(new Date(2023, 7, 1)), // Aug 1, 2023 - new dateModified
            location: 'A1-updated',
            minimumStockLevel: 7,
          },
        ];

        mockedLocalStorageService.getItem.mockReturnValue(mockProducts);
        productService.importProducts(productsToImport, 'merge');

        const expectedProductsMap = new Map<string, Product>();
        // Add original products that are not being updated
        expectedProductsMap.set(mockProducts[1].id, mockProducts[1]); // Product with id '2'
        // Add/Update with imported products
        productsToImport.forEach((p) => expectedProductsMap.set(p.id, p));

        const expectedProductsArray = Array.from(expectedProductsMap.values());

        expect(mockedLocalStorageService.setItem).toHaveBeenCalledWith(
          INVENTORY_STORAGE_KEY,
          expect.arrayContaining(expectedProductsArray),
        );
        // Also check the length to ensure no extra products are present
        const setItemCall = mockedLocalStorageService.setItem.mock
          .calls[0][1] as Product[];
        expect(setItemCall.length).toBe(expectedProductsArray.length);
      });

      it('should add imported products if current inventory is empty (merge behaves like replace)', () => {
        mockedLocalStorageService.getItem.mockReturnValue([]); // Empty initial inventory

        productService.importProducts(importedProducts, 'merge');

        expect(mockedLocalStorageService.setItem).toHaveBeenCalledWith(
          INVENTORY_STORAGE_KEY,
          importedProducts, // Expecting the imported products directly
        );
      });

      it('should not change inventory if an empty list is merged', () => {
        mockedLocalStorageService.getItem.mockReturnValue(mockProducts);
        const emptyImportList: Product[] = [];

        productService.importProducts(emptyImportList, 'merge');

        // setItem should be called, but with the original products because merge of empty list results in no changes
        // The implementation of merge strategy in productService.ts calls getProducts()
        // then it iterates the imported list (which is empty)
        // then it calls setItem with Array.from(productMap.values()) which will be the original products.
        expect(mockedLocalStorageService.setItem).toHaveBeenCalledWith(
          INVENTORY_STORAGE_KEY,
          mockProducts,
        );
      });
    });
  });

  describe('generateReportCSV', () => {
    beforeEach(() => {
      mockedUnparse.mockReset();
      // Default mock implementation for unparse
      mockedUnparse.mockImplementation((data, config) => {
        if (
          Array.isArray(data) &&
          data.length === 0 &&
          config &&
          Array.isArray(config.fields) &&
          config.fields.length > 0
        ) {
          return config.fields.join(','); // Return header row for empty data with fields
        }
        // Simplified CSV stringification for testing purposes
        const header =
          config && Array.isArray(config.columns)
            ? config.columns.join(',') + '\n'
            : '';
        const rows = Array.isArray(data)
          ? data
              .map((row) =>
                (config && Array.isArray(config.columns)
                  ? config.columns
                  : Object.keys(row)
                )
                  .map((key: string) => row[key])
                  .join(','),
              )
              .join('\n')
          : '';
        return header + rows;
      });
    });

    const reportProducts: Product[] = [
      {
        id: 'report-1',
        name: 'Report Product A',
        quantity: 5,
        unit: 'pcs',
        dateAdded: formatISO(new Date(2023, 0, 1)),
        dateModified: formatISO(new Date(2023, 0, 15)),
        location: 'R1',
        minimumStockLevel: 10, // Shortage
      },
      {
        id: 'report-2',
        name: 'Report Product B',
        quantity: 20,
        unit: 'kg',
        dateAdded: formatISO(new Date(2023, 1, 1)),
        dateModified: formatISO(new Date(2023, 1, 15)),
        location: 'R2',
        minimumStockLevel: 15, // Not a shortage
      },
      {
        id: 'report-3',
        name: 'Report Product C',
        quantity: 3,
        unit: 'ltr',
        dateAdded: formatISO(new Date(2023, 2, 1)),
        dateModified: formatISO(new Date(2023, 2, 15)),
        location: 'R3',
        // No minimumStockLevel, should use global if provided
      },
    ];

    describe("type: 'full'", () => {
      const fullReportColumns: (keyof Product)[] = [
        'id',
        'name',
        'quantity',
        'unit',
        'location',
        'dateAdded',
        'dateModified',
        'minimumStockLevel',
      ];

      it('should generate a CSV string with all product data and correct headers', () => {
        productService.generateReportCSV(reportProducts, 'full');

        expect(mockedUnparse).toHaveBeenCalledTimes(1);
        const callArgs = mockedUnparse.mock.calls[0];
        const dataPassed = callArgs[0];
        const configPassed = callArgs[1];

        expect(dataPassed).toEqual(
          reportProducts.map((p) => {
            const selected: Partial<Product> = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fullReportColumns.forEach((col) => (selected[col] = p[col] as any));
            return selected;
          }),
        );
        expect(configPassed.columns).toEqual(fullReportColumns.map(String));
        expect(configPassed.header).toBe(true);
      });

      it('should return only headers if product list is empty for full report', () => {
        productService.generateReportCSV([], 'full');

        expect(mockedUnparse).toHaveBeenCalledTimes(1);
        const callArgs = mockedUnparse.mock.calls[0];
        const dataPassed = callArgs[0]; // This is an object { fields: string[], data: [] } from the SUT

        expect(dataPassed.data).toEqual([]);
        expect(dataPassed.fields).toEqual(fullReportColumns.map(String));
      });
    });

    describe("type: 'shortages'", () => {
      const shortagesReportColumns: (keyof Product)[] = [
        'id',
        'name',
        'quantity',
        'unit',
        'location',
        'minimumStockLevel',
        'dateModified',
      ];

      it('should filter products based on their individual minimumStockLevel', () => {
        productService.generateReportCSV(reportProducts, 'shortages');
        expect(mockedUnparse).toHaveBeenCalledTimes(1);
        const callArgs = mockedUnparse.mock.calls[0];
        const dataPassed = callArgs[0];
        const configPassed = callArgs[1];

        const expectedShortageProducts = [reportProducts[0]]; // Only Product A is a shortage based on its own MSL
        expect(dataPassed).toEqual(
          expectedShortageProducts.map((p) => {
            const selected: Partial<Product> = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            shortagesReportColumns.forEach(
              (col) => (selected[col] = p[col] as any),
            );
            return selected;
          }),
        );
        expect(configPassed.columns).toEqual(
          shortagesReportColumns.map(String),
        );
        expect(configPassed.header).toBe(true);
      });

      it('should use globalMinStock if product minimumStockLevel is undefined', () => {
        productService.generateReportCSV(reportProducts, 'shortages', 5); // Global min stock is 5
        // Product A (qty 5, msl 10) -> shortage
        // Product B (qty 20, msl 15) -> not shortage
        // Product C (qty 3, msl undefined) -> use global 5 -> shortage
        expect(mockedUnparse).toHaveBeenCalledTimes(1);
        const callArgs = mockedUnparse.mock.calls[0];
        const dataPassed = callArgs[0];

        const expectedShortageProducts = [reportProducts[0], reportProducts[2]];
        expect(dataPassed.length).toBe(2);
        expect(dataPassed).toEqual(
          expect.arrayContaining(
            expectedShortageProducts.map((p) => {
              const selected: Partial<Product> = {};
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              shortagesReportColumns.forEach(
                (col) => (selected[col] = p[col] as any),
              );
              // Product C will have undefined MSL in the output as it doesn't have one itself
              if (p.id === 'report-3') selected.minimumStockLevel = undefined;
              return selected;
            }),
          ),
        );
      });

      it('should correctly handle products with no minimumStockLevel and no globalMinStock', () => {
        // Product C has no MSL, and no global MSL is passed
        const productsWithoutMSL = [
          reportProducts[0], // Shortage (5 < 10)
          { ...reportProducts[2], minimumStockLevel: undefined }, // No MSL, qty 3
        ];
        productService.generateReportCSV(productsWithoutMSL, 'shortages');
        expect(mockedUnparse).toHaveBeenCalledTimes(1);
        const callArgs = mockedUnparse.mock.calls[0];
        const dataPassed = callArgs[0];

        // Only reportProducts[0] should be a shortage, Product C is not considered if no threshold
        const expectedShortageProducts = [productsWithoutMSL[0]];
        expect(dataPassed).toEqual(
          expectedShortageProducts.map((p) => {
            const selected: Partial<Product> = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            shortagesReportColumns.forEach(
              (col) => (selected[col] = p[col] as any),
            );
            return selected;
          }),
        );
      });

      it('should return only headers if no shortages are found', () => {
        const noShortageProducts: Product[] = [reportProducts[1]]; // Product B (qty 20, msl 15)
        productService.generateReportCSV(noShortageProducts, 'shortages', 10);

        expect(mockedUnparse).toHaveBeenCalledTimes(1);
        const callArgs = mockedUnparse.mock.calls[0];
        const dataPassed = callArgs[0]; // This is an object { fields: string[], data: [] } from the SUT

        expect(dataPassed.data).toEqual([]);
        expect(dataPassed.fields).toEqual(shortagesReportColumns.map(String));
      });

      it('should return only headers if product list is empty for shortages report', () => {
        productService.generateReportCSV([], 'shortages', 5);

        expect(mockedUnparse).toHaveBeenCalledTimes(1);
        const callArgs = mockedUnparse.mock.calls[0];
        const dataPassed = callArgs[0];

        expect(dataPassed.data).toEqual([]);
        expect(dataPassed.fields).toEqual(shortagesReportColumns.map(String));
      });
    });
  });

  // All public functions in productService.ts should now have test coverage.
});
