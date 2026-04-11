import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaHeart, FaStar, FaShoppingCart, FaArrowLeft, FaCheckCircle, FaTruck } from 'react-icons/fa';

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError(err.response && err.response.data.message ? err.response.data.message : err.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCartHandler = () => {
    addToCart({ 
      _id: product._id, 
      name: product.name, 
      image: Array.isArray(product.images) ? product.images[0] : product.image, 
      price: product.price 
    }, qty);
    navigate('/cart');
  };

  const likeHandler = async () => {
    if (!user) {
        navigate('/login');
        return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/products/${id}/like`, {}, config);
      setProduct({ ...product, likes: data.likes });
    } catch (err) {
      alert(err.response?.data?.message || 'Error liking product');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-16">
      <h3 className="text-2xl text-red-500 font-bold">{error}</h3>
      <Link to="/" className="inline-block mt-4 text-primary hover:underline">Return to Home</Link>
    </div>
  );

  const images = Array.isArray(product.images) ? product.images : [product.image];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-16 pt-4"
    >
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium mb-8">
        <FaArrowLeft /> Back to products
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Images Gallery */}
        <div className="flex flex-col-reverse lg:flex-row gap-4 sticky top-24">
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] scrollbar-hide py-1">
            {images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-slate-300'} bg-white`}
              >
                <img src={img} alt={`${product.name} - View ${idx + 1}`} className="w-full h-full object-contain p-2" />
              </button>
            ))}
          </div>
          <div className="flex-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
             <motion.img 
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={images[selectedImage]} 
              alt={product.name} 
              className="max-w-full max-h-[400px] object-contain drop-shadow-xl" 
            />
          </div>
        </div>
        
        {/* Details section */}
        <div className="flex flex-col">
          <div className="uppercase tracking-widest text-sm font-bold text-primary mb-2">
            {product.brand}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 leading-tight mb-4">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full text-sm font-bold text-green-700 border border-green-100">
              {product.rating} <FaStar className="text-green-500" />
            </div>
            <span className="text-slate-400 text-sm">{product.numReviews} Reviews</span>
            <span className="text-slate-300">|</span>
            <button onClick={likeHandler} className="flex items-center gap-1.5 text-pink-500 hover:text-pink-600 transition font-medium bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100">
              <FaHeart /> {product.likes || 0} Likes
            </button>
          </div>
          
          <div className="text-4xl font-bold text-slate-900 mb-6 flex items-end gap-3">
             ₹{product.price.toLocaleString('en-IN')}
             {product.discount && (
               <span className="text-lg text-slate-400 font-medium line-through mb-1">
                 ₹{Math.round(product.price * (1 + product.discount/100)).toLocaleString('en-IN')}
               </span>
             )}
          </div>
          
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl mb-8">
            <div className="flex items-center gap-3 text-sm text-slate-700 font-medium mb-4">
              <FaCheckCircle className="text-green-500 text-lg" /> 
              {product.countInStock > 0 ? `In Stock (${product.countInStock} available)` : <span className="text-red-500">Out of Stock</span>}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
              <FaTruck className="text-blue-500 text-lg" /> 
              Free premium delivery available
            </div>
          </div>

          {product.countInStock > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
               <div className="bg-slate-50 border border-slate-200 rounded-xl flex items-center overflow-hidden">
                 <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-12 h-14 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition text-xl bg-white"
                 >-</button>
                 <div className="w-16 h-14 flex items-center justify-center font-bold text-lg bg-white border-x border-slate-100">
                   {qty}
                 </div>
                 <button 
                  onClick={() => setQty(Math.min(product.countInStock, qty + 1))}
                  className="w-12 h-14 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition text-xl bg-white"
                 >+</button>
               </div>
               
               <button 
                  onClick={addToCartHandler} 
                  className="flex-1 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-primary/30"
               >
                  <FaShoppingCart /> Add To Cart
               </button>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;
