import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductForm } from '@/components/products/ProductForm';
import { useProductStore } from '@/store/productStore';
import type { ProductState } from '@/store/productStore';
import type { ProductFormData } from '@/types/product';
import { Navbar } from '@/components/layout/Navbar';

export const AddProductPage: React.FC = () => {
  const navigate = useNavigate();
  const addProduct = useProductStore((state: ProductState) => state.addProduct);

  const handleSubmit = async (data: ProductFormData) => {
    try {
      // ID and timestamps will be handled by the service/store
      await addProduct(data);
      navigate('/'); // Navigate to dashboard after successful addition
    } catch (error) {
      console.error('Failed to add product:', error);
      // Handle error (e.g., show a notification)
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="mt-8">
        <h1 className="text-2xl font-bold mb-4">Add New Product</h1>
        <ProductForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};
