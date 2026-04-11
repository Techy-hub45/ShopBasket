import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { token, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login?redirect=/wishlist');
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get('/api/users/profile', config);
        const list = (data.wishlist || []).filter(item => item !== null);
        setWishlist(list);
        updateUser({
          wishlist: list,
          walletBalance: data.walletBalance,
          rewardCoins: data.rewardCoins,
        });
      } catch (e) {
        console.error(e);
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, navigate, updateUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 lg:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <FaHeart className="text-red-500" /> My Wishlist
          </h1>
          <span className="text-sm font-bold text-slate-400">{wishlist.length} Items</span>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="text-5xl mb-4 text-slate-300">
              <FaHeart className="mx-auto" />
            </div>
            <p className="text-slate-500 font-medium mb-4">Your wishlist is empty.</p>
            <Link
              to="/"
              className="inline-block px-6 py-2 bg-slate-800 text-white rounded-full font-bold shadow-md hover:bg-slate-700 transition"
            >
              Discover products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item, idx) => (
              <ProductCard key={item._id} product={item} pIdx={idx} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Wishlist;
