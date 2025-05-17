import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '@/store/productStore';
import type { Product } from '@/types/product';
import type { ProductFilterCriteria, SortCriteria } from '@/types/common.types';
import { useDebounce } from '@/hooks/useDebounce';

import { Navbar } from '@/components/layout/Navbar';
import { ProductTable } from '@/components/products/ProductTable';
import { SearchBar } from '@/components/shared/SearchBar';
import { FilterControls } from '@/components/products/FilterControls';
import { FileUpload } from '@/components/shared/FileUpload';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';

import { Button } from '@/components/ui/button';
import * as productService from '@/services/productService';
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
    fetchProducts: refreshProductList,
  } = useProductStore();

  const [instantSearchInput, setInstantSearchInput] = useState('');
  const debouncedSearchInput = useDebounce(instantSearchInput, 300);
  const [finalSearchTerm, setFinalSearchTerm] = useState('');

  const [filters, setFilters] = useState<Partial<ProductFilterCriteria>>({});
  const [sort, setSort] = useState<SortCriteria<Product> | undefined>(
    undefined,
  ); // Example: { field: 'name', direction: 'asc' }

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setFinalSearchTerm(debouncedSearchInput.toLowerCase());
  }, [debouncedSearchInput]);

  const handleSearchChange = (term: string) => {
    setInstantSearchInput(term);
  };

  const handleFilterChange = (newFilters: Partial<ProductFilterCriteria>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (newSort: SortCriteria<Product>) => {
    setSort(newSort);
  };

  const handleProductDeleteRequest = (id: string) => {
    const product = products.find((p: Product) => p.id === id);
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

    // Apply search using finalSearchTerm
    if (finalSearchTerm) {
      processedProducts = processedProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(finalSearchTerm) ||
          p.id.toLowerCase().includes(finalSearchTerm) ||
          p.location?.toLowerCase().includes(finalSearchTerm),
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
  }, [products, finalSearchTerm, filters, sort]);

  const handleImport = async (file: File) => {
    // const { toast } = useToast(); // Initialize toast here if used
    if (!file) {
      // toast({ title: "Import Error", description: "No file selected.", variant: "destructive" });
      console.error('No file selected for import.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) {
          // toast({ title: "Import Error", description: "File content is empty or unreadable.", variant: "destructive" });
          console.error('File content is empty or unreadable.');
          return;
        }
        const importedProducts = JSON.parse(content);

        // Define a minimal type for the quick validation check
        type MinProductValidation = {
          id?: unknown;
          name?: unknown;
          [key: string]: unknown;
        };

        // Basic validation (more thorough validation should be in productService)
        if (
          !Array.isArray(importedProducts) ||
          importedProducts.some((p: MinProductValidation) => !p.id || !p.name)
        ) {
          // toast({ title: "Import Error", description: "Invalid file format or missing required product fields.", variant: "destructive" });
          console.error(
            'Invalid file format. Expected an array of products with id and name.',
          );
          return;
        }

        // For now, implementing only 'replace' strategy with a simple confirm.
        // TODO: Implement strategy selection (replace/merge) possibly using a modal.
        if (
          window.confirm(
            'Are you sure you want to replace the current inventory with the imported data?',
          )
        ) {
          productService.importProducts(importedProducts, 'replace');
          refreshProductList(); // Refresh products from store
          // toast({ title: "Import Successful", description: "Inventory data imported and replaced successfully." });
          console.log('Import successful (replace)');
        } else {
          // toast({ title: "Import Cancelled", description: "Inventory import was cancelled." });
          console.log('Import cancelled by user.');
        }
      } catch (error) {
        console.error('Import failed:', error);
        // toast({ title: "Import Error", description: `Failed to import products: ${error.message}`, variant: "destructive" });
      }
    };
    reader.onerror = () => {
      console.error('Failed to read file.');
      // toast({ title: "Import Error", description: "Failed to read the selected file.", variant: "destructive" });
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    try {
      const productsToExport = productService.exportProducts();
      const jsonData = JSON.stringify(productsToExport, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      link.download = `inventory_backup_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      // toast({ title: "Export Successful", description: "Inventory data exported." });
      console.log('Export successful');
    } catch (error) {
      console.error('Export failed:', error);
      // toast({ title: "Export Error", description: "Failed to export inventory data.", variant: "destructive" });
    }
  };

  const handleGenerateReport = (type: 'full' | 'shortages') => {
    // const { toast } = useToast(); // Initialize toast here if used
    try {
      // The productService.generateReportCSV expects the current list of products.
      // For shortages, it also needs the globalMinStock, which we are not implementing yet via UI.
      // For now, shortages report will rely on per-product minimumStockLevel if set.
      const csvData = productService.generateReportCSV(products, type);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // YYYY-MM-DDTHH-MM-SS-mmmZ
      link.download = `${type}_report_${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      // toast({ title: "Report Generated", description: `${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully.` });
      console.log(`${type} report generated successfully.`);
    } catch (error) {
      console.error(`Failed to generate ${type} report:`, error);
      // toast({ title: "Report Error", description: `Failed to generate ${type} report.`, variant: "destructive" });
    }
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
