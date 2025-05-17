/** Defines sorting criteria for product lists. */
export interface SortCriteria<T> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

/** Defines filter criteria for product lists. */
export interface ProductFilterCriteria {
  searchTerm?: string;
  showOutOfStock?: boolean;
  lowStockThreshold?: number; // For filtering products below this quantity
  // Add other specific filters as needed (e.g., unit, location)
}
