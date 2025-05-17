import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Optional: for a close button in footer or header
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmationModalProps {
  /** Controls whether the modal is open or closed. */
  isOpen: boolean;
  /** Callback function invoked when the modal is requested to be closed (e.g., by clicking outside or the cancel button). */
  onClose: () => void;
  /** Callback function invoked when the confirm button is clicked. */
  onConfirm: () => void;
  /** The title text displayed in the modal header. */
  title: string;
  /** The message content of the modal. Can be a string or a ReactNode for more complex content. */
  message: string | React.ReactNode;
  /**
   * Optional text for the confirm button.
   * @default "Confirm"
   */
  confirmButtonText?: string;
  /**
   * Optional text for the cancel button.
   * @default "Cancel"
   */
  cancelButtonText?: string;
  /**
   * Optional variant for the confirm button's appearance, based on Shadcn/UI Button variants.
   * @default "default"
   */
  confirmButtonVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonVariant = 'default',
}: ConfirmationModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {typeof message === 'string' ? (
            <DialogDescription>{message}</DialogDescription>
          ) : (
            message // Allow ReactNode for more complex messages
          )}
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              {cancelButtonText}
            </Button>
          </DialogClose>
          <Button
            variant={confirmButtonVariant}
            onClick={() => {
              onConfirm();
              // onClose(); // Optionally close modal on confirm, or let parent handle
            }}
          >
            {confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
