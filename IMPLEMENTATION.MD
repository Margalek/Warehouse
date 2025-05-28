# Implementation Plan: Warehouse Inventory Management SPA

## 1. Introduction

### 1.1. Purpose
This document outlines the step-by-step implementation plan for the Warehouse Inventory Management Single Page Application (SPA). It details the development phases, from initial project setup to final deployment and documentation, ensuring all functional and non-functional requirements are met.

### 1.2. Project Overview
The project aims to create a client-side SPA for managing product inventory. Users will be able to add, edit, delete products, view inventory status, and generate reports. Data persistence will be handled using the browser's Local Storage, with import/export functionality for JSON files.

### 1.3. Related Documents
*   [REQUIREMENTS.MD](./REQUIREMENTS.MD): Detailed functional and non-functional requirements, system architecture, and technology stack.
*   [REVIEW_PROCESS.MD](./REVIEW_PROCESS.MD): Evaluation criteria for the project.

## 2. Project Setup & Configuration

The project will be built using React (v18+) with TypeScript, leveraging Create React App (customized with CRACO) and the technology stack defined in `REQUIREMENTS.MD` (Section 6.2).

### 2.1. Initialize/Verify React Project
*   **Action**: Ensure a React project is set up using Create React App with TypeScript.
*   **Details**: Verify `craco.config.js` for any necessary CRACO customizations (if not already present from the template).
*   **Reference**: `REQUIREMENTS.MD` (6.2)

### 2.2. Install Core Dependencies
*   **Action**: Install necessary npm packages.
*   **Packages**:
    *   `react-router-dom` (for routing)
    *   `zustand` or `jotai` (for state management - `Zustand` is recommended for its simplicity and power if Context API becomes insufficient)
    *   `react-hook-form` (for form handling)
    *   `uuid` (for generating unique IDs)
    *   `@types/uuid`
    *   `date-fns` (for date formatting and manipulation)
    *   `papaparse` (for CSV generation for reports)
    *   `@types/papaparse`
*   **Command**: `npm install react-router-dom zustand react-hook-form uuid date-fns papaparse && npm install --save-dev @types/uuid @types/papaparse` (Adjust `zustand` if `jotai` or Context API is preferred initially).
*   **Reference**: `REQUIREMENTS.MD` (6.2)

### 2.3. Setup Tailwind CSS & Shadcn/UI
*   **Action**: Configure Tailwind CSS and integrate Shadcn/UI.
*   **Details**:
    *   Follow official Shadcn/UI documentation to initialize it: `npx shadcn-ui@latest init`.
    *   Ensure `tailwind.config.js` and global CSS (`src/styles/globals.css` or `src/index.css`) are correctly set up as per `REQUIREMENTS.MD` (6.2, 6.3).
    *   Add commonly used Shadcn/UI components as needed (e.g., button, input, table, dialog, select).
*   **Reference**: `REQUIREMENTS.MD` (6.2, `components.json`)

### 2.4. Configure ESLint & Prettier
*   **Action**: Set up and configure ESLint and Prettier for code quality and consistency.
*   **Details**:
    *   Ensure `eslint.config.js` and Prettier configuration are in place and integrated with the IDE.
    *   Consider adding a pre-commit hook (e.g., using Husky and lint-staged) to automatically lint and format code before commits.
        *   `npm install --save-dev husky lint-staged`
        *   Configure `husky` and `lint-staged` in `package.json`.
*   **Reference**: `REQUIREMENTS.MD` (3.3, 6.2)

### 2.5. Setup Jest & React Testing Library
*   **Action**: Configure the testing environment.
*   **Details**: Create React App comes with Jest and React Testing Library. Ensure configurations are optimal for TypeScript.
*   **Reference**: `REQUIREMENTS.MD` (6.2, 8.5)

### 2.6. Initialize Git Repository
*   **Action**: If not already a Git repository, initialize one.
*   **Command**: `git init`
*   **Details**: Create an initial commit with the project structure and configuration files. Create a `.gitignore` file (if not present from the template) to exclude `node_modules/`, `build/`, `.env.local`, etc.

## 3. Core Data Structures & Types (`src/types/`)

This phase focuses on defining the main data structures, adhering to `REQUIREMENTS.MD` (Section 7.1). All types and interfaces should include TSDoc comments.

