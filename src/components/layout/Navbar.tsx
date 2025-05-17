import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Application navigation bar component.
 * Displays the application title/logo and primary navigation links.
 */
export function Navbar() {
  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-xl font-bold hover:text-primary-foreground/90"
        >
          Warehouse Inventory
        </Link>
        <div>
          <Link
            to="/add-product"
            className="bg-primary-foreground text-primary px-4 py-2 rounded hover:bg-primary-foreground/90 transition-colors"
          >
            Add Product
          </Link>
          {/* More navigation links can be added here */}
        </div>
      </div>
    </nav>
  );
}
