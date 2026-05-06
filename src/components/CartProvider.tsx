import { createContext, useContext, useState, useEffect } from "react";
import type { CartItem } from "../lib/cart-types";

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  incrementItem: (variantId: string) => void;
  decrementItem: (variantId: string) => void;
  clearCart: () => void;
  totalItems: number;
  total: number; // sum of price * quantity as a number
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}

const STORAGE_KEY = "hcm-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Start empty to avoid SSR hydration mismatch — localStorage loads after mount
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore corrupt storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (
    incoming: Omit<CartItem, "quantity"> & { quantity?: number },
  ) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === incoming.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === incoming.variantId
            ? { ...i, quantity: i.quantity + (incoming.quantity ?? 1) }
            : i,
        );
      }
      return [...prev, { ...incoming, quantity: incoming.quantity ?? 1 }];
    });
  };

  const removeItem = (variantId: string) =>
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));

  const incrementItem = (variantId: string) =>
    setItems((prev) =>
      prev.map((i) =>
        i.variantId === variantId ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );

  const decrementItem = (variantId: string) =>
    setItems((prev) =>
      prev
        .map((i) =>
          i.variantId === variantId ? { ...i, quantity: i.quantity - 1 } : i,
        )
        .filter((i) => i.quantity > 0),
    );

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const total = items.reduce(
    (acc, i) => acc + Number(i.price) * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        incrementItem,
        decrementItem,
        clearCart,
        totalItems,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
