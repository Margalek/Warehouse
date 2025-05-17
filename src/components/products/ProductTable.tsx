import React from 'react';
import type { Product } from '@/types/product';
import type { SortCriteria } from '@/types/common.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'; // Assuming Shadcn Table is used
import { Button } from '@/components/ui/button'; // For actions
import { ArrowUpDown } from 'lucide-react'; // For sorting icons

interface ProductTableProps {
  products: Product[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  sortCriteria?: SortCriteria<Product>; // Optional for now
  onSortChange: (criteria: SortCriteria<Product>) => void; // Made mandatory as per IMPL.MD for DashboardPage
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  sortCriteria,
  onSortChange,
}: ProductTableProps) {
  const handleSort = (field: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (
      sortCriteria &&
      sortCriteria.field === field &&
      sortCriteria.direction === 'asc'
    ) {
      direction = 'desc';
    }
    onSortChange({ field, direction });
  };

  const renderSortArrow = (field: keyof Product) => {
    if (sortCriteria && sortCriteria.field === field) {
      return sortCriteria.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 inline" />;
  };

  if (!products || products.length === 0) {
    return (
      <div className="p-4 border rounded-md min-h-[200px] flex items-center justify-center">
        <p className="text-center text-muted-foreground">
          No products to display.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">ID</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('name')}
            >
              Name{renderSortArrow('name')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 w-[120px] text-right"
              onClick={() => handleSort('quantity')}
            >
              Quantity{renderSortArrow('quantity')}
            </TableHead>
            <TableHead className="w-[100px]">Unit</TableHead>
            <TableHead
              className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('location')}
            >
              Location{renderSortArrow('location')}
            </TableHead>
            <TableHead
              className="hidden lg:table-cell cursor-pointer hover:bg-muted/50 w-[150px]"
              onClick={() => handleSort('dateModified')}
            >
              Last Modified{renderSortArrow('dateModified')}
            </TableHead>
            <TableHead className="text-right w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell
                className="font-mono text-xs truncate"
                title={product.id}
              >
                {product.id.substring(0, 8)}...
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-right">{product.quantity}</TableCell>
              <TableCell>{product.unit}</TableCell>
              <TableCell className="hidden md:table-cell">
                {product.location || 'N/A'}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {new Date(product.dateModified).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(product.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(product.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