### 3.1. `Product.ts`
*   **Action**: Create `src/types/product.ts`.
*   **Content**: Define the `Product` interface:
    ```typescript
    /**
     * Represents a product in the inventory.
     */
    export interface Product {
      /** Unique identifier for the product (UUID format). */
      id: string;
      /** Name of the product. Max 255 characters. Required. */
      name: string;
      /** Quantity of the product in stock. Integer, non-negative. Required. */
      quantity: number;
      /** Unit of measurement for the product (e.g., "pcs", "kg", "l"). Max 50 characters. Required. */
      unit: string;
      /** Location of the product in the warehouse (e.g., "Shelf A3"). Max 100 characters. Optional. */
      location?: string;
      /** Date when the product was first added (ISO 8601 format). */
      dateAdded: string;
      /** Date when the product was last modified (ISO 8601 format). */
      dateModified: string;
      /** Optional minimum stock level for shortage reports. */
      minimumStockLevel?: number; 
    }
    ```
*   **Reference**: `REQUIREMENTS.MD` (7.1)

### 3.2. Other Types
*   **Action**: Create `src/types/common.types.ts` or add to existing type files.
*   **Content**: Define types for sorting, filtering, form data, API responses (if any planned beyond local storage).
    ```typescript
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
    ```
*   **TSDoc**: Ensure comprehensive TSDoc comments for all exported types and interfaces.

## 4. Services Layer (`src/services/`)

This layer will handle all business logic and data manipulation, primarily interacting with Local Storage.

### 4.1. `localStorageService.ts`
*   **Action**: Create `src/services/localStorageService.ts`.
*   **Purpose**: Generic utility functions for Local Storage interaction.
*   **Functions**:
    *   `getItem<T>(key: string): T | null`
    *   `setItem<T>(key: string, value: T): void`
    *   `removeItem(key: string): void`
*   **TSDoc**: Add TSDoc for all functions.

### 4.2. `productService.ts`
*   **Action**: Create `src/services/productService.ts`.
*   **Purpose**: Manage CRUD operations for products.
*   **Constants**:
    *   `const INVENTORY_STORAGE_KEY = 'warehouseInventoryData';`
*   **Functions**:
    *   `getProducts(): Product[]`: Retrieves all products from Local Storage.
    *   `getProductById(id: string): Product | undefined`: Retrieves a single product by ID.
    *   `addProduct(productData: Omit<Product, 'id' | 'dateAdded' | 'dateModified'>): Product`:
        *   Generates a UUID for `id` using the `uuid` library.
        *   Sets `dateAdded` and `dateModified` to the current timestamp (ISO 8601 using `date-fns`).
        *   Handles logic for checking existing product by name and unit (as per `REQUIREMENTS.MD` 7.2.3). If exists, prompts for quantity update or allows modification. (This prompt logic might be better handled in the UI calling this service, with the service providing a check function).
        *   `checkExistingProduct(name: string, unit: string): Product | undefined`
        *   Saves the updated product list to Local Storage.
    *   `updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'dateAdded'>>): Product | undefined`:
        *   Updates specified fields of an existing product.
        *   Updates `dateModified` to the current timestamp.
        *   Saves the updated product list.
    *   `deleteProduct(id: string): boolean`:
        *   Removes a product by ID.
        *   Saves the updated product list.
        *   Returns true if successful, false otherwise.
    *   `importProducts(products: Product[], strategy: 'replace' | 'merge'): void`:
        *   Implements import functionality (JSON). Validates input.
        *   `replace`: Overwrites existing inventory.
        *   `merge`: Merges with existing, overwriting duplicates by ID.
    *   `exportProducts(): Product[]`: Returns the current inventory for JSON export.
    *   `generateReportCSV(products: Product[], type: 'full' | 'shortages', globalMinStock?: number): string`:
        *   Generates a CSV string using `papaparse`.
        *   `full`: All product data.
        *   `shortages`: Products below `minimumStockLevel` (per product or global).
        *   Column headers as per `REQUIREMENTS.MD` (7.7).
*   **TSDoc**: Add TSDoc for all functions.
*   **Reference**: `REQUIREMENTS.MD` (7.1, 7.2, 7.3, 7.4, 7.7, 8.1)

## 5. State Management (`src/contexts/` or Zustand Store)

Manage global application state, primarily the product list and UI state.

