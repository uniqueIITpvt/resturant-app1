'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SelectedAddonOption {
  name: string;
  price: number;
}

export interface SelectedAddon {
  title: string;
  options: SelectedAddonOption[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedAddons?: SelectedAddon[];
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemTotal: (item: CartItem) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error('Failed to parse stored cart', error);
        localStorage.removeItem('cart');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // Add item to cart
  const addToCart = (item: CartItem) => {
    setCart((currentCart) => {
      // Create a unique ID for the item that includes selected add-ons
      let uniqueIdentifier = item.id;

      // If the item has add-ons, include them in the unique identifier
      if (item.selectedAddons && item.selectedAddons.length > 0) {
        // Create a string representation of the selected add-ons
        const addonString = JSON.stringify(item.selectedAddons);
        // Create a hash of the add-on selections to append to the ID
        uniqueIdentifier = `${item.id}_${hashString(addonString)}`;
      }

      const existingItem = currentCart.find((cartItem) => {
        // For items without add-ons, just compare IDs
        if (!item.selectedAddons || item.selectedAddons.length === 0) {
          return (
            cartItem.id === item.id &&
            (!cartItem.selectedAddons || cartItem.selectedAddons.length === 0)
          );
        }

        // For items with add-ons, compare the full uniqueIdentifier
        const cartItemIdentifier =
          cartItem.id +
          (cartItem.selectedAddons
            ? `_${hashString(JSON.stringify(cartItem.selectedAddons))}`
            : '');

        return cartItemIdentifier === uniqueIdentifier;
      });

      let newCart;
      if (existingItem) {
        // Update quantity if item already exists
        newCart = currentCart.map((cartItem) => {
          // Check if this is the item to update using the same comparison logic
          const isMatch =
            !item.selectedAddons || item.selectedAddons.length === 0
              ? cartItem.id === item.id &&
                (!cartItem.selectedAddons ||
                  cartItem.selectedAddons.length === 0)
              : cartItem.id +
                  (cartItem.selectedAddons
                    ? `_${hashString(JSON.stringify(cartItem.selectedAddons))}`
                    : '') ===
                uniqueIdentifier;

          return isMatch
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem;
        });
      } else {
        // Add new item to cart
        // If the item has add-ons, update its ID to include the add-on hash
        const newItem = { ...item };
        if (item.selectedAddons && item.selectedAddons.length > 0) {
          // We don't actually modify the ID here, as that would change the product reference
          // Instead, we rely on the uniqueIdentifier for comparison only
        }
        newCart = [...currentCart, newItem];
      }

      return newCart;
    });
  };

  // Simple hash function for strings
  const hashString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart((currentCart) => {
      const newCart = currentCart.filter((item) => item.id !== itemId);
      return newCart;
    });
  };

  // Update item quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((currentCart) => {
      const newCart = currentCart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );

      return newCart;
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate total price
  const getTotal = () => {
    return cart.reduce((total, item) => total + getItemTotal(item), 0);
  };

  // Calculate total price for a single item including add-ons
  const getItemTotal = (item: CartItem) => {
    let itemTotal = item.price;

    // Add the price of selected add-ons
    if (item.selectedAddons && item.selectedAddons.length > 0) {
      item.selectedAddons.forEach((addonGroup) => {
        if (addonGroup.options && addonGroup.options.length > 0) {
          addonGroup.options.forEach((option) => {
            itemTotal += option.price;
          });
        }
      });
    }

    return itemTotal * item.quantity;
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
