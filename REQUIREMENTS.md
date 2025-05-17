Warehouse Inventory Management
1. General Description
The aim of the project is to create an application for managing product inventory.
The user should be able to add new products, edit their quantities, delete them, view the current warehouse status, and generate simple reports.
Data can be stored in text files (CSV/JSON/other format) – a database is not required.
2. Functional Requirements
2.1 Products in Stock
Each product should have at least the following information:
unique identifier (e.g., product code),
name,
quantity,
unit (e.g., pcs, kg, l),
location in the warehouse (e.g., shelf A3),
date of addition/last modification (optional).
2.2 Adding Products
Ability to add a new product to the warehouse.
Check if a product with a given ID already exists – in such a case, instead of adding a new one, the user can increase its quantity.
2.3 Editing Stock
Ability to change the quantity (e.g., increase or decrease).
Ability to edit product data (e.g., change name, location, unit).
2.4 Deleting Products
Ability to permanently delete a product from the warehouse.
Verification before deletion (e.g., operation confirmation).
2.5 Viewing Warehouse Status
Display a list of all products with basic information.
Ability to sort (e.g., by name, quantity, location).
Ability to filter (e.g., products with quantity = 0, specific shelf, etc.).
2.6 Searching
A simple search engine to find a product by name, ID, or location.
2.7 Reporting (optional)
Generate a warehouse status report (e.g., to a CSV or PDF file).
Ability to generate a report only for shortages (products < minimum stock level).
3. Non-functional Requirements
3.1 Data Storage
Data should be saved to files (e.g., JSON or CSV).
The data structure should be consistent and easy to edit (e.g., with a text editor).
3.2 User Interface
The interface can be:
console-based (text menu),
graphical (GUI),
web-based.
It should provide intuitive application operation, even in the console version.
3.3 Code Quality, Readability, and Documentation

*   **Understandable Structure & Modularity**: The code must be logically divided into modules, components, services, and functions, each with a clear single responsibility. The project structure defined in section 6.3 should be strictly followed to ensure an understandable and maintainable codebase. This directly addresses the "understandable structure" aspect of the "Readable code" evaluation criterion.
*   **Clarity and Style**: Code must be written in a clear, consistent style. Adherence to ESLint and Prettier rules (as configured in the project) is mandatory for maintaining style consistency. This contributes to the "Style" aspect of the "Readable code" criterion.
*   **Comments**: 
    *   Comprehensive JSDoc/TSDoc comments are required for all functions, classes, types/interfaces, and complex logic blocks. These comments should explain the *why* and *how* where not immediately obvious from the code itself, not just restate what the code does.
    *   These comments should be written in a format compatible with documentation generators like Doxygen, fulfilling the "comments" aspect of the "Readable code" criterion and contributing to formal documentation.
*   **Overall Documentation**: 
    *   The primary project documentation consists of this `REQUIREMENTS.MD` file, the `IMPLEMENTATION.MD` guide, and the UML diagrams (see section 3.6).
    *   Generated code documentation (e.g., from Doxygen using JSDoc/TSDoc comments) is expected as a deliverable, fulfilling the "Doxygen or other well-prepared format" evaluation criterion.
    *   All documentation should be well-prepared, clear, and accurately reflect the implemented system.

3.4 Security (optional)
Ability to secure the application with an administrator password (simple login).
Data protection against accidental overwriting (e.g., backup copies of the file).
3.5 Testability
The application should allow testing of the most important functions (e.g., adding a product, editing stock, saving/reading the file).

## 3.6. UML Diagrams
*   **Purpose**: To visually represent the system's structure and behavior, aiding understanding and design, and fulfilling evaluation criteria.
*   **Required Diagrams**:
    *   **Class Diagram**: Illustrating the main data structures (e.g., `Product` entity and its attributes, relationships with other potential entities if any).
    *   **Use Case Diagrams**: For key user scenarios outlined in Section 4 (e.g., "Adding a new product," "Editing quantity," "Generating a report"). Include actors (User) and their interactions with the system for these scenarios.
*   **Format**: Diagrams can be created using any standard UML modeling tool and should be included as images or in a readable format within the project documentation.

4. Example User Scenarios
Scenario 1 – Adding a new product
The user selects the "Add product" option.
They enter the data: ID, name, quantity, unit, location.
The data is saved to the file.
The product appears on the list.
Scenario 2 – Editing quantity
The user searches for the product by ID.
They change the quantity (e.g., increase by 20).
The system updates the data in the file.
Scenario 3 – Generating a report
The user selects the "Generate report" option.
The application creates a CSV file with the current warehouse status.
The user can open the report in a spreadsheet program.
5. Final Remarks
Data must be saved securely (e.g., with backup copies).
The application can be extended with additional features, e.g., barcode scanner, automatic low stock notifications, etc. – but they are not required

