/** Defines sorting criteria for product lists. */
export interface SortCriteria<T> {
  /** The field of type T to sort by. */
  field: keyof T;
  /** The direction of sorting, either ascending or descending. */
  direction: 'asc' | 'desc';
}

/** Defines filter criteria for product lists. */
export interface ProductFilterCriteria {
  /** A term to search for in product fields (e.g., name, ID, location). */
  searchTerm?: string;
  /** If true, only products with quantity 0 will be shown. */
  showOutOfStock?: boolean;
  /** Products with quantity below this threshold will be considered as low stock. */
  lowStockThreshold?: number;
  /** If true, only shows products where quantity > minimumStockLevel (or > 0 if no minimum set) */
  showInStockOnly?: boolean;
  // Add other specific filters as needed (e.g., unit, location)
}
