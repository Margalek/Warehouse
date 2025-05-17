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

interface ProductTableProps {
  products: Product[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  sortCriteria?: SortCriteria<Product>; // Optional for now
  onSortChange?: (criteria: SortCriteria<Product>) => void; // Optional for now
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  // sortCriteria,
  // onSortChange
}: ProductTableProps) {
  // TODO: Implement sorting based on sortCriteria and onSortChange
  // TODO: Make headers clickable for sorting

  if (!products || products.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">No products to display.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead className="hidden md:table-cell">Location</TableHead>
          <TableHead className="hidden lg:table-cell">Last Modified</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-mono text-xs">{product.id}</TableCell>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.quantity}</TableCell>
            <TableCell>{product.unit}</TableCell>
            <TableCell className="hidden md:table-cell">
              {product.location || 'N/A'}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              {new Date(product.dateModified).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right space-x-2">
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
