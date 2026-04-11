import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaEnvelope, FaExclamationCircle, FaCheckCircle, FaLock } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setResetUrl('');

    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/auth/forgotpassword', { email }, config);
      setMessage(data.message);
      setResetUrl(data.mockResetUrl); // Mocking email delivery for demo UI
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
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/50 relative z-10"
      >
        <div>
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
             <FaLock className="text-white text-2xl" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-slate-800 tracking-tight">Recover Account</h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-medium">Enter your email and we'll send a reset link.</p>
        </div>
        
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
            <FaExclamationCircle className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </motion.div>
        )}

        {message && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-50 border border-green-200 p-6 rounded-2xl flex flex-col items-center gap-4 text-center shadow-inner">
            <FaCheckCircle className="text-green-500 text-3xl" />
            <div>
              <p className="text-sm text-green-800 font-bold mb-2">{message}</p>
              <p className="text-xs text-slate-600 mb-4">Because this is a demo environment without real email servers, please click the secure link below to proceed:</p>
              <Link to={resetUrl} className="inline-block bg-green-600 text-white font-bold py-2 px-6 rounded-full hover:bg-green-700 transition shadow-md">
                 Proceed to Reset Password
              </Link>
            </div>
          </motion.div>
        )}
        
        {!message && (
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
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-extrabold rounded-xl text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {loading ? 'Searching...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm font-medium text-slate-500 mt-8 pt-6 border-t border-slate-100">
          Remember your password?{' '}
          <Link to="/login" className="font-bold text-primary hover:text-primary-dark hover:underline transition">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
