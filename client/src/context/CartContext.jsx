import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "grainhouse_cart";

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD": {
      // Prevent duplicate: same imageId + licenseType
      const exists = state.items.some(
        i => i.imageId === action.payload.imageId && i.licenseType === action.payload.licenseType
      );
      if (exists) return state;
      return { ...state, items: [...state.items, action.payload] };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter(i => i.imageId !== action.payload) };
    case "CLEAR":
      return { ...state, items: [] };
    case "SET_LICENSE": {
      return {
        ...state,
        items: state.items.map(i =>
          i.imageId === action.payload.imageId
            ? { ...i, licenseType: action.payload.licenseType, price: action.payload.price }
            : i
        ),
      };
    }
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const [state, dispatch] = useReducer(cartReducer, { items: saved });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addToCart    = (item)    => dispatch({ type: "ADD",         payload: item });
  const removeFromCart = (imageId) => dispatch({ type: "REMOVE",    payload: imageId });
  const clearCart    = ()        => dispatch({ type: "CLEAR" });
  const setLicense   = (data)   => dispatch({ type: "SET_LICENSE",  payload: data });

  const total = state.items.reduce((sum, i) => sum + (i.price || 0), 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      total,
      count: state.items.length,
      addToCart,
      removeFromCart,
      clearCart,
      setLicense,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};