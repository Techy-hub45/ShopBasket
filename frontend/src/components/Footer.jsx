import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaYoutube, FaTwitter, FaFacebook, FaShoppingBasket } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Footer = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return null;
  }

  return (
    <footer className="bg-slate-900 pt-16 pb-8 border-t border-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 text-white">
              <FaShoppingBasket className="text-primary text-3xl" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">
                ShopBasket
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mt-2">
              India's premium online shopping destination. We provide a massive range of electricals, fashion, and daily groceries delivered directly to your door at unbeatable prices.
            </p>
            <div className="flex gap-4 mt-2 text-xl">
              <a href="https://www.instagram.com/sanathsharma45/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors"><FaInstagram /></a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-red-500 transition-colors"><FaYoutube /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors"><FaTwitter /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors"><FaFacebook /></a>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Customer Care</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link to="/help" className="hover:text-primary transition-colors">Help Center & FAQs</Link></li>
              <li><Link to="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping Infos</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Categories</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link to="/?keyword=Mobiles" className="hover:text-primary transition-colors">Premium Mobiles</Link></li>
              <li><Link to="/?keyword=Clothing" className="hover:text-primary transition-colors">Men & Women Fashion</Link></li>
              <li><Link to="/groceries" className="hover:text-primary transition-colors text-green-400">Daily Groceries</Link></li>
              <li><Link to="/?keyword=Electrical" className="hover:text-primary transition-colors">Electrical Appliances</Link></li>
            </ul>
          </div>

          {/* Admin & Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Admin & Business</h3>
            <ul className="flex flex-col gap-3 text-sm mb-6">
              <li><Link to="/admin" className="text-primary hover:text-orange-400 font-medium transition-colors">Admin Dashboard Login</Link></li>
              <li><Link to="/sell" className="hover:text-primary transition-colors">Sell on ShopBasket</Link></li>
            </ul>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h4 className="text-xs font-bold text-white mb-2 uppercase">Subscribe to Deals</h4>
              <div className="flex">
                <input type="email" placeholder="Email address" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-l-md text-sm outline-none focus:border-primary" />
                <button className="bg-primary hover:bg-primary-dark px-3 py-2 rounded-r-md text-white"><FaShoppingBasket /></button>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Sanath P/ShopBasket India. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