### 5.1. Product State
*   **Action**: Choose a state management solution (React Context or Zustand/Jotai). For this project, `Zustand` is recommended for managing the product list and related operations due to its simplicity and performance benefits over Context API for larger datasets or more frequent updates.
*   **If Zustand (e.g., `src/store/productStore.ts`):**
    *   Define state: `products: Product[]`, `isLoading: boolean`, `error: string | null`.
    *   Define actions: `fetchProducts`, `addProduct`, `updateProduct`, `deleteProduct`. These actions will call the corresponding `productService` functions and update the store state.
*   **If React Context (e.g., `src/contexts/ProductContext.tsx`):**
    *   Create a context to provide products and functions to manipulate them.
    *   Use `useReducer` for complex state logic.
*   **Reference**: `REQUIREMENTS.MD` (6.2)

### 5.2. UI State (Optional, can be local or in store)
*   Manage states for filters, sorting preferences, modal visibility, current low stock threshold for filtering.
*   This can be part of the `productStore` or separate stores/contexts (e.g., `uiStore.ts` or `SettingsContext.tsx`).

## 6. Custom Hooks (`src/hooks/`)

Create reusable custom hooks to encapsulate logic.

### 6.1. `useProductManagement.ts` (if not fully handled by Zustand actions)
*   **Action**: Create `src/hooks/useProductManagement.ts`.
*   **Purpose**: Abstract interactions with the product state and service layer. Provides a clean API for components.
*   **Exports**: `products`, `addProductHandler`, `updateProductHandler`, `deleteProductHandler`, `isLoading`, `error`.
*   **Details**: This hook would interact with the Zustand store actions or Context.

### 6.2. `useDebounce.ts`
*   **Action**: Create `src/hooks/useDebounce.ts`.
*   **Purpose**: For debouncing user input, especially for the search functionality.
*   **Functionality**: Takes a value and a delay, returns the debounced value.

### 6.3. `useLocalStorage.ts` (if a generic hook is preferred over direct service calls in some places)
*   **Action**: Create `src/hooks/useLocalStorage.ts`.
*   **Purpose**: A generic hook to synchronize a React state with Local Storage.
*   **Functionality**: `const [storedValue, setValue] = useLocalStorage<T>(key, initialValue);`

## 7. UI Components (`src/components/`)

Develop reusable UI components, leveraging Shadcn/UI and adhering to the project structure.

### 7.1. Base UI Components (`src/components/ui/`)
*   **Action**: Utilize and customize Shadcn/UI components.
*   **Examples**: `Button`, `Input`, `Table`, `Dialog` (Modal), `Select`, `Label`, `Card`, `DropdownMenu`, `Checkbox`, `Tooltip`.
*   **Command**: `npx shadcn-ui@latest add [component-name]`

### 7.2. Application-Specific Components
*   **`Navbar.tsx` / `Sidebar.tsx`**: For application navigation.
    *   Links to Dashboard, Add Product.
*   **`ProductForm.tsx` (`src/components/products/ProductForm.tsx`)**:
    *   **Purpose**: Form for adding and editing products.
    *   **Integrate**: `react-hook-form` for form handling and validation.
    *   **Fields**: Name, Quantity, Unit, Location, Minimum Stock Level (optional).
    *   **Validation**: Based on `REQUIREMENTS.MD` (7.1).
    *   **Props**: `onSubmit: (data: ProductFormData) => void`, `initialData?: Product`.
*   **`ProductListItem.tsx` / `ProductCard.tsx` (`src/components/products/`)**:
    *   **Purpose**: Display a single product's information in a list or card format.
    *   **Content**: ID, Name, Quantity, Unit, Location, Date Modified.
    *   **Actions**: Edit and Delete buttons (triggering modals/navigation).
*   **`ProductTable.tsx` (`src/components/products/ProductTable.tsx`)**:
    *   **Purpose**: Display products in a Shadcn/UI `Table`.
    *   **Columns**: ID, Name, Quantity, Unit, Location, Date Modified, Actions (Edit, Delete).
    *   **Sorting**: Implement clickable column headers for sorting (Name, Quantity, Location, Date Modified) as per `REQUIREMENTS.MD` (7.5).
    *   **Props**: `products: Product[]`, `onEdit: (id: string) => void`, `onDelete: (id: string) => void`, `sortCriteria`, `onSortChange`.
