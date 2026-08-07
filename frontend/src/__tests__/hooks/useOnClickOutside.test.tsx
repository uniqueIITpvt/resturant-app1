import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

// Component that uses the hook
const TestComponent = ({
  handler,
}: {
  handler: ((event: MouseEvent | TouchEvent) => void) | null;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, handler);

  return (
    <div>
      <div data-testid='outside'>Outside Element</div>
      <div ref={ref} data-testid='inside'>
        <button data-testid='inside-button'>Inside Button</button>
      </div>
    </div>
  );
};

describe('useOnClickOutside Hook', () => {
  test('handler is called when clicking outside the referenced element', () => {
    const handler = jest.fn();
    const { getByTestId } = render(<TestComponent handler={handler} />);

    // Click outside the ref element
    fireEvent.mouseDown(getByTestId('outside'));

    // Handler should be called
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('handler is not called when clicking inside the referenced element', () => {
    const handler = jest.fn();
    const { getByTestId } = render(<TestComponent handler={handler} />);

    // Click inside the ref element
    fireEvent.mouseDown(getByTestId('inside'));

    // Handler should not be called
    expect(handler).not.toHaveBeenCalled();
  });

  test('handler is not called when clicking on a child of the referenced element', () => {
    const handler = jest.fn();
    const { getByTestId } = render(<TestComponent handler={handler} />);

    // Click on a button inside the ref element
    fireEvent.mouseDown(getByTestId('inside-button'));

    // Handler should not be called
    expect(handler).not.toHaveBeenCalled();
  });

  test('handler is called for touch events outside the referenced element', () => {
    const handler = jest.fn();
    const { getByTestId } = render(<TestComponent handler={handler} />);

    // Touch outside the ref element
    fireEvent.touchStart(getByTestId('outside'));

    // Handler should be called
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('handler is not called for touch events inside the referenced element', () => {
    const handler = jest.fn();
    const { getByTestId } = render(<TestComponent handler={handler} />);

    // Touch inside the ref element
    fireEvent.touchStart(getByTestId('inside'));

    // Handler should not be called
    expect(handler).not.toHaveBeenCalled();
  });

  test('does not add event listeners if handler is null', () => {
    // Spy on document.addEventListener
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    // Render component with null handler
    const { unmount } = render(<TestComponent handler={null} />);

    // Expect no event listeners to be added
    expect(addEventListenerSpy).not.toHaveBeenCalled();

    // Unmount the component
    unmount();

    // Expect no event listeners to be removed
    expect(removeEventListenerSpy).not.toHaveBeenCalled();

    // Clean up
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test('removes event listeners on unmount', () => {
    // Spy on document.removeEventListener
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const handler = jest.fn();
    const { unmount } = render(<TestComponent handler={handler} />);

    // Unmount the component
    unmount();

    // Should remove both event listeners (mousedown and touchstart)
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'touchstart',
      expect.any(Function)
    );

    // Clean up
    removeEventListenerSpy.mockRestore();
  });
});
