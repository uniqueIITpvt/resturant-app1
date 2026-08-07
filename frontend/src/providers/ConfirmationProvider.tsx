'use client';

import { createContext, useContext, ReactNode } from 'react';
import useConfirmation, { ConfirmationOptions } from '../hooks/useConfirmation';
import ConfirmModal from '@/components/modals/ConfirmModal';

interface ConfirmationContextValue {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
  confirmDelete: (itemName: string) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextValue | null>(
  null
);

export const useConfirmationDialog = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error(
      'useConfirmationDialog must be used within a ConfirmationProvider'
    );
  }
  return context;
};

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const {
    confirmationState,
    openConfirmation,
    handleConfirm,
    handleCancel,
    confirmDelete,
  } = useConfirmation();

  return (
    <ConfirmationContext.Provider
      value={{
        confirm: openConfirmation,
        confirmDelete,
      }}
    >
      {children}

      {confirmationState && (
        <ConfirmModal
          isOpen={confirmationState.isOpen}
          title={confirmationState.title}
          message={confirmationState.message}
          type={confirmationState.type}
          confirmText={confirmationState.confirmText}
          cancelText={confirmationState.cancelText}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmationContext.Provider>
  );
}
