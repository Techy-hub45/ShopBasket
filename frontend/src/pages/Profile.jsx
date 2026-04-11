import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBoxOpen, FaHeart, FaWallet, FaCoins, FaSignOutAlt, FaUserCircle, FaPlus } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';

const Profile = () => {
  const { user, token, logout, login, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); // orders, wishlist, wallet
  const [orders, setOrders] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [addingMoney, setAddingMoney] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Fetch Orders
        const { data: ordersData } = await axios.get('/api/orders/myorders/all', config);
        setOrders(ordersData);
        
        // Fetch User Profile (Wishlist, Wallet, Coins)
        const { data: userData } = await axios.get('/api/users/profile', config);
        setProfileData(userData);
        updateUser({
          wishlist: (userData.wishlist || []).filter(item => item !== null),
          walletBalance: userData.walletBalance,
          rewardCoins: userData.rewardCoins,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, navigate, updateUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!addMoneyAmount || isNaN(addMoneyAmount) || Number(addMoneyAmount) <= 0) return;
    
    setAddingMoney(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post('/api/users/wallet/add', { amount: Number(addMoneyAmount) }, config);
      setProfileData(prev => ({ ...prev, walletBalance: data.walletBalance }));
      login({ ...user, walletBalance: data.walletBalance, token }); // update context user
      setAddMoneyAmount('');
      alert(`Successfully added ₹${addMoneyAmount} to your wallet!`);
    } catch (error) {
      console.error(error);
      alert('Error adding money: ' + (error.response?.data?.message || error.message));
    } finally {
      setAddingMoney(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Profile Sidebar */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-32 bg-gradient-to-br from-primary/80 to-orange-400"></div>
            
            <div className="relative z-10 w-24 h-24 rounded-full bg-white p-1 shadow-lg shadow-black/5 mt-8 mb-4 border border-white">
               <div className="w-full h-full rounded-full bg-slate-100 text-slate-300 flex items-center justify-center overflow-hidden">
                 <FaUserCircle className="w-full h-full text-slate-300 opacity-50 block" />
               </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{user?.name}</h3>
            <p className="text-sm text-slate-500 mb-6">{user?.email}</p>
            
            <div className="w-full flex justify-between px-4 py-3 bg-slate-50 rounded-2xl mb-2 text-left">
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Wallet</p>
                 <p className="font-bold text-slate-800">₹{(profileData?.walletBalance || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Coins</p>
                 <p className="font-bold text-amber-500 flex items-center justify-end gap-1">
                   <FaCoins size={12}/> {profileData?.rewardCoins || 0}
                 </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <FaBoxOpen size={18} /> My Orders
            </button>
            <button 
              onClick={() => setActiveTab('wishlist')}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold transition-all ${activeTab === 'wishlist' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <FaHeart size={18} /> My Wishlist
              {profileData?.wishlist?.length > 0 && (
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === 'wishlist' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {profileData.wishlist.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('wallet')}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold transition-all ${activeTab === 'wallet' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <FaWallet size={18} /> Wallet & Rewards
            </button>
            
            <div className="h-px bg-slate-100 my-2 mx-4"></div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold text-red-500 hover:bg-red-50 transition-all text-left"
            >
              <FaSignOutAlt size={18} /> Logout Securely
            </button>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="w-full lg:flex-1">
          <AnimatePresence mode="wait">
            
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <motion.div 
                key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <FaBoxOpen className="text-primary"/> Order History
                  </h2>
                </div>
                
                {orders.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <div className="text-5xl mb-4">📦</div>
                    <p className="text-slate-500 font-medium mb-4">You haven't placed any orders yet.</p>
                    <Link to="/" className="inline-block px-6 py-2 bg-primary text-white rounded-full font-bold shadow-md hover:bg-primary-dark transition">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-slate-100 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                         <div className="flex-1">
                           <div className="flex items-center gap-3 mb-2">
                             <span className="text-xs font-bold text-slate-400 bg-slate-200/50 px-2 py-1 rounded">ID: {order._id.substring(0, 8).toUpperCase()}</span>
                             <span className="text-sm font-bold text-slate-600">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year:'numeric' })}</span>
                           </div>
                           <p className="font-bold text-slate-800 mb-1">Total: ₹{order.totalPrice.toLocaleString('en-IN')}</p>
                           <div className="flex items-center gap-2">
                             {order.isPaid ? (
                               <span className="text-[11px] uppercase tracking-wider font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">Paid Successfully</span>
                             ) : (
                               <span className="text-[11px] uppercase tracking-wider font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">Payment Pending</span>
                             )}
                             
                             {/* Mock Delivery Status Label */}
                             <span className="text-[11px] uppercase tracking-wider font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200">
                               {order.isDelivered ? 'Delivered' : 'On the way'}
                             </span>
                           </div>
                         </div>
                         
                         <Link to={`/order/${order._id}`} className="shrink-0 flex items-center justify-center px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:border-primary hover:text-primary transition-all">
                           Track Order
                         </Link>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <motion.div 
                key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <FaHeart className="text-red-500"/> My Wishlist
                  </h2>
                  <span className="text-sm font-bold text-slate-400">{profileData?.wishlist?.length || 0} Items</span>
                </div>
                
                {profileData?.wishlist?.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <div className="text-5xl mb-4 text-slate-300"><FaHeart className="mx-auto" /></div>
                    <p className="text-slate-500 font-medium mb-4">Your wishlist is empty.</p>
                    <Link to="/" className="inline-block px-6 py-2 bg-slate-800 text-white rounded-full font-bold shadow-md hover:bg-slate-700 transition">Discover Favorites</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {profileData.wishlist.map((item, idx) => (
                      <ProductCard key={item._id} product={item} pIdx={idx} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* WALLET & REWARDS TAB */}
            {activeTab === 'wallet' && (
              <motion.div 
                key="wallet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Wallet Card */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-700 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl mix-blend-screen opacity-50"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                      <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2 mb-2">
                        <FaWallet /> ShopBasket Wallet
                      </h2>
                      <p className="text-5xl sm:text-6xl font-black tracking-tighter">
                        <span className="text-slate-400 font-normal text-4xl mr-1">₹</span>
                        {(profileData?.walletBalance || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    
                    <form onSubmit={handleAddMoney} className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex gap-2 w-full md:w-auto">
                      <input 
                        type="number" 
                        value={addMoneyAmount}
                        onChange={(e) => setAddMoneyAmount(e.target.value)}
                        placeholder="Amount" 
                        className="bg-transparent text-white placeholder-slate-400 font-bold px-4 py-2 w-32 focus:outline-none focus:ring-0 appearance-none"
                        min="1"
                      />
                      <button 
                        type="submit" 
                        disabled={addingMoney || !addMoneyAmount}
                        className="bg-primary hover:bg-primary-dark text-white rounded-xl px-5 py-2 font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                         {addingMoney ? 'Adding...' : <><FaPlus size={12}/> Add Money</>}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Reward Coins Card */}
                <div className="bg-gradient-to-br from-amber-100 to-yellow-50 rounded-3xl p-8 sm:p-10 shadow-sm border border-amber-200 relative overflow-hidden">
                   <div className="absolute -right-10 -bottom-10 text-[150px] opacity-20 rotate-12 drop-shadow-lg"><FaCoins className="text-amber-500" /></div>
                   
                   <div className="relative z-10 max-w-lg">
                     <h2 className="text-2xl font-black text-amber-900 flex items-center gap-3 mb-2">
                        Reward Coins
                     </h2>
                     <p className="text-amber-700 font-medium mb-6">Earn coins on every purchase. Use them for exclusive discounts during checkout.</p>
                     
                     <div className="flex items-baseline gap-2">
                       <span className="text-6xl font-black text-amber-600 tracking-tighter drop-shadow-sm">{profileData?.rewardCoins || 0}</span>
                       <span className="text-lg font-bold text-amber-700 uppercase tracking-widest">Coins</span>
                     </div>
                     
                     {/* Info box */}
                     <div className="mt-8 bg-white/60 backdrop-blur-sm border border-white p-4 rounded-xl shadow-sm text-sm font-medium text-amber-800">
                       <strong className="block mb-1 text-amber-900 border-b border-amber-200/50 pb-1">How it works:</strong>
                       10 Coins = ₹10 Discount. You will automatically see an option to apply your coins at the checkout page.
                     </div>
                   </div>
                </div>

              </motion.div>
            )}
            
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
};

export default Profile;
