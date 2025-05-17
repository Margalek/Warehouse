# Warehouse Inventory Management SPA

A single-page application for managing product inventory in a warehouse. Users can add, edit, delete products, view inventory status, import/export data, and generate reports.

This project is built with React, TypeScript, Vite, Tailwind CSS, and Shadcn/UI. It uses Zustand for state management and Jest with React Testing Library for testing.

## Related Documents

- [REQUIREMENTS.MD](./REQUIREMENTS.MD): Detailed functional and non-functional requirements.
- [IMPLEMENTATION.MD](./IMPLEMENTATION.MD): Detailed step-by-step implementation plan.

## Technology Stack

- **Frontend:** React (v19+), TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, Shadcn/UI
- **State Management:** Zustand
- **Routing:** React Router DOM
- **Form Handling:** React Hook Form, Zod
- **Testing:** Jest, React Testing Library
- **Linting/Formatting:** ESLint, Prettier
- **Utilities:** `uuid`, `date-fns`, `papaparse`

## Prerequisites

- Node.js (LTS version recommended, e.g., v18, v20)
- npm (comes with Node.js)

## Setup and Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd warehouse-inventory-management-spa
    ```

    _(Replace `<repository-url>` with the actual URL and `warehouse-inventory-management-spa` with your project's directory name if different)_

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Available Scripts

In the project directory, you can run the following commands:

- **`npm run dev`**
  Runs the app in development mode. Open [http://localhost:5173](http://localhost:5173) (or the port specified in your Vite config) to view it in your browser. The page will reload when you make changes.

- **`npm run build`**
  Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

- **`npm run lint`**
  Lints the project files using ESLint.

- **`npm run preview`**
  Serves the production build locally for previewing.

- **`npm test`**
  Runs all tests using Jest.

- **`npm run test:watch`**
  Runs tests in interactive watch mode.

- **`npm run test:coverage`**
  Runs tests and generates a code coverage report.

- **`npm run doc`**
  Generates API documentation from TSDoc comments using TypeDoc. The output will be in the `docs/` directory.

## Project Structure Overview (Key Directories)

```
.
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── layout/
│   │   ├── products/
│   │   ├── shared/
│   │   └── ui/         # Shadcn/UI components
│   ├── hooks/          # Custom React hooks
│   ├── integration/    # Integration tests
│   ├── pages/          # Page components
│   ├── services/       # Business logic and data services (localStorage, product)
│   ├── store/          # Zustand state management
│   ├── styles/         # Global styles (if any beyond Tailwind)
│   ├── types/          # TypeScript type definitions
│   └── App.tsx         # Main application component with routing
│   └── main.tsx        # Entry point of the application
├── documentation/
│   └── uml/            # UML diagrams (to be added by user)
├── docs/               # Generated TypeDoc documentation (after running npm run doc)
├── .eslintrc.cjs
├── .gitignore
├── .prettierrc.json
├── IMPLEMENTATION.MD
├── jest.config.cjs
├── jest.setup.ts
├── package.json
├── postcss.config.js
├── README.md           # This file
├── REQUIREMENTS.MD
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.jest.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Key Features

- Product CRUD (Create, Read, Update, Delete) operations.
- View warehouse status with sorting and filtering.
- Search products by ID, name, or location.
- Data persistence using browser Local Storage.
- Import/Export inventory data via JSON files.
- Generate warehouse status and shortage reports in CSV format.
