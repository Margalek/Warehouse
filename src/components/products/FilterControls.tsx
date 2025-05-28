import React from 'react';
import type { ProductFilterCriteria } from '@/types/common.types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FilterControlsProps {
  /**
   * The current set of active filters.
   * Allows the component to display the current filter state (e.g., checked boxes, input values).
   */
  currentFilters: Partial<ProductFilterCriteria>; // Allow partial updates
  /**
   * Callback function invoked when any filter control changes its value.
   * It passes an object with the filter(s) that changed.
   * @param newFilters An object containing the updated filter criteria.
   */
  onFilterChange: (newFilters: Partial<ProductFilterCriteria>) => void;
  // distinctUnits?: string[]; // For a unit dropdown filter
  // distinctLocations?: string[]; // For a location dropdown filter
}

export function FilterControls({
  currentFilters,
  onFilterChange,
}: FilterControlsProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let processedValue: string | number | boolean | undefined = value;
    if (type === 'checkbox') {
      processedValue = checked;
    }
    if (type === 'number') {
      processedValue = value === '' ? undefined : Number(value); // Handle empty string for optional numbers
    }
    onFilterChange({ [name]: processedValue });
  };

  return (
    <div className="p-4 border rounded-md space-y-4 bg-card text-card-foreground shadow">
      <h3 className="text-lg font-semibold">Filter Products</h3>

      {/* Show In Stock Only filter */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="showInStockOnly"
          name="showInStockOnly"
          checked={!!currentFilters.showInStockOnly}
          onCheckedChange={(checked) =>
            onFilterChange({ showInStockOnly: !!checked })
          }
        />
        <Label htmlFor="showInStockOnly" className="cursor-pointer">
          Show In Stock Only
        </Label>
      </div>

      {/* Out of Stock filter */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="showOutOfStock"
          name="showOutOfStock"
          checked={!!currentFilters.showOutOfStock}
          onCheckedChange={(checked) =>
            onFilterChange({ showOutOfStock: !!checked })
          }
        />
        <Label htmlFor="showOutOfStock" className="cursor-pointer">
          Show Out of Stock Only
        </Label>
      </div>

      {/* Low Stock Threshold filter */}
      <div className="space-y-1">
        <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
        <Input
          type="number"
          id="lowStockThreshold"
          name="lowStockThreshold"
          placeholder="e.g., 5"
          value={currentFilters.lowStockThreshold ?? ''} // Handle undefined for controlled input
          onChange={handleInputChange}
          className="max-w-xs"
        />
        <p className="text-xs text-muted-foreground">
          Show products with quantity below this value. Requires integration
          with product data.
        </p>
      </div>

      {/* 
        Placeholder for other filters mentioned in ProductFilterCriteria:
        - searchTerm (usually handled by SearchBar component)
        - Potentially dropdowns for units, locations if distinctUnits/distinctLocations props are passed
      */}

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          onFilterChange({
            showOutOfStock: undefined,
            lowStockThreshold: undefined,
            showInStockOnly: undefined,
            // Clear other filters too
          })
        }
      >
        Clear Filters
      </Button>
    </div>
  );
}
