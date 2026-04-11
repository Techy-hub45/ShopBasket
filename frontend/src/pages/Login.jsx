import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaLock, FaEnvelope, FaExclamationCircle } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/auth/login', { email, password }, config);
      login(data);
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden rounded-3xl mt-8">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/50 relative z-10"
      >
        <div>
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-primary to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 transform rotate-3">
             <FaLock className="text-white text-2xl -rotate-3" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-medium">Please sign in to your ShopBasket account</p>
        </div>
        
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
            <FaExclamationCircle className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </motion.div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 ml-1 cursor-pointer" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-slate-400" />
                </div>
                <input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all outline-none shadow-inner" 
                  placeholder="you@example.com" 
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1 ml-1 cursor-pointer">
                 <label className="block text-sm font-bold text-slate-700" htmlFor="password">Password</label>
                 <Link to="/forgot-password" className="text-xs font-bold text-primary hover:text-primary-dark transition">Forgot Password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-slate-400" />
                </div>
                <input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all outline-none shadow-inner" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-extrabold rounded-xl text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm font-medium text-slate-500 mt-8 pt-6 border-t border-slate-100">
          New Customer?{' '}
          <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="font-bold text-primary hover:text-primary-dark hover:underline transition">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