*   **`ConfirmationModal.tsx` (`src/components/shared/ConfirmationModal.tsx`)**:
    *   **Purpose**: Generic modal for confirmations (e.g., delete product, replace inventory on import).
    *   **Shadcn/UI**: Use `Dialog`.
    *   **Props**: `isOpen`, `onClose`, `onConfirm`, `title`, `message`.
*   **`SearchBar.tsx` (`src/components/shared/SearchBar.tsx`)**:
    *   **Purpose**: Input field for searching products.
    *   **Props**: `onSearchChange: (searchTerm: string) => void`.
    *   **Implementation**: Use debounced input.
*   **`FileUpload.tsx` (`src/components/shared/FileUpload.tsx`)**:
    *   **Purpose**: UI for selecting a JSON file for import.
    *   **Props**: `onFileSelect: (file: File) => void`.
*   **`FilterControls.tsx` (`src/components/products/FilterControls.tsx`)**:
    *   **Purpose**: UI elements for filtering products (e.g., out of stock, low stock threshold input).
    *   **Props**: `currentFilters`, `onFilterChange`.
*   **TSDoc**: Ensure comprehensive TSDoc for all component props.
*   **Reference**: `REQUIREMENTS.MD` (6.3, 7)

## 8. Pages (`src/pages/`)

Develop page components that orchestrate UI components and application logic.

### 8.1. `DashboardPage.tsx`
*   **Purpose**: Main view of the application.
*   **Content**:
    *   `Navbar.tsx`.
    *   `SearchBar.tsx`.
    *   `FilterControls.tsx`.
    *   Button to navigate to "Add Product" page.
    *   Buttons for "Import JSON" and "Export JSON".
    *   Buttons for "Generate Warehouse Report (CSV)" and "Generate Shortages Report (CSV)".
    *   `ProductTable.tsx` to display the list of products.
    *   Pagination if product list is long.
*   **Logic**:
    *   Fetch and display products from the state management solution.
    *   Handle search, sort, and filter logic, updating the displayed product list.
    *   Handle navigation to edit page, trigger delete confirmation.
    *   Handle import/export actions.
    *   Handle report generation.
*   **Reference**: `REQUIREMENTS.MD` (7.5, 7.6, 7.7, 8.1)

### 8.2. `AddProductPage.tsx`
*   **Purpose**: Page for adding a new product.
*   **Content**:
    *   `Navbar.tsx`.
    *   `ProductForm.tsx`.
*   **Logic**:
    *   Handle form submission, call `addProduct` service/action.
    *   Provide user feedback (e.g., toast notification using a Shadcn/UI compatible library like `sonner`).
    *   Navigate back to dashboard or clear form on successful addition.
*   **Reference**: `REQUIREMENTS.MD` (7.2)

### 8.3. `EditProductPage.tsx`
*   **Purpose**: Page for editing an existing product.
*   **Route**: `/product/:id/edit`.
*   **Content**:
    *   `Navbar.tsx`.
    *   `ProductForm.tsx` pre-filled with product data.
*   **Logic**:
    *   Fetch product data based on `id` from route params.
    *   Handle form submission, call `updateProduct` service/action.
    *   Provide user feedback.
    *   Navigate back to dashboard on successful update.
*   **Reference**: `REQUIREMENTS.MD` (7.3)

### 8.4. (Optional) `SettingsPage.tsx`
*   **Purpose**: Page for application-level settings (e.g., global low stock threshold, theme).
*   **Logic**: Save settings to Local Storage or state management.

## 9. Routing (`App.tsx` & `src/index.tsx`)

Set up client-side routing using React Router.

### 9.1. Configure Routes
*   **Action**: Modify `src/App.tsx`.
*   **Content**:
    ```tsx
    import { BrowserRouter, Routes, Route } from 'react-router-dom';
    import DashboardPage from './pages/DashboardPage';
    import AddProductPage from './pages/AddProductPage';
    import EditProductPage from './pages/EditProductPage';
    // ... other imports

    function App() {
      return (
        <BrowserRouter>
          {/* Consider a Layout component for Navbar/Sidebar here */}
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/add-product" element={<AddProductPage />} />
            <Route path="/product/:id/edit" element={<EditProductPage />} />
            {/* Add other routes e.g., for SettingsPage */}
          </Routes>
        </BrowserRouter>
      );
    }

    export default App;
    ```
