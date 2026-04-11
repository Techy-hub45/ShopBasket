import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem('cartItems');
    if (data) {
      setCartItems(JSON.parse(data));
    }
  }, []);

  const addToCart = (product, qty) => {
    const item = {
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty,
    };

    setCartItems((prevItems) => {
      const existItem = prevItems.find((x) => x.product === item.product);
      if (existItem) {
        const newItems = prevItems.map((x) =>
          x.product === existItem.product ? item : x
        );
        localStorage.setItem('cartItems', JSON.stringify(newItems));
        return newItems;
      } else {
        const newItems = [...prevItems, item];
        localStorage.setItem('cartItems', JSON.stringify(newItems));
        return newItems;
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((x) => x.product !== id);
      localStorage.setItem('cartItems', JSON.stringify(newItems));
      return newItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
