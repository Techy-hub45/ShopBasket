import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowRight, FaShoppingCart, FaShieldAlt } from 'react-icons/fa';
import { CartContext } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
  const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  const checkoutHandler = () => {
    navigate('/login?redirect=/checkout');
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  return (
    <div className="pb-16 pt-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full text-2xl">
          <FaShoppingCart />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">Shopping Cart</h1>
        <span className="ml-auto bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full font-bold text-sm border border-slate-200">
          {cartItems.reduce((acc, item) => acc + item.qty, 0)} Items
        </span>
      </div>
      
      {cartItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center"
        >
          <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
             <FaShoppingCart size={64} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-dark transition shadow-lg hover:-translate-y-1 transform">
            Start Shopping
          </Link>
        </motion.div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full flex flex-col gap-4">
            <AnimatePresence>
              {cartItems.map(item => (
                <motion.div 
                  key={item.product || item._id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, x: -20 }}
                  layout
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-6 group hover:shadow-md transition"
                >
                  <Link to={`/product/${item.product || item._id}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 rounded-xl p-2 flex-shrink-0 flex items-center justify-center">
                    <img src={item.image} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/png?text=Image'; }} alt={item.name} className="max-w-full max-h-full object-contain" />
                  </Link>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <Link to={`/product/${item.product || item._id}`} className="text-lg font-bold text-slate-800 hover:text-primary transition line-clamp-2 mb-2">
                      {item.name}
                    </Link>
                    <div className="text-xl font-bold text-slate-900">₹{item.price.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4 sm:gap-6 mt-3 sm:mt-0">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg flex items-center overflow-hidden h-12">
                      <button 
                        onClick={() => addToCart(item, Math.max(1, item.qty - 1))}
                        className="w-10 h-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition text-lg font-medium"
                      >-</button>
                      <div className="w-10 h-full flex items-center justify-center font-bold text-slate-700 border-x border-slate-200 bg-white">
                        {item.qty}
                      </div>
                      <button 
                        onClick={() => addToCart(item, Math.min(10, item.qty + 1))} // mockup max 10
                        className="w-10 h-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition text-lg font-medium"
                      >+</button>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.product || item._id)}
                      className="w-12 h-12 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-colors bg-red-50"
                      title="Remove Item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[380px] bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl lg:sticky lg:top-24"
          >
            <h2 className="text-xl font-bold text-slate-800 mb-6">Order Summary</h2>
            
            <div className="flex flex-col gap-4 text-slate-600 text-sm font-medium mb-6">
               <div className="flex justify-between items-center">
                 <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                 <span className="text-slate-800 font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between items-center text-green-600">
                 <span>Shipping</span>
                 <span>Free</span>
               </div>
               <div className="flex justify-between items-center">
                 <span>Estimated Tax</span>
                 <span>₹0</span>
               </div>
            </div>

            <div className="border-t border-slate-100 pt-6 mb-8">
              <div className="flex justify-between items-center mb-1">
                <span className="text-lg font-bold text-slate-800">Total</span>
                <span className="text-3xl font-black text-primary tracking-tight">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button 
              className="w-full bg-primary hover:bg-primary-dark text-white p-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              onClick={checkoutHandler}
            >
              Proceed to Checkout <FaArrowRight className="text-sm" />
            </button>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <FaShieldAlt className="text-green-500 text-base" /> Safe & Secure Payment
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Cart;
