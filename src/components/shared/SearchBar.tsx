import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce'; // Assuming useDebounce hook is created

interface SearchBarProps {
  /**
   * Callback function invoked when the debounced search term changes.
   * @param searchTerm The debounced search term string.
   */
  onSearchChange: (searchTerm: string) => void;
  /**
   * Optional delay in milliseconds for debouncing the search input.
   * @default 300
   */
  debounceDelay?: number;
  /**
   * Optional placeholder text for the search input field.
   * @default "Search..."
   */
  placeholder?: string;
}

export function SearchBar({
  onSearchChange,
  debounceDelay = 300, // Default debounce delay of 300ms
  placeholder = 'Search...',
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

  useEffect(() => {
    onSearchChange(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearchChange]);

  return (
    <Input
      type="search" // Use type="search" for better semantics and potential browser UI (e.g., clear button)
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="max-w-sm" // Example styling, can be adjusted
    />
  );
}
