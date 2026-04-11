import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaStar, FaRupeeSign } from 'react-icons/fa';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { wishlistIncludes } from '../utils/wishlist';

const ProductCard = ({ product, pIdx }) => {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user, token, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [product.image];

  useEffect(() => {
    setIsFavorite(wishlistIncludes(user?.wishlist, product._id));
  }, [user?.wishlist, product._id]);

  const handleMouseEnter = () => {
    if (images.length > 1) {
      setCurrentImageIdx(1); // Show second image on hover
    }
  };

  const handleMouseLeave = () => {
    setCurrentImageIdx(0); // Revert to first image
  };

  const toggleWishlist = async (e) => {
    e.preventDefault(); // prevent link navigation if placed inside one
    e.stopPropagation();
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Optimistic UI update
    setIsFavorite(!isFavorite);
    
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post('/api/users/wishlist/toggle', { productId: product._id }, config);
      if (data?.wishlist) {
        updateUser({ wishlist: data.wishlist });
      }
    } catch (err) {
      console.error(err);
      setIsFavorite(!isFavorite); // Revert on failure
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: pIdx * 0.05 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 group flex flex-col relative overflow-hidden"
    >
      {/* Discount Badge */}
      {product.discount > 0 && (
        <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
          -{product.discount}%
        </div>
      )}

      {/* Wishlist Button */}
      <button 
        onClick={toggleWishlist}
        className={`absolute top-4 right-4 z-10 w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer border border-slate-100 ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-white/90 text-slate-300 hover:text-red-400 hover:bg-red-50'}`}
      >
        <FaHeart size={14} className={isFavorite ? 'animate-pulse' : ''} />
      </button>

      {/* Image Container */}
      <Link to={`/product/${product._id}`} className="block relative w-full pt-[110%] bg-gradient-to-b from-slate-50 to-white rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-5 group-hover:from-slate-100 transition-colors duration-500">
        <motion.img 
          key={currentImageIdx} // Re-animate if key changes
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          src={images[currentImageIdx]} 
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400/png?text=ShopBasket'; }}
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700 ease-out"
        />
      </Link>
      
      {/* Details */}
      <div className="flex-1 flex flex-col px-1">
        <div className="flex justify-between items-start mb-1">
          <div className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded text-primary-dark w-fit">
            {product.brand}
          </div>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-xs font-bold text-amber-600">
             {product.rating} <FaStar size={10} className="text-amber-500 pb-0.5"/>
          </div>
        </div>
        
        <Link to={`/product/${product._id}`} className="text-slate-800 font-bold leading-snug mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors mt-1.5 sm:mt-2 text-xs sm:text-[15px]">
          {product.name}
        </Link>
        
        <div className="mt-auto pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
             <span className="text-sm sm:text-xl font-black text-slate-900 tracking-tight">₹{product.price.toLocaleString('en-IN')}</span>
             {product.discount > 0 && <span className="text-[10px] sm:text-xs text-slate-400 line-through font-medium">₹{Math.round(product.price * (1 + product.discount/100)).toLocaleString('en-IN')}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
