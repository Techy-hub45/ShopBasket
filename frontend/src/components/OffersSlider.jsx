import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const defaultOffers = [
  {
    _id: 'default1',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000&auto=format&fit=crop',
    title: 'Massive Electronics Sale',
    subtitle: 'Up to 50% off on premium appliances',
    color: 'from-blue-900 to-indigo-800'
  },
  {
    _id: 'default2',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop',
    title: 'Fresh Fashion Arrivals',
    subtitle: 'Discover the latest trends for Men & Women',
    color: 'from-pink-600 to-purple-800'
  },
  {
    _id: 'default3',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000&auto=format&fit=crop',
    title: 'Daily Groceries Delivered Fast',
    subtitle: 'Fresh organic produce at your doorstep',
    color: 'from-emerald-700 to-green-900'
  }
];

const OffersSlider = () => {
  const [current, setCurrent] = useState(0);
  const [dynamicOffers, setDynamicOffers] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await axios.get('/api/banners');
        if (data && data.length > 0) {
          setDynamicOffers(data);
        } else {
          setDynamicOffers(defaultOffers);
        }
      } catch (err) {
        setDynamicOffers(defaultOffers);
      }
    };
    fetchBanners();
  }, []);

  const viewOffers = dynamicOffers.length > 0 ? dynamicOffers : defaultOffers;

  useEffect(() => {
    if (viewOffers.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % viewOffers.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [viewOffers.length]);

  if (viewOffers.length === 0) return null;

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden rounded-2xl mb-10 shadow-2xl group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${viewOffers[current].color} mix-blend-multiply opacity-60 z-10`}></div>
          <img 
            src={viewOffers[current].image} 
            alt={viewOffers[current].title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-start p-8 md:p-16 lg:p-24 text-white">
            <motion.span 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="px-3 py-1 mb-4 text-xs font-bold tracking-wider uppercase bg-primary rounded-full"
            >
              Limited Time Offer
            </motion.span>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl lg:text-7xl font-bold mb-4 max-w-2xl leading-tight drop-shadow-lg"
            >
              {viewOffers[current].title}
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-2xl opacity-90 font-medium drop-shadow-md"
            >
              {viewOffers[current].subtitle}
            </motion.p>
            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-primary hover:text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Shop Now
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Indicators */}
      {viewOffers.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
          {viewOffers.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full transition-all ${current === index ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OffersSlider;
