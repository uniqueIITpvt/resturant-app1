import { ConfirmModalType } from '@/components/modals/ConfirmModal';
import { useState } from 'react';
// import { ConfirmModalType } from '../components/ConfirmModal';

export interface ConfirmationOptions {
  title: string;
  message: string;
  type?: ConfirmModalType
  confirmText?: string;
  cancelText?: string;
}

export interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean;
  resolve: (value: boolean) => void;
}

export default function useConfirmation() {
  const [confirmationState, setConfirmationState] =
    useState<ConfirmationState | null>(null);

  const openConfirmation = (options: ConfirmationOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmationState({
        ...options,
        isOpen: true,
        resolve,
      });
    });
  };

  const handleConfirm = () => {
    if (confirmationState) {
      confirmationState.resolve(true);
      setConfirmationState(null);
    }
  };

  const handleCancel = () => {
    if (confirmationState) {
      confirmationState.resolve(false);
      setConfirmationState(null);
    }
  };

  const confirmDelete = async (itemName: string): Promise<boolean> => {
    return openConfirmation({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      type: 'delete',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
  };

  return {
    confirmationState,
    openConfirmation,
    handleConfirm,
    handleCancel,
    confirmDelete,
  };
}
