'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '../supabase/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  hasPhysicalItems: boolean;
  hasDigitalItems: boolean;
  lastAddedProduct: Product | null;
  notification: string | null;
  dismissNotification: () => void;
}

const CART_STORAGE_KEY = 'ecommerce_cart_items';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);

  // Restore cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse cart storage:', e);
    }
  }, []);

  // Save cart to localStorage
  const saveItems = (newItems: CartItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    let newItems: CartItem[];
    const existingIndex = items.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      newItems = [...items];
      // Digital products typically only need quantity 1, but we allow increment if physical
      if (product.type === 'digital') {
        setNotification(`"${product.title}" sudah ada di keranjang Anda!`);
        return;
      }
      newItems[existingIndex].quantity += quantity;
    } else {
      newItems = [...items, { product, quantity }];
    }

    saveItems(newItems);
    setLastAddedProduct(product);
    setNotification(`Berhasil menambahkan "${product.title}" ke keranjang belanja.`);

    setTimeout(() => {
      setNotification((prev) => (prev ? null : prev));
    }, 4000);
  };

  const removeFromCart = (productId: string) => {
    const newItems = items.filter((item) => item.product.id !== productId);
    saveItems(newItems);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newItems = items.map((item) => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });
    saveItems(newItems);
  };

  const clearCart = () => {
    saveItems([]);
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const hasPhysicalItems = items.some((item) => item.product.type === 'physical');
  const hasDigitalItems = items.some((item) => item.product.type === 'digital');

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        hasPhysicalItems,
        hasDigitalItems,
        lastAddedProduct,
        notification,
        dismissNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
