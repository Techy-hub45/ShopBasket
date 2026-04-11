import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserPlus, FaUser, FaEnvelope, FaLock, FaExclamationCircle, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

// Mock address suggestions for Task 17 & 20
const MOCK_ADDRESSES = [
  "123 MG Road, Bengaluru, 560001, India",
  "45 Brigade Road, Bengaluru, 560001, India",
  "78 Connaught Place, New Delhi, 110001, India",
  "12 Andheri West, Mumbai, 400053, India",
  "90 T Nagar, Chennai, 600017, India"
];

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
  }, [navigate, user, redirect]);

  const handleAddressChange = (e) => {
    const val = e.target.value;
    setAddressInput(val);
    if (val.length > 2) {
      const matches = MOCK_ADDRESSES.filter(addr => addr.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const selectAddress = (addr) => {
    setAddressInput(addr);
    setSuggestions([]);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      // Passing address to backend if supported
      const { data } = await axios.post('/api/auth/register', { name, email, password, phoneNumber }, config);
      login(data);
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden rounded-3xl mt-8">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-sky-300/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="max-w-xl w-full space-y-8 bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/50 relative z-10"
      >
        <div>
          <div className="mx-auto w-16 h-16 bg-gradient-to-bl from-primary to-rose-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 transform -rotate-3">
             <FaUserPlus className="text-white text-3xl rotate-3" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-slate-800 tracking-tight">Create Account</h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-medium">Join ShopBasket for an exclusive shopping experience</p>
        </div>
        
        {error && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
            <FaExclamationCircle className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </motion.div>
        )}
        
        <form className="mt-8 space-y-5" onSubmit={submitHandler}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 ml-1" htmlFor="name">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="text-slate-400" />
                </div>
                <input 
                  id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required 
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-inner text-sm" 
                  placeholder="John Doe" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 ml-1" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-slate-400" />
                </div>
                <input 
                  id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-inner text-sm" 
                  placeholder="john@example.com" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 ml-1" htmlFor="phone">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaPhone className="text-slate-400" />
                </div>
                <input 
                  id="phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required 
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-inner text-sm" 
                  placeholder="+91 9876543210" 
                />
              </div>
            </div>
            
            <div className="md:col-span-2 relative">
              <label className="block text-sm font-bold text-slate-700 mb-1 ml-1 cursor-pointer">Default Delivery Address (Auto-complete)</label>
              <div className="relative z-20">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-slate-400" />
                </div>
                <input 
                  type="text" 
                  value={addressInput} 
                  onChange={handleAddressChange} 
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-inner text-sm" 
                  placeholder="Start typing your address..." 
                  autoComplete="off"
                />
                
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.ul 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto"
                    >
                      {suggestions.map((addr, idx) => (
                        <li 
                          key={idx} 
                          onClick={() => selectAddress(addr)}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 font-medium flex items-center gap-2 transition-colors"
                        >
                          <FaMapMarkerAlt className="text-slate-300" /> {addr}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>

              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 ml-1" htmlFor="password">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-slate-400" />
                </div>
                <input 
                  id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-inner text-sm" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 ml-1" htmlFor="confirm">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-slate-400" />
                </div>
                <input 
                  id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required 
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-inner text-sm" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-extrabold rounded-xl text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mt-4 uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Register Securely'}
          </button>
        </form>

        <p className="text-center text-sm font-medium text-slate-500 mt-6 pt-6 border-t border-slate-100">
          Already have an account?{' '}
          <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="font-bold text-primary hover:text-primary-dark hover:underline transition">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
