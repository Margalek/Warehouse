import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '@/store/productStore';
import type { Product } from '@/types/product';
import type { ProductFilterCriteria, SortCriteria } from '@/types/common.types';

import { Navbar } from '@/components/layout/Navbar';
import { ProductTable } from '@/components/products/ProductTable';
import { SearchBar } from '@/components/shared/SearchBar';
import { FilterControls } from '@/components/products/FilterControls';
import { FileUpload } from '@/components/shared/FileUpload';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';

import { Button } from '@/components/ui/button';
// import { useToast } from "@/components/ui/use-toast"; // Will be needed later for feedback

export function DashboardPage() {
  const navigate = useNavigate();
  // const { toast } = useToast(); // For user feedback

  const {
    products,
    isLoading,
    error,
    fetchProducts,
    // addProduct, // addProduct action is available but form is on separate page
    // updateProduct, // updateProduct action is available but form is on separate page
    deleteProduct: deleteProductFromStore,
  } = useProductStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Partial<ProductFilterCriteria>>({});
  const [sort, setSort] = useState<SortCriteria<Product> | undefined>(
    undefined,
  ); // Example: { field: 'name', direction: 'asc' }

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term.toLowerCase());
  };

  const handleFilterChange = (newFilters: Partial<ProductFilterCriteria>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (newSort: SortCriteria<Product>) => {
    setSort(newSort);
  };

  const handleProductDeleteRequest = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      setProductToDelete(product);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      const success = await deleteProductFromStore(productToDelete.id);
      if (success) {
        // toast({ title: "Success", description: `Product "${productToDelete.name}" deleted.` });
        console.log(`Product "${productToDelete.name}" deleted.`);
      } else {
        // toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
        console.error('Failed to delete product.');
      }
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let processedProducts = [...products];

    // Apply search
    if (searchTerm) {
      processedProducts = processedProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.id.toLowerCase().includes(searchTerm) ||
          p.location?.toLowerCase().includes(searchTerm),
      );
    }

    // Apply filters
    if (filters.showOutOfStock) {
      processedProducts = processedProducts.filter((p) => p.quantity === 0);
    }
    if (filters.lowStockThreshold !== undefined) {
      processedProducts = processedProducts.filter(
        (p) => p.quantity < (filters.lowStockThreshold || 0),
      );
    }
    // Add other filters here e.g. unit, location from filters state

    // Apply sort
    if (sort) {
      processedProducts.sort((a, b) => {
        const valA = a[sort.field];
        const valB = b[sort.field];
        let comparison = 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (
          sort.field === 'dateAdded' ||
          sort.field === 'dateModified'
        ) {
          comparison =
            new Date(valA as string).getTime() -
            new Date(valB as string).getTime();
        }
        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }
    return processedProducts;
  }, [products, searchTerm, filters, sort]);

  // Placeholder handlers for import/export/reports
  const handleImport = (file: File) => {
    console.log('Importing file:', file.name);
    // TODO: Call productService.importProducts then fetchProducts()
    // toast({ title: "Import", description: "Import functionality pending." });
  };
  const handleExport = () => {
    console.log('Exporting data...');
    // TODO: Call productService.exportProducts and trigger download
    // toast({ title: "Export", description: "Export functionality pending." });
  };
  const handleGenerateReport = (type: 'full' | 'shortages') => {
    console.log(`Generating ${type} report...`);
    // TODO: Call productService.generateReportCSV and trigger download
    // toast({ title: "Report", description: `${type} report functionality pending.` });
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto p-4">
          <p>Loading dashboard...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto p-4">
          <p className="text-red-500">Error loading products: {error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Navbar />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Product Dashboard
          </h1>
          <Button onClick={() => navigate('/add-product')}>
            Add New Product
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <SearchBar
              onSearchChange={handleSearchChange}
              placeholder="Search ID, name, location..."
            />
            <FilterControls
              currentFilters={filters}
              onFilterChange={handleFilterChange}
            />
            <div className="space-y-2 p-4 border rounded-md bg-card text-card-foreground shadow">
              <h3 className="text-lg font-semibold">Data Management</h3>
              <FileUpload
                onFileSelect={handleImport}
                buttonText="Import JSON"
                acceptedFileTypes=".json"
                className="w-full"
              />
              <Button
                variant="outline"
                onClick={handleExport}
                className="w-full"
              >
                Export JSON
              </Button>
            </div>
            <div className="space-y-2 p-4 border rounded-md bg-card text-card-foreground shadow">
              <h3 className="text-lg font-semibold">Reports</h3>
              <Button
                variant="outline"
                onClick={() => handleGenerateReport('full')}
                className="w-full"
              >
                Warehouse Status (CSV)
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGenerateReport('shortages')}
                className="w-full"
              >
                Shortages Report (CSV)
              </Button>
            </div>
          </div>

          <div className="lg:col-span-3">
            {isLoading && <p>Refreshing product list...</p>}
            <ProductTable
              products={filteredAndSortedProducts}
              onEdit={(id) => navigate(`/product/${id}/edit`)}
              onDelete={handleProductDeleteRequest}
              sortCriteria={sort}
              onSortChange={handleSortChange} // TODO: Implement this in ProductTable
            />
            {/* TODO: Add Pagination if product list is long */}
          </div>
        </div>
      </main>

      {productToDelete && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Confirm Deletion"
          message={`Are you sure you want to delete product "${productToDelete.name}" (ID: ${productToDelete.id})? This action cannot be undone.`}
          confirmButtonText="Delete"
          confirmButtonVariant="destructive"
        />
      )}
    </div>
  );
}
