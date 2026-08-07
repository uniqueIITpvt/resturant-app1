import { renderHook, act } from '@testing-library/react';
import useConfirmation from '@/hooks/useConfirmation';

// Mock the ConfirmModalType since we're not actually rendering the modal
jest.mock('@/components/modals/ConfirmModal', () => ({
  ConfirmModalType: {
    default: 'default',
    delete: 'delete',
    warning: 'warning',
  },
}));

describe('useConfirmation Hook', () => {
  test('initial state is null', () => {
    const { result } = renderHook(() => useConfirmation());
    expect(result.current.confirmationState).toBeNull();
  });

  test('openConfirmation sets state with correct properties', () => {
    const { result } = renderHook(() => useConfirmation());

    act(() => {
      // Start the promise but don't await it
      result.current.openConfirmation({
        title: 'Test Title',
        message: 'Test Message',
      });
    });

    expect(result.current.confirmationState).toEqual({
      title: 'Test Title',
      message: 'Test Message',
      isOpen: true,
      resolve: expect.any(Function),
    });
  });

  test('handleConfirm resolves promise with true and clears state', async () => {
    const { result } = renderHook(() => useConfirmation());

    let resolvedValue = null;

    act(() => {
      result.current
        .openConfirmation({
          title: 'Test Title',
          message: 'Test Message',
        })
        .then((value) => {
          resolvedValue = value;
        });
    });

    // Confirm the dialog
    act(() => {
      result.current.handleConfirm();
    });

    // Let promises resolve
    await Promise.resolve();

    expect(resolvedValue).toBe(true);
    expect(result.current.confirmationState).toBeNull();
  });

  test('handleCancel resolves promise with false and clears state', async () => {
    const { result } = renderHook(() => useConfirmation());

    let resolvedValue = null;

    act(() => {
      result.current
        .openConfirmation({
          title: 'Test Title',
          message: 'Test Message',
        })
        .then((value) => {
          resolvedValue = value;
        });
    });

    // Cancel the dialog
    act(() => {
      result.current.handleCancel();
    });

    // Let promises resolve
    await Promise.resolve();

    expect(resolvedValue).toBe(false);
    expect(result.current.confirmationState).toBeNull();
  });

  test('confirmDelete sets up confirmation with delete type', async () => {
    const { result } = renderHook(() => useConfirmation());

    let confirmDeletePromise;

    act(() => {
      confirmDeletePromise = result.current.confirmDelete('Test Item');
    });

    expect(result.current.confirmationState).toEqual({
      title: 'Delete Confirmation',
      message:
        'Are you sure you want to delete "Test Item"? This action cannot be undone.',
      type: 'delete',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isOpen: true,
      resolve: expect.any(Function),
    });

    // Confirm the dialog
    act(() => {
      result.current.handleConfirm();
    });

    // Check the promise resolves to true
    const confirmResult = await confirmDeletePromise;
    expect(confirmResult).toBe(true);
  });

  test('handleConfirm does nothing if state is null', () => {
    const { result } = renderHook(() => useConfirmation());

    // State starts as null
    expect(result.current.confirmationState).toBeNull();

    // This should not throw an error
    act(() => {
      result.current.handleConfirm();
    });

    // State should still be null
    expect(result.current.confirmationState).toBeNull();
  });

  test('handleCancel does nothing if state is null', () => {
    const { result } = renderHook(() => useConfirmation());

    // State starts as null
    expect(result.current.confirmationState).toBeNull();

    // This should not throw an error
    act(() => {
      result.current.handleCancel();
    });

    // State should still be null
    expect(result.current.confirmationState).toBeNull();
  });

  test('openConfirmation with all options', () => {
    const { result } = renderHook(() => useConfirmation());

    act(() => {
      result.current.openConfirmation({
        title: 'Test Title',
        message: 'Test Message',
        type: 'warning',
        confirmText: 'Yes',
        cancelText: 'No',
      });
    });

    expect(result.current.confirmationState).toEqual({
      title: 'Test Title',
      message: 'Test Message',
      type: 'warning',
      confirmText: 'Yes',
      cancelText: 'No',
      isOpen: true,
      resolve: expect.any(Function),
    });
  });
});
