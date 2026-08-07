import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { CartProvider, useCart, CartItem } from '@/context/CartContext';
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component that uses the cart context
const TestComponent = () => {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemTotal,
  } = useCart();

  const testItem: CartItem = {
    id: 'test-1',
    name: 'Test Item',
    price: 10.99,
    quantity: 1,
  };

  const testItemWithAddons: CartItem = {
    id: 'test-2',
    name: 'Test Item with Addons',
    price: 10.99,
    quantity: 1,
    selectedAddons: [
      {
        title: 'Size',
        options: [{ name: 'Large', price: 2.0 }],
      },
    ],
  };

  return (
    <div>
      <div data-testid='cart-count'>{cart.length}</div>
      <div data-testid='cart-total'>{getTotal()}</div>
      {cart.map((item) => (
        <div key={item.id} data-testid={`cart-item-${item.id}`}>
          <span data-testid={`item-name-${item.id}`}>{item.name}</span>
          <span data-testid={`item-quantity-${item.id}`}>{item.quantity}</span>
          <span data-testid={`item-total-${item.id}`}>
            {getItemTotal(item)}
          </span>
          <button onClick={() => removeFromCart(item.id)}>Remove</button>
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
            Increase
          </button>
          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
            Decrease
          </button>
        </div>
      ))}
      <button onClick={() => addToCart(testItem)}>Add Item</button>
      <button onClick={() => addToCart(testItemWithAddons)}>
        Add Item With Addons
      </button>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('initializes with an empty cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
  });

  it('loads cart from localStorage on mount', async () => {
    const storedCart = [
      { id: 'stored-1', name: 'Stored Item', price: 9.99, quantity: 2 },
    ];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(storedCart));

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
      expect(screen.getByTestId('cart-item-stored-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-name-stored-1')).toHaveTextContent(
        'Stored Item'
      );
    });
  });

  it('adds an item to the cart', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Initial cart should be empty
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');

    // Add an item
    act(() => {
      fireEvent.click(screen.getByText('Add Item'));
    });

    // Cart should have one item
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
      expect(screen.getByTestId('cart-item-test-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-name-test-1')).toHaveTextContent(
        'Test Item'
      );
      expect(screen.getByTestId('item-quantity-test-1')).toHaveTextContent('1');
      expect(screen.getByTestId('item-total-test-1')).toHaveTextContent(
        '10.99'
      );
    });
  });

  it('increases item quantity when adding the same item', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add the same item twice
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.click(screen.getByText('Add Item'));

    // Should have one item with quantity 2
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
      expect(screen.getByTestId('item-quantity-test-1')).toHaveTextContent('2');
      expect(screen.getByTestId('item-total-test-1')).toHaveTextContent(
        '21.98'
      );
    });
  });

  it('adds items with add-ons as separate entries', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add regular item and item with add-ons
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.click(screen.getByText('Add Item With Addons'));

    // Should have two separate items
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      expect(screen.getByTestId('cart-item-test-1')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-test-2')).toBeInTheDocument();

      // Check the total for the item with add-ons (10.99 + 2.00)
      expect(screen.getByTestId('item-total-test-2')).toHaveTextContent(
        '12.99'
      );
    });
  });

  it('updates item quantity', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add an item
    fireEvent.click(screen.getByText('Add Item'));

    // Increase quantity
    await waitFor(() => {
      fireEvent.click(screen.getByText('Increase'));
    });

    // Quantity should be 2
    await waitFor(() => {
      expect(screen.getByTestId('item-quantity-test-1')).toHaveTextContent('2');
      expect(screen.getByTestId('item-total-test-1')).toHaveTextContent(
        '21.98'
      );
    });
  });

  it('removes item when quantity is reduced to zero', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add an item
    fireEvent.click(screen.getByText('Add Item'));

    // Decrease quantity
    await waitFor(() => {
      fireEvent.click(screen.getByText('Decrease'));
    });

    // Item should be removed
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      expect(screen.queryByTestId('cart-item-test-1')).not.toBeInTheDocument();
    });
  });

  it('removes an item from cart', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add an item
    fireEvent.click(screen.getByText('Add Item'));

    // Remove the item
    await waitFor(() => {
      fireEvent.click(screen.getByText('Remove'));
    });

    // Cart should be empty
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      expect(screen.queryByTestId('cart-item-test-1')).not.toBeInTheDocument();
    });
  });

  it('clears the cart', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add items
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.click(screen.getByText('Add Item With Addons'));

    // Clear the cart
    await waitFor(() => {
      fireEvent.click(screen.getByText('Clear Cart'));
    });

    // Cart should be empty
    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      expect(screen.queryByTestId('cart-item-test-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('cart-item-test-2')).not.toBeInTheDocument();
    });
  });

  it('calculates cart total correctly', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add items
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.click(screen.getByText('Add Item With Addons'));

    // Check cart total (10.99 + 12.99 = 23.98)
    await waitFor(() => {
      expect(screen.getByTestId('cart-total')).toHaveTextContent('23.98');
    });
  });

  it('saves cart to localStorage when updated', async () => {
    // Clear any previous calls
    localStorageMock.setItem.mockClear();

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Add an item
    act(() => {
      fireEvent.click(screen.getByText('Add Item'));
    });

    // Check if localStorage was called with cart data
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cart',
        expect.any(String)
      );

      // Get the most recent call to setItem with 'cart' as first argument
      const cartCalls = localStorageMock.setItem.mock.calls.filter(
        (call) => call[0] === 'cart'
      );
      expect(cartCalls.length).toBeGreaterThan(0);

      const lastCartCall = cartCalls[cartCalls.length - 1];
      const savedCart = JSON.parse(lastCartCall[1]);

      expect(Array.isArray(savedCart)).toBe(true);
      expect(savedCart.length).toBeGreaterThan(0);
      expect(savedCart[0].id).toBe('test-1');
    });
  });
});
