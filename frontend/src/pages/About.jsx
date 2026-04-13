import React from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaTruck, FaShieldAlt, FaLeaf } from 'react-icons/fa';
import myFounderImage from '../assets/my1.jpg';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white min-h-[80vh] rounded-3xl shadow-sm border border-slate-100 my-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">ShopBasket</span></h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Delivering premium quality products at affordable prices directly to your doorstep. We are revolutionizing the e-commerce experience across India.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="bg-slate-50 p-8 rounded-3xl"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Our Story</h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            Hii I am Sanath P.The Creator of "ShopBasket",the E-commerce platform started with a simple idea: bringing the massive scale of a supermart straight into your hands without compromising on a premium, beautiful shopping experience. 
            We meticulously hand-pick products ranging from daily groceries to high-end electronics, forming a comprehensive catalog tailored for millions of happy customers.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="bg-primary/5 p-8 rounded-3xl border border-primary/10"
        >
          <h2 className="text-2xl font-bold text-primary-dark mb-4">Our Motto</h2>
          <p className="text-primary-dark/80 italic text-lg leading-relaxed font-medium">
            "Quality isn't an act, it is a habit. We strive to habitually deliver perfection."
          </p>
          <div className="mt-4 text-sm font-bold text-primary flex items-center gap-2">
             Created with <FaHeart className="text-red-500" /> by the ShopBasket Founder
          </div>
        </motion.div>
      </div>

      {/* Founder Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 mb-16 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors duration-500"></div>
        <div className="w-40 h-40 sm:w-48 sm:h-48 shrink-0 rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10 bg-slate-100">
           <img 
              src={myFounderImage}
              alt="Sanath P." 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
           />
        </div>
        <div className="text-center md:text-left z-10 relative">
           <span className="text-xs font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full mb-4 inline-block shadow-sm">Founder & Architect</span>
           <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-3">Sanath P.</h2>
           <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-medium">
             My Vision : I created ShopBasket with a singular vision: to orchestrate a seamless, premium, and infinitely scalable e-commerce ecosystem. My passion lies in fusing beautiful frontend aesthetics with highly resilient backend architectures, providing an uncompromising shopping experience for millions.
           </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-6">
          <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm">
            <FaLeaf />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Sustainable</h3>
          <p className="text-sm text-slate-500">Eco-friendly packaging for a better tomorrow.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="p-6">
          <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm">
            <FaShieldAlt />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">100% Secure</h3>
          <p className="text-sm text-slate-500">Advanced 256-bit encryption for seamless and safe transactions.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="p-6">
          <div className="w-16 h-16 mx-auto bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm">
            <FaTruck />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Fast Delivery</h3>
          <p className="text-sm text-slate-500">Express nationwide shipping across all pincodes.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
