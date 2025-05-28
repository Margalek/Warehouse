import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type {
  Product,
  ProductFormData as ServiceProductFormData,
} from '@/types/product';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const internalProductFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or less'),
  quantity: z.coerce
    .number()
    .int('Quantity must be an integer')
    .nonnegative('Quantity must be non-negative'),
  unit: z
    .string()
    .min(1, 'Unit is required')
    .max(50, 'Unit must be 50 characters or less'),
  location: z
    .string()
    .max(100, 'Location must be 100 characters or less')
    .optional()
    .or(z.literal('')),
  minimumStockLevel: z.coerce
    .number()
    .int('Min. stock must be an integer')
    .nonnegative('Min. stock must be non-negative')
    .optional()
    .or(z.literal(NaN)),
  tags: z.string().optional().or(z.literal('')), // Comma-separated string for tags from form
});

// This is the type for the form's internal state/validation
type InternalFormShape = z.infer<typeof internalProductFormSchema>;

interface ProductFormProps {
  /**
   * Callback function triggered when the form is submitted with valid data.
   * The data is transformed to match the ServiceProductFormData structure.
   * @param data The product data from the form, ready to be processed.
   */
  onSubmit: (data: ServiceProductFormData) => void;
  /**
   * Optional product data to pre-fill the form for editing an existing product.
   * If provided, the submit button text changes to "Save Changes".
   */
  initialData?: Product;
  /**
   * Optional flag to indicate if the form submission is in progress.
   * If true, the submit button is disabled and shows "Submitting...".
   */
  isLoading?: boolean;
}

export function ProductForm({
  onSubmit,
  initialData,
  isLoading,
}: ProductFormProps) {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InternalFormShape>({
    resolver: zodResolver(internalProductFormSchema),
    defaultValues: {
      name: '',
      quantity: 0,
      unit: '',
      location: '',
      minimumStockLevel: undefined,
      tags: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        quantity: initialData.quantity,
        unit: initialData.unit,
        location: initialData.location || '',
        minimumStockLevel:
          initialData.minimumStockLevel === undefined ||
          initialData.minimumStockLevel === null
            ? undefined
            : initialData.minimumStockLevel,
        tags: initialData.tags?.join(', ') || '', // Convert array to comma-separated string for form
      });
    }
  }, [initialData, reset]);

  const processSubmit = (formData: InternalFormShape) => {
    const dataToSubmit: ServiceProductFormData = {
      name: formData.name,
      quantity: formData.quantity,
      unit: formData.unit,
      location: formData.location || undefined, // Ensure empty string becomes undefined if that's preferred for service
      minimumStockLevel: isNaN(formData.minimumStockLevel as number)
        ? undefined
        : Number(formData.minimumStockLevel),
      // Convert comma-separated string from form to array of strings for service
      tags: formData.tags
        ? formData.tags
            .split(',')
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag !== '')
        : undefined,
    };
    onSubmit(dataToSubmit);
  };

  // Helper type for Controller render prop
  type FormFieldRenderProps = ControllerRenderProps<
    InternalFormShape,
    keyof InternalFormShape
  >;

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Controller
          name="name"
          control={control}
          render={({ field }: { field: FormFieldRenderProps }) => (
            <Input id="name" placeholder="e.g., Industrial Widget" {...field} />
          )}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Controller
            name="quantity"
            control={control}
            render={({ field }: { field: FormFieldRenderProps }) => (
              <Input
                id="quantity"
                type="number"
                placeholder="e.g., 100"
                {...field}
              />
            )}
          />
          {errors.quantity && (
            <p className="text-sm text-red-500">{errors.quantity.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Controller
            name="unit"
            control={control}
            render={({ field }: { field: FormFieldRenderProps }) => (
              <Input id="unit" placeholder="e.g., pcs, kg, ltr" {...field} />
            )}
          />
          {errors.unit && (
            <p className="text-sm text-red-500">{errors.unit.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location (Optional)</Label>
        <Controller
          name="location"
          control={control}
          render={({ field }: { field: FormFieldRenderProps }) => (
            <Input
              id="location"
              placeholder="e.g., Shelf A1, Bay 3"
              {...field}
            />
          )}
        />
        {errors.location && (
          <p className="text-sm text-red-500">{errors.location.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="minimumStockLevel">
          Minimum Stock Level (Optional)
        </Label>
        <Controller
          name="minimumStockLevel"
          control={control}
          render={({ field }: { field: FormFieldRenderProps }) => (
            <Input
              id="minimumStockLevel"
              type="number"
              placeholder="e.g., 10"
              {...field}
              value={
                field.value === null ||
                field.value === undefined ||
                isNaN(field.value as number)
                  ? ''
                  : field.value
              }
              onChange={(e) =>
                field.onChange(
                  e.target.value === ''
                    ? undefined
                    : parseInt(e.target.value, 10),
                )
              }
            />
          )}
        />
        {errors.minimumStockLevel && (
          <p className="text-sm text-red-500">
            {errors.minimumStockLevel.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (Optional, comma-separated)</Label>
        <Controller
          name="tags"
          control={control}
          render={({ field }: { field: FormFieldRenderProps }) => (
            <Textarea
              id="tags"
              placeholder="e.g., fragile, electronics, clearance"
              {...field}
            />
          )}
        />
        {errors.tags && (
          <p className="text-sm text-red-500">{errors.tags.message}</p>
        )}
      </div>

      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Submitting...'
            : initialData
              ? 'Save Changes'
              : 'Add Product'}
        </Button>
      </div>
    </form>
  );
}
