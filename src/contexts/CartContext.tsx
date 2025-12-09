import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

// Unified cart item type that works with both static data and database items
export interface CartDish {
  id: string;
  name: string;
  telugu?: string | null;
  description?: string | null;
  price: number;
  category: string;
  region: string;
  type: string;
  image?: string;
  image_url?: string | null;
  popular?: boolean;
  is_popular?: boolean;
  ingredients?: string[];
  nutrition?: {
    calories: number;
    protein: string;
    carbs: string;
  } | null;
  is_available?: boolean;
}

interface CartItem extends CartDish {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (dish: CartDish) => void;
  removeFromCart: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  const addToCart = (dish: CartDish) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === dish.id);
      if (existingItem) {
        toast({
          title: 'Updated cart',
          description: `${dish.name} quantity increased`,
        });
        return prevCart.map((item) =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast({
        title: 'Added to cart',
        description: `${dish.name} added successfully`,
      });
      return [...prevCart, { ...dish, quantity: 1 }];
    });
  };

  const removeFromCart = (dishId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== dishId));
    toast({
      title: 'Removed from cart',
      description: 'Item removed successfully',
    });
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(dishId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === dishId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    toast({
      title: 'Cart cleared',
      description: 'All items removed from cart',
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
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
