import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductForm } from '@/components/products/ProductForm';
import { useProductStore } from '@/store/productStore';
import type { ProductState } from '@/store/productStore';
import type { Product, ProductFormData } from '@/types/product';
import { Navbar } from '@/components/layout/Navbar';
import * as productService from '@/services/productService'; // For fetching a single product

export const EditProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const updateProductInStore = useProductStore(
    (state: ProductState) => state.updateProduct,
  );
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setError('Product ID is missing from URL.');
      setIsLoading(false);
      return;
    }

    const fetchProduct = () => {
      setIsLoading(true);
      try {
        const fetchedProduct = productService.getProductById(productId);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
        } else {
          setError('Product not found.');
        }
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : 'Failed to fetch product details.';
        setError(errorMessage);
        console.error(errorMessage, e);
      }
      setIsLoading(false);
    };

    fetchProduct();
  }, [productId]);

  const handleSubmit = async (data: ProductFormData) => {
    if (!productId) {
      console.error('Cannot update product without ID');
      // Optionally set an error state to inform the user
      return;
    }
    try {
      await updateProductInStore(productId, data);
      navigate('/'); // Navigate to dashboard after successful update
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update product.';
      setError(errorMessage);
      console.error(errorMessage, err);
      // Handle error (e.g., show a notification)
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Navbar />
        <div className="mt-8 text-center">Loading product details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Navbar />
        <div className="mt-8 text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!product) {
    // This case should ideally be covered by the error state if product not found
    return (
      <div className="container mx-auto p-4">
        <Navbar />
        <div className="mt-8 text-center">Product not found.</div>
      </div>
    );
  }

  // Prepare initial values for the form, excluding id, dateAdded, dateModified
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, dateAdded, dateModified, ...initialFormValues } = product;

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="mt-8">
        <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
        <ProductForm onSubmit={handleSubmit} initialData={product} />
      </div>
    </div>
  );
};
