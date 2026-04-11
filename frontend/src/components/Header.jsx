import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaShoppingBasket, FaBars, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const [keyword, setKeyword] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/?keyword=${keyword}`);
    } else {
      navigate('/');
    }
  };

  const location = useLocation();
  // Show minimal header (Logo & Name only) if the user is NOT signed in, OR if they are on an authentication page
  const isAuthPage = !user || ['/login', '/register', '/forgot-password'].includes(location.pathname) || location.pathname.startsWith('/reset-password');

  return (
    <>
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-100 w-full">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
          
          {isAuthPage ? (
            <div className="w-full flex justify-center py-2">
              <Link to="/" className="flex items-center gap-2 group">
                <motion.div whileHover={{ rotate: -10, scale: 1.1 }} className="text-primary text-3xl">
                  <FaShoppingBasket />
                </motion.div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">
                  ShopBasket
                </span>
              </Link>
            </div>
          ) : (
            <>
              {/* Global Menu Toggle & Logo */}
              <div className="flex items-center gap-2 sm:gap-3 w-auto sm:w-48 shrink-0">
                <button 
                  className="text-slate-600 hover:text-primary transition p-1"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <FaBars size={24} />
                </button>
                <Link to="/" className="flex items-center gap-2 group">
                  <motion.div whileHover={{ rotate: -10, scale: 1.1 }} className="text-primary text-3xl">
                    <FaShoppingBasket />
                  </motion.div>
                  <span className="hidden sm:block text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">
                    ShopBasket
                  </span>
                </Link>
              </div>
              
              {/* Groceries Link & Search */}
              <div className="flex-1 max-w-2xl px-2 sm:px-4 flex items-center gap-4">
                <Link to="/groceries" className="hidden lg:flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-full transition whitespace-nowrap">
                  🥬 Groceries
                </Link>
                <form onSubmit={submitHandler} className="flex-1 relative flex items-center group">
                  <input 
                    type="text" 
                    placeholder="Search premium products..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-5 pr-12 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-inner"
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                  <button type="submit" className="absolute right-1 w-10 h-10 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center transition-colors">
                    <FaSearch size={14} />
                  </button>
                </form>
              </div>

              {/* Nav Icons */}
              <nav className="flex gap-4 sm:gap-6 items-center shrink-0">
                <Link to="/cart" className="relative text-slate-600 hover:text-primary transition flex items-center gap-2">
                  <FaShoppingCart size={22} />
                  <span className="hidden md:block font-medium">Cart</span>
                  {cartItems.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm"
                    >
                      {cartItems.length}
                    </motion.span>
                  )}
                </Link>
                
                <div className="hidden lg:flex items-center gap-4">
                  {user ? (
                    <div className="flex items-center gap-4">
                      {user.isAdmin && (
                        <Link to="/admin" className="text-xs font-bold text-white bg-slate-800 px-3 py-1.5 rounded-md hover:bg-slate-700 transition">Admin Panel</Link>
                      )}
                      <Link to="/profile" className="flex items-center gap-2 text-slate-700 font-medium hover:text-primary transition">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <FaUser size={14} />
                        </div>
                        {user.name.split(' ')[0]}
                      </Link>
                      <button onClick={handleLogout} className="text-sm font-medium text-slate-500 hover:text-red-500 transition">Logout</button>
                    </div>
                  ) : (
                    <Link to="/login" className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full font-medium hover:bg-primary-dark transition shadow-md hover:shadow-lg">
                       Sign In
                    </Link>
                  )}
                </div>
              </nav>
            </>
          )}
        </div>
      </header>

      {/* Global Sidebar (Aside) Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 z-[100] backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween' }}
              className="fixed top-0 left-0 h-full w-[280px] bg-white z-[110] shadow-2xl flex flex-col"
            >
              <div className="p-5 flex justify-between items-center border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <FaShoppingBasket className="text-primary text-2xl" />
                  <span className="text-xl font-bold text-slate-800">ShopBasket</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-red-500 p-2">
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 py-6 flex flex-col gap-6">
                {user ? (
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl shadow-inner">
                      <FaUser />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-primary text-white py-3 rounded-xl font-semibold shadow-md">
                    Sign In / Register
                  </Link>
                )}

                <div className="flex flex-col gap-2">
                  <h3 className="uppercase text-xs font-bold text-slate-400 tracking-wider mb-2">Shopping</h3>
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 px-4 hover:bg-slate-50 rounded-lg text-slate-700 font-medium transition">Home</Link>
                  <Link to="/groceries" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 px-4 hover:bg-slate-50 rounded-lg text-green-600 font-bold transition">Shop Groceries</Link>
                  <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 px-4 hover:bg-slate-50 rounded-lg text-slate-700 font-medium transition">My Cart</Link>
                  {user && (
                    <>
                      <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 px-4 hover:bg-slate-50 rounded-lg text-slate-700 font-medium transition">My Orders</Link>
                      <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 px-4 hover:bg-slate-50 rounded-lg text-slate-700 font-medium transition">Wishlist</Link>
                    </>
                  )}
                </div>

                {user && user.isAdmin && (
                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-6">
                    <h3 className="uppercase text-xs font-bold text-slate-400 tracking-wider mb-2">Administration</h3>
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 px-4 bg-slate-800 hover:bg-slate-900 rounded-lg text-white font-bold transition shadow-md">
                       ⚙️ Admin Dashboard
                    </Link>
                  </div>
                )}
                
                <div className="flex flex-col gap-2 border-t border-slate-100 pt-6">
                  <h3 className="uppercase text-xs font-bold text-slate-400 tracking-wider mb-2">About ShopBasket</h3>
                  <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block group cursor-pointer">
                    <div className="py-2 px-4 bg-slate-50 group-hover:bg-primary/5 rounded-xl text-sm text-slate-600 group-hover:text-primary-dark leading-relaxed italic border border-slate-200 group-hover:border-primary/20 transition">
                      "Delivering premium quality products at affordable prices directly to your doorstep. Read our full story."
                    </div>
                  </Link>
                  <p className="px-4 mt-2 text-xs text-slate-400">Created with ❤️ for millions of happy Indian customers.</p>
                </div>
              </div>

              {user && (
                <div className="p-5 border-t border-slate-100 bg-slate-50">
                  <button onClick={handleLogout} className="w-full py-3 text-red-500 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition">
                    Logout Securely
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
