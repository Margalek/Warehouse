import React from 'react';
import type { Product } from '@/types/product'; // Assuming Product type will be needed

// Define ProductFormData if not already defined elsewhere, or import it
// For now, using a placeholder. Requirements point to react-hook-form and validation.
export interface ProductFormData {
  name: string;
  quantity: number;
  unit: string;
  location?: string;
  minimumStockLevel?: number;
}

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: Product; // For editing
  // Other props like isLoading, submitButtonText etc. can be added
}

export function ProductForm({ onSubmit, initialData }: ProductFormProps) {
  // TODO: Implement form using react-hook-form and Shadcn/UI components
  // Based on REQUIREMENTS.MD (7.1) and IMPLEMENTATION.MD (7.2)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Placeholder for form data gathering
    const formData: ProductFormData = {
      name: 'Test Product', // Replace with actual form values
      quantity: 10, // Replace with actual form values
      unit: 'pcs', // Replace with actual form values
    };
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-4 border rounded-md shadow"
    >
      <h2 className="text-2xl font-semibold mb-4">
        {initialData ? 'Edit Product' : 'Add New Product'}
      </h2>

      {/* Placeholder for form fields - to be replaced with Shadcn/UI Input, Label, etc. */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Product Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          defaultValue={initialData?.name || ''}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-gray-700"
        >
          Quantity
        </label>
        <input
          type="number"
          name="quantity"
          id="quantity"
          defaultValue={initialData?.quantity || 0}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="unit"
          className="block text-sm font-medium text-gray-700"
        >
          Unit
        </label>
        <input
          type="text"
          name="unit"
          id="unit"
          defaultValue={initialData?.unit || ''}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Add fields for location and minimumStockLevel similarly */}

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {initialData ? 'Save Changes' : 'Add Product'}
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Note: This is a placeholder form. Full implementation with
        react-hook-form and validation is pending.
      </p>
    </form>
  );
}