## 6. System Architecture and Technology Stack

### 6.1. Architecture Overview
The application will be a **client-side Single Page Application (SPA)** running entirely in the user's web browser. Data persistence will be handled using the browser's Local Storage, with functionality to import and export data as JSON files. This approach aligns with the requirement for file-based storage and simplicity, avoiding the need for a dedicated backend server for basic operations.

### 6.2. Technology Stack
*   **Frontend Framework**: React (v18+) with TypeScript.
    *   **Rationale**: Leverages the existing project setup (CRACO, `tsconfig.json`, `package.json` indicating React dependencies). Provides a robust and scalable component-based architecture. TypeScript enhances code quality and maintainability.
*   **Build Tool/Compiler**: Create React App (customized with CRACO, as per `craco.config.js`) and `tsc` (TypeScript Compiler).
*   **Styling**: Tailwind CSS (v3+).
    *   **Rationale**: Already configured (`tailwind.config.js`). Utility-first CSS framework for rapid UI development and customization.
*   **UI Component Library**: Shadcn/UI.
    *   **Rationale**: Indicated by the presence of `components.json`. Provides accessible and customizable components that integrate well with Tailwind CSS.
*   **Routing**: React Router (v6+).
    *   **Rationale**: Standard library for handling navigation in React applications.
*   **State Management**: React Context API for global state (e.g., user settings, theme) and component-level state (useState, useReducer). Zustand or Jotai can be considered if complex global state management becomes necessary.
    *   **Rationale**: Context API is built-in and sufficient for many cases. Zustand/Jotai offer simplicity for more complex scenarios without the boilerplate of Redux.
*   **Form Handling**: React Hook Form.
    *   **Rationale**: Efficient, flexible, and easy-to-use library for form validation and management.
*   **Data Storage**:
    *   **Primary**: Browser Local Storage (for immediate persistence).
    *   **Import/Export**: JSON file format. CSV for report generation.
    *   **Rationale**: Meets the requirement for file-based storage and ease of editing with a text editor. Local Storage provides a seamless user experience for data persistence between sessions.
*   **Linting & Formatting**: ESLint and Prettier.
    *   **Rationale**: Enforce code style consistency and catch potential errors early.
*   **Testing**: Jest and React Testing Library.
    *   **Rationale**: Standard testing tools for React applications, facilitating unit and integration testing.

### 6.3. Project Structure (Recommended)
```
storagesth/
├── public/
│   └── index.html
│   └── ... (other static assets)
├── src/
│   ├── App.tsx
│   ├── index.tsx
│   ├── components/         # Reusable UI components (e.g., Button, Input, Modal)
│   │   └── ui/             # Shadcn/UI components
│   ├── pages/              # Top-level page components (e.g., DashboardPage, AddProductPage)
│   ├── contexts/           # React Context providers (e.g., SettingsContext, AuthContext if added)
│   ├── hooks/              # Custom React hooks (e.g., useLocalStorage, useProductManagement)
│   ├── services/           # Data handling logic (e.g., productService.ts for CRUD operations on Local Storage)
│   ├── types/              # TypeScript type definitions and interfaces (e.g., product.ts)
│   ├── utils/              # Utility functions (e.g., validators.ts, formatters.ts)
│   ├── assets/             # Images, fonts, etc.
│   └── styles/             # Global styles, Tailwind base configuration
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── craco.config.js
└── REQUIREMENTS.MD
```

## 7. Detailed Functional Specifications

This section expands upon the functional requirements outlined in section 2.

### 7.1. Products in Stock
*   **Unique Identifier (ID)**:
    *   Format: UUID (Universally Unique Identifier, e.g., `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`).
    *   Generation: Automatically generated by the system upon adding a new product.
    *   Uniqueness: The system must ensure ID uniqueness within the inventory.
*   **Name**: String, max 255 characters. Required.
*   **Quantity**: Number, integer, non-negative. Required.
*   **Unit**: String (e.g., "pcs", "kg", "l", "m"). Predefined list or free text. Max 50 characters. Required.
*   **Location in the warehouse**: String (e.g., "Shelf A3", "Row 5, Bay 2"). Max 100 characters. Optional.
*   **Date of addition/last modification**:
    *   Format: ISO 8601 (e.g., `YYYY-MM-DDTHH:mm:ss.sssZ`).
    *   Tracking: `dateAdded` (set once on creation), `dateModified` (updated on any change to the product).

