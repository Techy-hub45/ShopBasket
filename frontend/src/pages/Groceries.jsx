import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';

const Groceries = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All Essentials');

  const GROCERY_CATEGORIES = ['Staples & Atta', 'Snacks & Biscuits', 'Beverages', 'Vegetables', 'Fresh Fruits', 'Dry Fruits', 'Cereals & Pulses', 'Spices & Masalas', 'Beauty & Personal Care'];

  useEffect(() => {
    const fetchFruits = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/products');
        // Filter locally because we need everything across ~8 categories.
        const allGroceries = data.filter(p => GROCERY_CATEGORIES.includes(p.category));
        setProducts(allGroceries);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch groceries. The server might be unreachable or restarting.");
      } finally {
        setLoading(false);
      }
    };
    fetchFruits();
  }, []);

  const displayedProducts = activeTab === 'All Essentials' 
    ? products 
    : products.filter(p => p.category === activeTab);

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-16">
      
      {/* Groceries Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-r from-green-600 to-emerald-400 p-8 md:p-16 flex items-center justify-between shadow-xl"
      >
        <div className="relative z-10 text-white max-w-xl">
           <span className="uppercase tracking-widest font-black text-sm bg-white/20 px-3 py-1 rounded-full mb-4 inline-block backdrop-blur-md">100% Genuine & Fresh</span>
           <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">ShopBasket <br/> Groceries.</h1>
           <p className="text-green-50 text-lg md:text-xl font-medium">Daily essentials delivered straight to your door with unmatched freshness and quality.</p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none w-1/2 h-full bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="absolute top-10 right-20 text-8xl opacity-10 rotate-12">🥦</div>
        <div className="absolute bottom-10 right-40 text-9xl opacity-10 -rotate-12">🍞</div>
      </motion.div>

      {/* Recommended Filter Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
         {['All Essentials', ...GROCERY_CATEGORIES].map(tab => (
           <button 
             key={tab} 
             onClick={() => setActiveTab(tab)}
             className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-800'}`}
            >
             {tab}
           </button>
         ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-red-50 rounded-3xl border border-red-100 flex flex-col items-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-xl text-red-600 font-bold mb-2">Connection Error</p>
          <p className="text-red-500 font-medium mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-full font-bold shadow-md hover:bg-red-700 transition">Try Again</button>
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
          <p className="text-xl text-slate-500 font-medium">No groceries available in {activeTab} right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 gap-y-8 sm:gap-6 sm:gap-y-10">
          {displayedProducts.map((product, pIdx) => (
             <ProductCard key={product._id} product={product} pIdx={pIdx} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Groceries;
