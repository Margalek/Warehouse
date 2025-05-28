# Warehouse Inventory Management System

A web-based warehouse management system that enables product tracking, inventory management, and report generation.

## Features

- Product Management (CRUD)
- Stock Level Tracking
- Product Location Management
- CSV Report Generation
- Data Import/Export
- Product Search and Filtering

## Technologies

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Styling: Tailwind CSS
- State Management: Zustand
- Forms: React Hook Form + Zod
- UI Components: Radix UI

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd warehouse
```

2. Install dependencies:

```bash
npm install
```

## Running the Application

The application consists of two parts: frontend and backend. Both need to be running simultaneously.

### Backend (API)

Start the API server:

```bash
npm run dev:server
```

The server will be available at `http://localhost:3001`

#### API Endpoints

- `GET /api/products` - get all products
- `POST /api/products` - add a new product
- `PUT /api/products/:id` - update a product
- `DELETE /api/products/:id` - delete a product

Example product structure:

```json
{
  "id": "string",
  "name": "string",
  "quantity": number,
  "unit": "string",
  "location": "string",
  "dateAdded": "string (ISO 8601)",
  "dateModified": "string (ISO 8601)",
  "minimumStockLevel": number
}
```

### Frontend

In a separate terminal, start the frontend application:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Scripts

- `npm run dev` - run frontend in development mode
- `npm run dev:server` - run backend in development mode
- `npm run build` - build the application
- `npm run preview` - preview the built application
- `npm run test` - run tests
- `npm run lint` - run linter

## Project Structure

```
warehouse/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── pages/            # Application pages
│   ├── services/         # Services and business logic
│   ├── store/            # State management (Zustand)
│   └── types/            # TypeScript definitions
├── server/               # Backend source code
│   ├── data/            # JSON data directory
│   └── server.js        # Express server
└── public/              # Static assets
```

## Data Storage

Data is stored in a JSON file in the `server/data/warehouse.json` directory. The file is automatically created when the server is first started.

## License

MIT