*   **Details**: Ensure `BrowserRouter` is set up in `src/index.tsx` or `src/App.tsx`.
*   **Reference**: `REQUIREMENTS.MD` (6.2)

## 10. Feature Implementation (Iterative Development)

Implement features incrementally, following the requirements. Test each feature thoroughly.

### 10.1. Product Definition & Storage (Foundation)
*   **Tasks**:
    1.  Implement `Product` type (`src/types/product.ts`).
    2.  Implement `localStorageService.ts`.
    3.  Implement `productService.ts` with basic Local Storage (get, set all products).
    4.  Setup Zustand store (or Context) for `products` array.
*   **Testing**: Basic unit tests for service functions.

### 10.2. Adding Products
*   **Tasks**:
    1.  Develop `ProductForm.tsx`.
    2.  Develop `AddProductPage.tsx`.
    3.  Implement `addProduct` in `productService.ts` (including UUID generation, timestamps, and check for existing name/unit as per 7.2).
    4.  Connect `AddProductPage` to the service via store actions/hooks.
    5.  Implement navigation to `AddProductPage`.
*   **Testing**: Unit tests for `addProduct` logic. Component tests for `ProductForm` validation and submission. E2E test for adding a product.
*   **Reference**: `REQUIREMENTS.MD` (7.2)

### 10.3. Viewing Warehouse Status (Dashboard)
*   **Tasks**:
    1.  Develop `DashboardPage.tsx` basic layout.
    2.  Develop `ProductListItem.tsx` (or `ProductCard.tsx`).
    3.  Develop `ProductTable.tsx` to display products from the store.
    4.  Implement basic data fetching and display on `DashboardPage`.
*   **Testing**: Component tests for product display.
*   **Reference**: `REQUIREMENTS.MD` (7.5)

### 10.4. Editing Stock
*   **Tasks**:
    1.  Develop `EditProductPage.tsx`.
    2.  Implement routing `/product/:id/edit`.
    3.  Allow navigation from `ProductTable` (Edit button) to `EditProductPage`.
    4.  Pre-fill `ProductForm` with existing data.
    5.  Implement `updateProduct` in `productService.ts` (update `dateModified`).
    6.  Connect `EditProductPage` to the service.
*   **Testing**: Unit tests for `updateProduct`. Component tests for form pre-fill and submission. E2E test for editing.
*   **Reference**: `REQUIREMENTS.MD` (7.3)

### 10.5. Deleting Products
*   **Tasks**:
    1.  Add "Delete" button to `ProductTable` rows.
    2.  Develop `ConfirmationModal.tsx`.
    3.  Implement `deleteProduct` in `productService.ts`.
    4.  Integrate modal confirmation before deletion.
*   **Testing**: Unit tests for `deleteProduct`. Component tests for modal interaction. E2E test for deletion.
*   **Reference**: `REQUIREMENTS.MD` (7.4)

### 10.6. Searching & Filtering
*   **Tasks**:
    1.  Implement `SearchBar.tsx` on `DashboardPage.tsx`.
    2.  Implement client-side search logic (name, ID, location) in `DashboardPage` or product store/hook (debounced).
    3.  Implement `FilterControls.tsx` for:
        *   Quantity = 0.
        *   Quantity < user-defined "low stock threshold" (input for threshold).
    4.  Implement sorting functionality in `ProductTable.tsx` (clickable headers).
*   **Testing**: Unit tests for search/filter/sort logic. Component tests for controls. E2E tests.
*   **Reference**: `REQUIREMENTS.MD` (7.5, 7.6)

### 10.7. Data Import/Export (JSON)
*   **Tasks**:
    1.  Add "Import JSON" and "Export JSON" buttons to `DashboardPage.tsx`.
    2.  Implement `FileUpload.tsx` for selecting import file.
    3.  Implement `exportProducts` and `importProducts` in `productService.ts` (or `fileService.ts`).
        *   Export: Trigger download of `inventory_backup_YYYYMMDD.json`.
        *   Import: Parse JSON, validate structure, offer "replace" or "merge" (with confirmation).
*   **Testing**: Unit tests for import/export logic. E2E tests for file operations.
*   **Reference**: `REQUIREMENTS.MD` (8.1)

