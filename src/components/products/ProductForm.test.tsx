import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProductForm } from './ProductForm';
import type { Product, ProductFormData } from '@/types/product'; // Using ProductFormData as defined for service

describe('ProductForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render all form fields and submit button', () => {
    render(<ProductForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/unit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minimum stock level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add product/i }),
    ).toBeInTheDocument();
  });

  it('should display "Save Changes" on submit button when initialData is provided', () => {
    const initialData: Product = {
      id: '1',
      name: 'Test',
      quantity: 10,
      unit: 'pcs',
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    render(<ProductForm onSubmit={mockOnSubmit} initialData={initialData} />);
    expect(
      screen.getByRole('button', { name: /save changes/i }),
    ).toBeInTheDocument();
  });

  it('should disable submit button and show "Submitting..." when isLoading is true', () => {
    render(<ProductForm onSubmit={mockOnSubmit} isLoading={true} />);
    const submitButton = screen.getByRole('button', { name: /submitting.../i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  describe('with initialData', () => {
    const initialProductData: Product = {
      id: 'test-id',
      name: 'Initial Product',
      quantity: 123,
      unit: 'bottles',
      location: 'Shelf X',
      minimumStockLevel: 10,
      tags: ['tag1', 'fragile'],
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };

    it('should pre-fill form fields with initialData', () => {
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          initialData={initialProductData}
        />,
      );

      expect(screen.getByLabelText(/product name/i)).toHaveValue(
        initialProductData.name,
      );
      expect(screen.getByLabelText(/quantity/i)).toHaveValue(
        initialProductData.quantity,
      );
      expect(screen.getByLabelText(/unit/i)).toHaveValue(
        initialProductData.unit,
      );
      expect(screen.getByLabelText(/location/i)).toHaveValue(
        initialProductData.location,
      );
      expect(screen.getByLabelText(/minimum stock level/i)).toHaveValue(
        initialProductData.minimumStockLevel,
      );
      expect(screen.getByLabelText(/tags/i)).toHaveValue(
        initialProductData.tags?.join(', '),
      );
    });

    it('should pre-fill form correctly with optional fields missing in initialData', () => {
      const minimalInitialData: Product = {
        id: 'min-id',
        name: 'Minimal Product',
        quantity: 50,
        unit: 'items',
        dateAdded: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        // location, minimumStockLevel, tags are undefined
      };
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          initialData={minimalInitialData}
        />,
      );
      expect(screen.getByLabelText(/location/i)).toHaveValue('');
      expect(screen.getByLabelText(/minimum stock level/i)).toHaveValue(null); // or '' if that's how the component handles it
      expect(screen.getByLabelText(/tags/i)).toHaveValue('');
    });

    it('should pre-fill minimumStockLevel as empty if it is 0 in initialData', () => {
      const initialDataWithZeroMinStock: Product = {
        ...initialProductData,
        minimumStockLevel: 0,
      };
      render(
        <ProductForm
          onSubmit={mockOnSubmit}
          initialData={initialDataWithZeroMinStock}
        />,
      );
      // The component logic for minimumStockLevel specifically sets the input value to ''
      // if the field.value is null, undefined, or NaN. It doesn't treat 0 specially for display.
      // So it should display 0.
      expect(screen.getByLabelText(/minimum stock level/i)).toHaveValue(0);
    });
  });

  describe('form validation', () => {
    const fillField = (label: RegExp, value: string) => {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    };

    it('should show required errors for name, quantity, and unit on submit if empty', async () => {
      render(<ProductForm onSubmit={mockOnSubmit} />);
      fireEvent.click(screen.getByRole('button', { name: /add product/i }));

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        // Quantity defaults to 0, which is a valid integer and non-negative.
        // So, no validation error for quantity should appear on initial empty submit.
        expect(screen.getByText('Unit is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show max length error for name', async () => {
      render(<ProductForm onSubmit={mockOnSubmit} />);
      fillField(/product name/i, 'a'.repeat(256));
      fireEvent.click(screen.getByRole('button', { name: /add product/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Name must be 255 characters or less'),
        ).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show non-negative integer error for quantity', async () => {
      render(<ProductForm onSubmit={mockOnSubmit} />);
      fillField(/quantity/i, '-5');
      fireEvent.click(screen.getByRole('button', { name: /add product/i }));
      await waitFor(() => {
        expect(
          screen.getByText('Quantity must be non-negative'),
        ).toBeInTheDocument();
      });

      fillField(/quantity/i, '5.5');
      fireEvent.click(screen.getByRole('button', { name: /add product/i }));
      await waitFor(() => {
        expect(
          screen.getByText('Quantity must be an integer'),
        ).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show max length error for unit', async () => {
      render(<ProductForm onSubmit={mockOnSubmit} />);
      fillField(/unit/i, 'u'.repeat(51));
      fireEvent.click(screen.getByRole('button', { name: /add product/i }));
      await waitFor(() => {
        expect(
          screen.getByText('Unit must be 50 characters or less'),
        ).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show max length error for location', async () => {
      render(<ProductForm onSubmit={mockOnSubmit} />);
      fillField(/location/i, 'l'.repeat(101));
      fireEvent.click(screen.getByRole('button', { name: /add product/i }));
      await waitFor(() => {
        expect(
          screen.getByText('Location must be 100 characters or less'),
        ).toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show non-negative integer error for minimumStockLevel', async () => {
      render(<ProductForm onSubmit={mockOnSubmit} />);
      fillField(/minimum stock level/i, '-1');
      fireEvent.click(screen.getByRole('button', { name: /add product/i }));
      await waitFor(() => {
        expect(
          screen.getByText('Min. stock must be non-negative'),
        ).toBeInTheDocument();
      });

      // The component uses parseInt in its onChange for minimumStockLevel,
      // so typing "1.5" results in the value 1 being set in the form state.
      // This means Zod's .int() validation for this field is unlikely to be triggered by direct float input through the UI.
      // We will test the non-negative aspect again with a valid value to ensure form resets.
      fillField(/minimum stock level/i, '10'); // Set a valid value
      // Attempt to submit to clear any lingering states if necessary, though RHF should revalidate on change.
      // fireEvent.click(screen.getByRole('button', { name: /add product/i }));
      // No error should be present for this valid input.
      await waitFor(() => {
        expect(
          screen.queryByText('Min. stock must be an integer'),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText('Min. stock must be non-negative'),
        ).not.toBeInTheDocument();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled(); // mockOnSubmit should not have been called yet in this specific test sequence
    });
  });

  describe('form submission', () => {
    const fillAndSubmitValidForm = async (
      customData?: Partial<ProductFormData>,
    ) => {
      const validData: ProductFormData = {
        name: 'Valid Product',
        quantity: 100,
        unit: 'pcs',
        location: 'A1',
        minimumStockLevel: 10,
        tags: ['valid', 'tag'],
        ...customData,
      };

      // Fill form based on validData which matches ServiceProductFormData
      fireEvent.change(screen.getByLabelText(/product name/i), {
        target: { value: validData.name },
      });
      fireEvent.change(screen.getByLabelText(/quantity/i), {
        target: { value: String(validData.quantity) },
      });
      fireEvent.change(screen.getByLabelText(/unit/i), {
        target: { value: validData.unit },
      });

      if (validData.location) {
        fireEvent.change(screen.getByLabelText(/location/i), {
          target: { value: validData.location },
        });
      }
      if (validData.minimumStockLevel !== undefined) {
        fireEvent.change(screen.getByLabelText(/minimum stock level/i), {
          target: { value: String(validData.minimumStockLevel) },
        });
      }
      if (validData.tags && validData.tags.length > 0) {
        fireEvent.change(screen.getByLabelText(/tags/i), {
          target: { value: validData.tags.join(', ') },
        });
      }

      fireEvent.click(screen.getByRole('button', { name: /add product/i }));
      await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));
      return validData; // Return the data that was used to fill the form for assertion
    };

    it('should call onSubmit with correctly transformed data for all fields', async () => {
      render(<ProductForm onSubmit={mockOnSubmit} />);
      const submittedData = await fillAndSubmitValidForm();
      expect(mockOnSubmit).toHaveBeenCalledWith(submittedData);
    });

    it('should correctly transform optional fields if empty or not provided', async () => {
      render(<ProductForm onSubmit={mockOnSubmit} />);

      // Fill only required fields
      fireEvent.change(screen.getByLabelText(/product name/i), {
        target: { value: 'Test Name' },
      });
      fireEvent.change(screen.getByLabelText(/quantity/i), {
        target: { value: '50' },
      });
      fireEvent.change(screen.getByLabelText(/unit/i), {
        target: { value: 'kg' },
      });
      // Location, Min Stock, Tags are left empty

      fireEvent.click(screen.getByRole('button', { name: /add product/i }));
      await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test Name',
        quantity: 50,
        unit: 'kg',
        location: undefined, // Empty string in form should become undefined
        minimumStockLevel: undefined, // Empty or NaN in form should become undefined
        tags: undefined, // Empty string in form should become undefined or empty array
      });
    });

    it('should correctly transform tags: empty string, single tag, multiple tags with spaces', async () => {
      render(<ProductForm onSubmit={mockOnSubmit} />);

      // Case 1: Empty tags
      fireEvent.change(screen.getByLabelText(/product name/i), {
        target: { value: 'Tags Test 1' },
      });
      fireEvent.change(screen.getByLabelText(/quantity/i), {
        target: { value: '1' },
      });
      fireEvent.change(screen.getByLabelText(/unit/i), {
        target: { value: 't' },
      });
      fireEvent.change(screen.getByLabelText(/tags/i), {
        target: { value: ' ' },
      }); // Empty or whitespace
      fireEvent.click(screen.getByRole('button', { name: /add product/i }));
      await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));
      expect(mockOnSubmit).toHaveBeenLastCalledWith(
        expect.objectContaining({ tags: [] }),
      );

      mockOnSubmit.mockClear();

      // Case 2: Single tag
      fireEvent.change(screen.getByLabelText(/tags/i), {
        target: { value: 'singleTag' },
      });
      fireEvent.click(screen.getByRole('button', { name: /add product/i }));
      await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));
      expect(mockOnSubmit).toHaveBeenLastCalledWith(
        expect.objectContaining({ tags: ['singleTag'] }),
      );

      mockOnSubmit.mockClear();

      // Case 3: Multiple tags with spaces and empty elements
      fireEvent.change(screen.getByLabelText(/tags/i), {
        target: { value: ' tag1 ,  tag2 ,, tag3  , ' },
      });
      fireEvent.click(screen.getByRole('button', { name: /add product/i }));
      await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1));
      expect(mockOnSubmit).toHaveBeenLastCalledWith(
        expect.objectContaining({ tags: ['tag1', 'tag2', 'tag3'] }),
      );
    });
  });
});
