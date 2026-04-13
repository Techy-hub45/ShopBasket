import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import OffersSlider from '../components/OffersSlider';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const location = useLocation();
  const keyword = new URLSearchParams(location.search).get('keyword') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/products?keyword=${keyword}`);
        setProducts(data);
        
        // Load recently viewed
        const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        if (viewedIds.length > 0) {
          const viewedProds = data.filter(p => viewedIds.includes(p._id));
          setRecentlyViewed(viewedProds.reverse().slice(0, 5)); // show latest 5
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch products. The server might be unreachable or restarting.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword]);

  // Group products by category
  const categories = products.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});

  const dealsOfTheDay = products.filter(p => p.discount >= 25).sort((a,b) => b.discount - a.discount).slice(0, 5);

  return (
    <div className="w-full pb-16">
      
      {/* TEMPORARY SEED BUTTON */}
      <div className="mt-4 mb-8 text-center bg-blue-100 p-8 rounded-xl shadow-lg border-2 border-blue-400">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">Final Deployment Step (Action Required)</h2>
        <p className="mb-6 font-medium text-blue-700">Click the button below exactly once to spawn all your products and your admin account into the live Cloud Database. Wait 15 seconds after clicking.</p>
        <button 
          onClick={async (e) => {
             const btn = e.currentTarget;
             btn.innerText = "⏳ Seeding Database... Please wait, this takes about 15 seconds!";
             btn.disabled = true;
             btn.classList.add("opacity-75");
             try {
                const res = await axios.get('/api/seed');
                alert(res.data);
                window.location.reload();
             } catch(err) {
                alert("Error: " + (err.response?.data || err.message));
                btn.innerText = "🚀 ONE-CLICK SETUP: SEED LIVE DATABASE";
                btn.disabled = false;
                btn.classList.remove("opacity-75");
             }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xl py-4 px-12 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all hover:scale-105 active:scale-95"
        >
          🚀 ONE-CLICK SETUP: SEED LIVE DATABASE
        </button>
      </div>

      {!keyword && <OffersSlider />}

      {!keyword && dealsOfTheDay.length > 0 && (
         <section className="relative mt-12 bg-gradient-to-r from-red-600 to-orange-500 -mx-4 px-4 py-12 lg:-mx-8 lg:px-8 xl:-mx-32 xl:px-32 shadow-lg mb-8">
           <div className="flex justify-between items-end mb-8 pb-4 border-b border-white/20">
             <div>
               <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                 <span className="text-2xl animate-pulse">🔥</span> DEALS OF THE DAY
               </h2>
               <p className="text-white/80 mt-2 font-medium">Hurry! Offer ends soon.</p>
             </div>
             <div className="bg-white text-red-600 font-bold px-4 py-2 rounded-full shadow-lg shadow-black/20 animate-pulse">
               UP TO 35% OFF
             </div>
           </div>
           
           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 gap-y-6 sm:gap-6">
             {dealsOfTheDay.map((product, pIdx) => (
                <div key={product._id + '-deal'} className="transform hover:-translate-y-2 transition duration-300">
                  <ProductCard product={product} pIdx={pIdx} />
                </div>
             ))}
           </div>
         </section>
      )}

      {keyword && (
        <div className="mb-8 pt-4">
          <h1 className="text-3xl font-bold text-slate-800">
             Search Results for "<span className="text-primary">{keyword}</span>"
          </h1>
          <p className="text-slate-500 mt-2">Found {products.length} products</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-red-50 rounded-3xl shadow-sm border border-red-100 flex flex-col items-center">
           <div className="text-6xl mb-4 text-red-400">⚠️</div>
           <p className="text-xl text-red-600 font-bold mb-2">Connection Error</p>
           <p className="text-red-500 font-medium mb-6 max-w-md">{error}</p>
           <button onClick={() => window.location.reload()} className="inline-block px-8 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition font-bold shadow-lg shadow-red-600/30">
             Try Again
           </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
           <div className="text-6xl mb-4">🔍</div>
           <p className="text-xl text-slate-600 font-medium mb-6">No products found matching your criteria</p>
           <Link to="/" className="inline-block px-8 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition font-bold shadow-lg shadow-primary/30">
             Clear Search
           </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-16">
          {Object.keys(categories).map((categoryName, idx) => (
             <section key={categoryName} className="relative mt-8">
               <div className="flex justify-between items-end mb-8 border-b-2 border-slate-100 pb-4">
                 <div>
                   <h2 className="text-3xl md:text-4xl font-black text-slate-800 capitalize tracking-tight flex items-center gap-3">
                     <span className="w-2 h-8 bg-primary rounded-full inline-block"></span>
                     {categoryName}
                   </h2>
                   <p className="text-slate-500 mt-2 font-medium">Explore our premium selection of top brands</p>
                 </div>
                 <Link to={`/?keyword=${categoryName}`} className="text-sm font-bold text-primary hover:text-primary-dark transition-all flex items-center gap-2 group bg-primary/5 px-4 py-2 rounded-full">
                   VIEW ALL <span className="group-hover:translate-x-1 transition-transform">→</span>
                 </Link>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 gap-y-8 sm:gap-6 sm:gap-y-10">
                 {categories[categoryName].slice(0, 5).map((product, pIdx) => (
                    <ProductCard key={product._id} product={product} pIdx={pIdx} />
                 ))}
               </div>
             </section>
          ))}
          
          {/* Recently Viewed Section */}
          {!keyword && recentlyViewed.length > 0 && (
             <section className="relative mt-8 bg-slate-50 -mx-4 px-4 py-12 lg:-mx-8 lg:px-8 xl:-mx-32 xl:px-32 rounded-3xl border border-slate-200/60 shadow-inner">
               <div className="flex justify-between items-end mb-8 pb-4">
                 <div>
                   <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                     <span className="text-2xl">⏳</span> Recently Viewed
                   </h2>
                   <p className="text-slate-500 mt-2 font-medium">Pick up where you left off</p>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 gap-y-6 sm:gap-6">
                 {recentlyViewed.map((product, pIdx) => (
                    <ProductCard key={product._id + '-recent'} product={product} pIdx={pIdx} />
                 ))}
               </div>
             </section>
          )}

        </div>
      )}
    </div>
  );
};

export default Home;