### 10.8. Reporting (CSV)
*   **Tasks**:
    1.  Add "Generate Warehouse Report" and "Generate Shortages Report" buttons.
    2.  Implement `generateReportCSV` in `productService.ts` using `papaparse`.
        *   Warehouse Status: All products, specified columns.
        *   Shortages Report: Products where `Quantity < MinimumStockLevel`. Allow setting global or per-product `minimumStockLevel` (extend `Product` type and `ProductForm`).
    3.  Trigger CSV file download (e.g., `warehouse_status_YYYYMMDD_HHMMSS.csv`).
*   **Testing**: Unit tests for CSV generation logic.
*   **Reference**: `REQUIREMENTS.MD` (7.7)

## 11. Styling (`src/styles/` & Tailwind CSS)

### 11.1. Global Styles
*   **Action**: Setup `src/index.css` or `src/styles/globals.css` for base Tailwind directives and any custom global styles.
*   **Details**: `@tailwind base; @tailwind components; @tailwind utilities;`

### 11.2. Component Styling
*   **Action**: Apply Tailwind CSS utility classes directly in components for styling.
*   **Responsiveness**: Ensure UI is responsive and usable on common desktop screen sizes. Mobile/tablet is a plus.
*   **Consistency**: Maintain a consistent look and feel using Shadcn/UI's design system and Tailwind.

### 11.3. Accessibility
*   **Action**: Adhere to basic web accessibility standards (WCAG AA where feasible).
*   **Details**: Use semantic HTML. Ensure Shadcn/UI components are used correctly for accessibility. Test with keyboard navigation.

## 12. Testing (Jest & React Testing Library)

Implement tests throughout the development process.

### 12.1. Unit Tests
*   **Focus**:
    *   `productService.ts`: All CRUD operations, import/export, report generation logic.
    *   `localStorageService.ts`.
    *   Utility functions (`src/utils/`).
    *   Logic within custom hooks (`src/hooks/`).
    *   State manipulation logic in Zustand store.
*   **Tool**: Jest.

### 12.2. Component Tests
*   **Focus**:
    *   `ProductForm.tsx`: Rendering, validation, submission.
    *   `ProductTable.tsx`: Rendering data, sorting interactions.
    *   `ConfirmationModal.tsx`: Visibility, interactions.
    *   Other interactive components.
*   **Tool**: React Testing Library with Jest.

### 12.3. Integration Tests
*   **Focus**: Test interactions between multiple components/pages for key user flows.
    *   Example: Adding a product via `AddProductPage` and verifying it appears in `ProductTable` on `DashboardPage`.
*   **Tool**: React Testing Library with Jest.

### 12.4. Test Coverage
*   **Goal**: Aim for reasonable test coverage (e.g., >70%), especially for critical application logic.
*   **Command**: `npm test -- --coverage`
*   **Reference**: `REQUIREMENTS.MD` (8.5)

## 13. Documentation

Create comprehensive documentation as per `REQUIREMENTS.MD` (3.3) and `REVIEW_PROCESS.MD`.

### 13.1. Code Comments (TSDoc/JSDoc)
*   **Requirement**: Comprehensive JSDoc/TSDoc comments for all exported functions, classes, types/interfaces, and complex logic blocks.
*   **Content**: Explain the *why* and *how* where not immediately obvious.
*   **Standard**: Ensure comments are compatible with documentation generators like TypeDoc or Doxygen.
*   **Reference**: `REQUIREMENTS.MD` (3.3)

### 13.2. UML Diagrams
*   **Requirement**: Create Class Diagram and Use Case Diagrams.
*   **Tools**: Any standard UML modeling tool (e.g., diagrams.net, Lucidchart, PlantUML).
*   **Diagrams**:
    *   **Class Diagram**: Illustrating `Product` entity, its attributes, and any relationships.
    *   **Use Case Diagrams**:
        *   Adding a new product.
        *   Editing product quantity/details.
        *   Deleting a product.
        *   Viewing warehouse status (list, sort, filter).
        *   Searching for products.
        *   Generating reports (full and shortages).
        *   Importing/Exporting data.
        *   Actors: User.
*   **Storage**: Save diagrams as images (e.g., PNG, SVG) in a `documentation/uml/` directory within the project.
*   **Reference**: `REQUIREMENTS.MD` (3.6)