### 7.2. Adding Products
*   **UI Flow**:
    1.  User navigates to an "Add Product" form/page.
    2.  User fills in product details (Name, Quantity, Unit, Location). ID is auto-generated and displayed or hidden.
    3.  Upon submission:
        *   The system checks if a product with the *same name and unit* (acting as a composite key for user convenience, even if ID is the true unique key) already exists.
        *   If yes: Prompt the user: "A product named [Name] ([Unit]) already exists with quantity [Existing Quantity]. Do you want to update its quantity by adding [New Quantity]?"
            *   If user confirms: Update the existing product's quantity.
            *   If user cancels: Abort adding, allow user to modify details.
        *   If no: Create a new product record.
    4.  `dateAdded` and `dateModified` are set to the current timestamp.
    5.  Data is saved (e.g., to Local Storage and reflected in any exportable data structure).
    6.  User receives feedback (e.g., "Product added successfully").
    7.  The product list view is updated.

### 7.3. Editing Stock
*   **Selection**: User can select a product for editing from the product list (e.g., by clicking an "Edit" button on a product row).
*   **Editable Fields**: All product fields (Name, Quantity, Unit, Location) should be editable. The ID is non-editable.
*   **Quantity Updates**:
    *   Users can directly set a new quantity.
    *   Alternatively, provide options to "Increase by" or "Decrease by" a certain amount.
*   **Data Update**: `dateModified` is updated to the current timestamp. Changes are saved.
*   **Feedback**: User receives confirmation of the update.

### 7.4. Deleting Products
*   **Selection**: User can select a product for deletion from the product list.
*   **Verification**: A modal dialog should appear: "Are you sure you want to delete product [Product Name] (ID: [Product ID])? This action cannot be undone."
    *   Buttons: "Confirm Delete", "Cancel".
*   **Action**: If confirmed, the product is permanently removed from the data store.
*   **Feedback**: User receives confirmation of deletion.

### 7.5. Viewing Warehouse Status
*   **Display**: A tabular or card-based list of all products.
    *   Columns/Information displayed: ID, Name, Quantity, Unit, Location, Date Modified. Date Added can be optional in the main view.
*   **Sorting**:
    *   Clickable column headers for sorting by: Name (A-Z, Z-A), Quantity (Low-High, High-Low), Location (A-Z, Z-A), Date Modified (Newest-Oldest, Oldest-Newest).
    *   Default sort: By Date Modified (Newest first) or Name (A-Z).
*   **Filtering**:
    *   Text input for filtering by Name, ID, or Location (searches across these fields).
    *   Dropdown/checkbox filters for:
        *   Products with quantity = 0.
        *   Products with quantity < a user-defined "low stock threshold" (see 7.7).
        *   Specific units (if a predefined list is used).
        *   Specific locations (if common locations emerge).
*   **Pagination**: If the number of products exceeds a certain limit (e.g., 20-25 per page), implement pagination.

### 7.6. Searching
*   **Input**: A single search bar prominently displayed on the product list page.
*   **Scope**: Searches by product Name, ID, and Location.
*   **Behavior**:
    *   Real-time filtering of the list as the user types (debounced for performance).
    *   Case-insensitive search.
    *   Partial matches (e.g., "lap" matches "Laptop").
    *   Option to highlight matched text within results (optional enhancement).

### 7.7. Reporting (Optional, but recommended to implement for CSV)
*   **Warehouse Status Report**:
    *   Format: CSV file.
    *   Content: All product data (ID, Name, Quantity, Unit, Location, Date Added, Date Modified).
    *   Header Row: `ProductID,ProductName,Quantity,Unit,Location,DateAdded,DateModified`.
    *   Trigger: A "Generate Warehouse Report" button.
    *   File Name: `warehouse_status_YYYYMMDD_HHMMSS.csv`.
*   **Shortages Report**:
    *   Minimum Stock Level:
        *   Option 1 (Simple): A global setting for "minimum stock level" (e.g., 5 units).
        *   Option 2 (Advanced): Allow setting a "minimum stock level" per product. If not set for a product, it defaults to 0 or is excluded from this specific report.
    *   Content: Products where `Quantity` < `Minimum Stock Level`.
    *   Format: CSV, same columns as the full report, plus a `MinimumStockLevel` column if defined per product.
    *   Trigger: A "Generate Shortages Report" button.
    *   File Name: `shortages_report_YYYYMMDD_HHMMSS.csv`.

