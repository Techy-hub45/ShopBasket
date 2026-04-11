import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaLock, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.put('/api/auth/resetpassword', { token, newPassword }, config);
      setMessage(data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
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
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-green-300/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/50 relative z-10"
      >
        <div>
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
             <FaLock className="text-white text-2xl" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-slate-800 tracking-tight">Create New Password</h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-medium">Please enter your new strong password below.</p>
        </div>
        
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
            <FaExclamationCircle className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </motion.div>
        )}

        {message && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl flex items-start gap-3">
            <FaCheckCircle className="text-green-500 mt-0.5 shrink-0" />
            <p className="text-sm text-green-700 font-medium">{message} Redirecting...</p>
          </motion.div>
        )}
        
        {!message && (
          <form className="mt-8 space-y-6" onSubmit={submitHandler}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1 cursor-pointer" htmlFor="password">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-slate-400" />
                  </div>
                  <input 
                    id="password" 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:bg-white transition-all outline-none shadow-inner" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1 cursor-pointer" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-slate-400" />
                  </div>
                  <input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:bg-white transition-all outline-none shadow-inner" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-extrabold rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {loading ? 'Saving...' : 'Reset Securely'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
