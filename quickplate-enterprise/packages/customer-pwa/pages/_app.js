import '../styles/globals.css';
import { useState, useEffect } from 'react';

export default function App({ Component, pageProps }) {
  const [cart, setCart] = useState([]);
  const [orderStatus, setOrderStatus] = useState(null);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('quickplate-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('quickplate-cart', JSON.stringify(cart));
  }, [cart]);

  return (
    <Component 
      {...pageProps} 
      cart={cart}
      setCart={setCart}
      orderStatus={orderStatus}
      setOrderStatus={setOrderStatus}
    />
  );
}