## 8. Detailed Non-Functional Specifications

This section expands upon the non-functional requirements outlined in section 3.

### 8.1. Data Storage
*   **Primary Mechanism**: Browser's Local Storage.
    *   The entire inventory will be stored as a JSON string under a specific key (e.g., `warehouseInventoryData`).
    *   Data structure within JSON: An array of product objects, where each object conforms to the structure defined in 7.1.
    *   Example: `[{id: "uuid1", name: "Laptop", ...}, {id: "uuid2", name: "Mouse", ...}]`
*   **Data Import/Export**:
    *   **Export**:
        *   Functionality to download the current inventory as a JSON file (`inventory_backup_YYYYMMDD.json`).
        *   This serves as the primary manual backup mechanism.
    *   **Import**:
        *   Functionality to upload a JSON file.
        *   The system should validate the file structure.
        *   Option to:
            *   Replace existing inventory.
            *   Merge with existing inventory (handling duplicates by ID: imported product overwrites existing). A confirmation should be required.
*   **Consistency**: The structure defined in 7.1 must be strictly adhered to. TypeScript interfaces will enforce this in code.
*   **Ease of Editing**: JSON format is human-readable and editable with any text editor.

### 8.2. User Interface (Web-based)
*   **Framework**: React with Shadcn/UI and Tailwind CSS.
*   **Responsiveness**: The UI must be responsive and usable on common desktop screen sizes. Mobile/tablet responsiveness is a plus but secondary for an inventory management system unless specified.
*   **Intuitive Operation**:
    *   Clear navigation (e.g., sidebar or top navigation bar).
    *   Consistent placement of action buttons (Add, Edit, Delete).
    *   Informative feedback messages for user actions (success, error, warnings).
    *   Loading indicators for any operations that might take noticeable time (though with Local Storage, this should be minimal).
*   **Accessibility**: Adhere to basic web accessibility standards (WCAG AA where feasible), especially with component choices from Shadcn/UI.

### 8.3. Code Quality and Modularity
*   **Structure**: Follow the project structure outlined in 6.3.
    *   `components/`: Dumb/presentational components.
    *   `pages/`: Smart components orchestrating UI and logic for specific views.
    *   `services/`: Business logic for data manipulation, Local Storage interaction.
    *   `hooks/`: Reusable stateful logic.
    *   `contexts/`: Global state management.
    *   `types/`: Centralized TypeScript definitions.
*   **Clarity and Comments**:
    *   Code should be self-documenting where possible.
    *   JSDoc/TSDoc comments for functions, types, and complex logic.
    *   Avoid obvious comments.
*   **Linting/Formatting**: ESLint and Prettier configured and enforced (e.g., via pre-commit hooks).
*   **Modularity**: Functions and components should have single responsibilities.

### 8.4. Security (Optional - Client-Side Context)
*   **Administrator Password**: Given the client-side nature and local file storage, true password protection is not robust. If implemented, it would be a simple client-side check, easily bypassable. This feature is deprioritized unless a backend is introduced.
*   **Data Protection**:
    *   Primary method: User-initiated export of the data file (JSON).
    *   The application should remind users to back up their data periodically (e.g., a non-intrusive notification if data hasn't been exported in X days).
    *   Accidental Overwriting: Import functionality should have clear warnings and confirmation steps before replacing existing data.

### 8.5. Testability
*   **Unit Tests (Jest)**:
    *   Focus on testing functions in `services/` (e.g., adding a product to the list, updating quantity, filtering logic).
    *   Test utility functions in `utils/`.
    *   Test logic within custom hooks in `hooks/`.
*   **Component Tests (React Testing Library)**:
    *   Test individual React components for correct rendering and basic interactions.
    *   Test form submissions and validation.
*   **Integration Tests**: Test interactions between multiple components/pages, especially for core user flows (e.g., adding a product and seeing it in the list).
*   **Coverage**: Aim for a reasonable test coverage, focusing on critical application logic.

### 8.6. Performance
*   **Data Operations**: Local Storage operations are generally fast. For very large inventories (thousands of items), consider optimizing data handling and rendering (e.g., list virtualization for product display) if performance degradation is observed.
*   **UI Rendering**: Efficient rendering with React, avoiding unnecessary re-renders.
*   **Initial Load Time**: Optimize asset sizes and leverage browser caching.