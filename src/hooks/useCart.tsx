import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface CartItem {
  id: string;        // ✅ MUST be string
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;     // ✅ used for limit enforcement
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  /* ================= ADD TO CART — FIXED (STEP 10.2) ================= */
  const addToCart = (
    item: Omit<CartItem, "quantity"> & { quantity?: number }
  ) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      const qtyToAdd = item.quantity ?? 1;

      if (existing) {
        const newQuantity = Math.min(
          existing.quantity + qtyToAdd,
          item.stock
        );

        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: newQuantity }
            : i
        );
      }

      return [
        ...prev,
        {
          ...item,
          quantity: Math.min(qtyToAdd, item.stock),
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setItems(prev =>
      prev.map(i =>
        i.id === id
          ? { ...i, quantity: Math.min(quantity, i.stock) }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
};