### 13.3. Generated Documentation
*   **Requirement**: Generate API documentation from TSDoc/JSDoc comments.
*   **Tool**: `TypeDoc` is highly recommended for TypeScript projects.
    *   `npm install --save-dev typedoc`
    *   Configure TypeDoc (e.g., in `typedoc.json` or `package.json` script).
    *   Script: `"doc": "typedoc --out docs src"`
*   **Output**: HTML documentation, to be included as a deliverable (e.g., in a `docs/` folder).
*   **Reference**: `REVIEW_PROCESS.MD` (Criterion 4: Doxygen or other well-prepared format)

### 13.4. `README.md`
*   **Action**: Update the main `README.md` file.
*   **Content**:
    *   Project title and brief description.
    *   Link to `REQUIREMENTS.MD` and `IMPLEMENTATION.MD`.
    *   Technology stack used.
    *   Prerequisites (Node.js, npm).
    *   Step-by-step instructions for:
        *   Cloning the repository.
        *   Installing dependencies (`npm install`).
        *   Running the development server (`npm start` or `npm run dev`).
        *   Building the application (`npm run build`).
        *   Running tests (`npm test`).
        *   Generating documentation (`npm run doc`).
    *   Overview of project structure.
    *   Key features.
*   **Reference**: `REQUIREMENTS.MD` (3.3)

### 13.5. `IMPLEMENTATION.MD` (This Document)
*   **Action**: Ensure this document is kept up-to-date if any significant changes to the plan occur.

## 14. Final Review & Polish

### 14.1. Code Review
*   **Focus**: Adherence to ESLint/Prettier rules, code clarity, modularity, proper use of TypeScript, TSDoc comments.
*   **Reference**: `REQUIREMENTS.MD` (3.3), `REVIEW_PROCESS.MD` (Criterion 3)

### 14.2. Functional Testing
*   **Action**: Thoroughly test all user scenarios outlined in `REQUIREMENTS.MD` (Section 4 and 7).
*   **Focus**: Edge cases, data validation, error handling, UI responsiveness.

### 14.3. Documentation Review
*   **Action**: Ensure all documentation (`README.MD`, generated API docs, UML diagrams) is accurate, complete, and well-prepared.
*   **Reference**: `REVIEW_PROCESS.MD` (Criterion 4, 5)

### 14.4. Non-Functional Requirements Check
*   **Action**: Verify compliance with non-functional requirements (data storage, UI, performance, testability).
*   **Reference**: `REQUIREMENTS.MD` (Section 3, 8)

## 15. Project Management (Trello)

*   **Recommendation**: Use a Trello board (or similar tool) to manage tasks.
*   **Structure**:
    *   Create lists for "To Do", "In Progress", "Testing", "Done".
    *   Break down the implementation steps from this document into individual Trello cards.
    *   Assign tasks and track progress.
*   **Reference**: `REVIEW_PROCESS.MD` (mentions Trello for progress documentation).


## 16. Backend API Server (`/server`)

The `/server` directory provides a simple Express.js backend for persistent product storage and API endpoints. This is used instead of (or in addition to) browser Local Storage for more realistic data management and multi-user scenarios.

### 16.1. `server.js`
- **Purpose**: Main entry point for the Express server.
- **Endpoints**:
  - `GET /api/products`: Returns all products as JSON.
  - `POST /api/products`: Adds a new product (auto-generates ID, timestamps).
  - `PUT /api/products/:id`: Updates an existing product by ID.
  - `DELETE /api/products/:id`: Deletes a product by ID.
- **Data Storage**: Reads/writes product data to `server/data/warehouse.json` and manages product ID sequencing in `server/data/meta.json`.
- **Initialization**: Ensures the data directory and files exist on startup.
- **Port**: Runs on port 3001 by default.

### 16.2. `/server/data/`
- **Purpose**: Stores persistent data for the backend API.
- **Files**:
  - `warehouse.json`: Array of product objects, each with fields like `id`, `name`, `quantity`, `unit`, `dateAdded`, `dateModified`, and optionally `minimumStockLevel`.
  - `meta.json`: Stores metadata, currently only the last used product ID (e.g., `{ "lastId": 4 }`).

This detailed plan should guide the development of the Warehouse Inventory Management SPA, ensuring all requirements are met and aligning with best practices for software development. 