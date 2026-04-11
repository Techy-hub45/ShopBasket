import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBox, FaImages, FaClipboardList, FaPlus, FaTrash, FaEdit, FaTimes, FaUsers, FaCoins } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [productForm, setProductForm] = useState({ name: '', price: 0, image: '', brand: '', category: '', countInStock: 0, description: '', discount: 0 });
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', image: '', color: 'from-blue-900 to-indigo-800', link: '/' });

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [prodRes, banRes, userRes, ordRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/banners/all', config).catch(() => ({ data: [] })),
        axios.get('/api/users', config).catch(() => ({ data: [] })),
        axios.get('/api/orders', config).catch(() => ({ data: [] }))
      ]);
      setProducts(prodRes.data);
      setBanners(banRes.data);
      setUsersList(userRes.data);
      setOrdersList(ordRes.data || []);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Product Functions ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const payload = { ...productForm, images: productForm.image ? [productForm.image] : [] };
    
    try {
      if (editingId) {
        await axios.put(`/api/products/${editingId}`, payload, config);
      } else {
        await axios.post('/api/products', payload, config);
      }
      setShowProductModal(false);
      fetchData();
    } catch (error) {
      alert('Error saving product: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Are you absolutely sure you want to delete this product?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`/api/products/${id}`, config);
        fetchData();
      } catch (error) {
        alert('Error deleting product');
      }
    }
  };

  const openEditProduct = (prod) => {
    setProductForm({
      name: prod.name, price: prod.price, image: prod.images?.[0] || '', brand: prod.brand, 
      category: prod.category, countInStock: prod.countInStock, description: prod.description, discount: prod.discount || 0
    });
    setEditingId(prod._id);
    setShowProductModal(true);
  };

  // --- Banner Functions ---
  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (editingId) {
        await axios.put(`/api/banners/${editingId}`, bannerForm, config);
      } else {
        await axios.post('/api/banners', bannerForm, config);
      }
      setShowBannerModal(false);
      fetchData();
    } catch (error) {
      alert('Error saving banner: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteBanner = async (id) => {
    if (window.confirm('Delete this banner?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`/api/banners/${id}`, config);
        fetchData();
      } catch (error) {
        alert('Error deleting banner');
      }
    }
  };

  const openEditBanner = (ban) => {
    setBannerForm({ title: ban.title, subtitle: ban.subtitle, image: ban.image, color: ban.color, link: ban.link });
    setEditingId(ban._id);
    setShowBannerModal(true);
  };

  // --- User Functions ---
  const deleteUser = async (id) => {
    if (window.confirm('Delete this user? This action cannot be undone.')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`/api/users/${id}`, config);
        fetchData(); // Refresh the list
      } catch (error) {
        alert('Error deleting user: ' + (error.response?.data?.message || 'Server Error'));
      }
    }
  };

  const markDeliver = async (id) => {
    if (window.confirm('Mark this order as delivered?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.put(`/api/orders/${id}/deliver`, {}, config);
        fetchData();
      } catch (error) {
        alert('Error updating order');
      }
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto py-8 lg:py-12 px-4">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Admin Sidebar */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
          <div className="bg-slate-900 rounded-3xl p-6 shadow-xl text-white">
            <h2 className="text-xl font-bold tracking-tight mb-8 text-primary">Admin Control Panel</h2>
            <nav className="flex flex-col gap-2">
              <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'products' ? 'bg-primary text-white scale-105 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <FaBox /> Manage Products
              </button>
              <button onClick={() => setActiveTab('banners')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'banners' ? 'bg-primary text-white scale-105 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <FaImages /> Slide Show Banners
              </button>
              <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'users' ? 'bg-primary text-white scale-105 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <FaUsers /> Manage Users
              </button>
              <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'orders' ? 'bg-primary text-white scale-105 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <FaClipboardList /> Orders Preview
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 min-h-[70vh]">
          {loading ? (
            <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
          ) : (
            <>
              {activeTab === 'products' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800">Products Inventory</h2>
                      <p className="text-slate-500 font-medium">Total: {products.length} Products</p>
                    </div>
                    <button 
                      onClick={() => { setProductForm({name:'', price:0, image:'', brand:'', category:'', countInStock:0, description:'', discount:0}); setEditingId(null); setShowProductModal(true); }}
                      className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition"
                    >
                      <FaPlus /> Add Product
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                          <th className="pb-3 px-4">Item</th>
                          <th className="pb-3 px-4">Category</th>
                          <th className="pb-3 px-4">Price</th>
                          <th className="pb-3 px-4">Stock</th>
                          <th className="pb-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {products.map((p) => (
                          <tr key={p._id} className="hover:bg-slate-50/50 transition">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden shrink-0"><img src={p.images?.[0]} onError={(e) => {e.target.src='https://via.placeholder.com/150'}} alt="" className="w-full h-full object-cover"/></div>
                                <div><p className="font-bold text-slate-800 text-sm">{p.name}</p><p className="text-xs text-slate-500">{p.brand}</p></div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm font-medium text-slate-600">{p.category}</td>
                            <td className="py-4 px-4 text-sm font-bold text-slate-800">₹{p.price.toLocaleString()}</td>
                            <td className="py-4 px-4">
                               <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.countInStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                 {p.countInStock > 0 ? p.countInStock : 'Out of Stock'}
                               </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button onClick={() => openEditProduct(p)} className="p-2 text-slate-400 hover:text-primary transition bg-slate-100 hover:bg-primary/10 rounded-lg mr-2"><FaEdit /></button>
                              <button onClick={() => deleteProduct(p._id)} className="p-2 text-slate-400 hover:text-red-500 transition bg-slate-100 hover:bg-red-50 rounded-lg"><FaTrash /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'banners' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800">Home Page Banners</h2>
                      <p className="text-slate-500 font-medium">Manage the main advertisement slider</p>
                    </div>
                    <button 
                      onClick={() => { setBannerForm({title:'', subtitle:'', image:'', color:'from-blue-900 to-indigo-800', link: '/'}); setEditingId(null); setShowBannerModal(true); }}
                      className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition"
                    >
                      <FaPlus /> Build Banner
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map((b) => (
                      <div key={b._id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm group relative">
                        <div className="h-32 bg-slate-100 relative overflow-hidden">
                          <div className={`absolute inset-0 bg-gradient-to-r ${b.color} mix-blend-multiply opacity-60 z-10`}></div>
                          <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 p-3 z-20 bg-gradient-to-t from-black/80 to-transparent">
                            <h4 className="text-white font-bold truncate">{b.title}</h4>
                          </div>
                        </div>
                        <div className="p-4 bg-white flex justify-between items-center">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${b.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {b.active ? 'Active' : 'Hidden'}
                          </span>
                          <div className="flex gap-2">
                             <button onClick={() => openEditBanner(b)} className="p-2 text-slate-400 hover:text-primary transition bg-slate-50 hover:bg-primary/10 rounded-lg"><FaEdit /></button>
                             <button onClick={() => deleteBanner(b._id)} className="p-2 text-slate-400 hover:text-red-500 transition bg-slate-50 hover:bg-red-50 rounded-lg"><FaTrash /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {banners.length === 0 && <p className="text-slate-400 italic col-span-full">No active banners. The home page will use dynamic defaults until you create one here.</p>}
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'orders' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800">Platform Orders</h2>
                      <p className="text-slate-500 font-medium">Total Orders: {ordersList.length}</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto shadow-sm border border-slate-100 rounded-2xl">
                    <table className="w-full text-left bg-white">
                      <thead>
                        <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                          <th className="py-4 px-6">ID & User</th>
                          <th className="py-4 px-6">Date</th>
                          <th className="py-4 px-6">Total</th>
                          <th className="py-4 px-6">Paid</th>
                          <th className="py-4 px-6 text-right">Status / Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ordersList.map((ord) => (
                          <tr key={ord._id} className="hover:bg-slate-50/80 transition">
                            <td className="py-4 px-6">
                              <span className="font-bold text-slate-800 text-xs block mb-1">{ord._id}</span>
                              <span className="text-xs text-slate-500">{(ord.user && ord.user.name) || 'Guest'}</span>
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-600">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6 font-bold text-primary">₹{Math.round(ord.totalPrice).toLocaleString()}</td>
                            <td className="py-4 px-6">
                              {ord.isPaid ? (
                                <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full">Yes</span>
                              ) : (
                                <span className="text-xs font-bold px-3 py-1 bg-red-100 text-red-700 rounded-full">No</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              {ord.isDelivered ? (
                                <span className="text-sm font-bold text-emerald-600 block">Delivered on {new Date(ord.deliveredAt).toLocaleDateString()}</span>
                              ) : (
                                <button 
                                  onClick={() => markDeliver(ord._id)}
                                  className="text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl transition shadow-md"
                                >
                                  Mark Delivered
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {ordersList.length === 0 && (
                          <tr><td colSpan="5" className="py-8 text-center text-slate-500">No orders yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800">User Management</h2>
                      <p className="text-slate-500 font-medium">Total Registered Users: {usersList.length}</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto shadow-sm border border-slate-100 rounded-2xl">
                    <table className="w-full text-left bg-white">
                      <thead>
                        <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                          <th className="py-4 px-6">User Details</th>
                          <th className="py-4 px-6">Role</th>
                          <th className="py-4 px-6">Wallet Balance</th>
                          <th className="py-4 px-6">Coins</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {usersList.map((usr) => (
                          <tr key={usr._id} className="hover:bg-slate-50/80 transition group">
                            <td className="py-4 px-6">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800">{usr.name}</span>
                                <span className="text-xs text-slate-500">{usr.email}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                               <span className={`text-xs font-bold px-3 py-1 rounded-full ${usr.isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                 {usr.isAdmin ? 'Admin' : 'Customer'}
                               </span>
                            </td>
                            <td className="py-4 px-6 font-medium text-slate-700">₹{(usr.walletBalance || 0).toLocaleString()}</td>
                            <td className="py-4 px-6">
                              <span className="flex items-center gap-1 font-bold text-amber-500">
                                <FaCoins size={12}/> {usr.rewardCoins || 0}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              {!usr.isAdmin && (
                                <button 
                                  onClick={() => deleteUser(usr._id)} 
                                  title="Delete User"
                                  className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition rounded-lg border border-transparent hover:border-red-100"
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {showProductModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 max-w-2xl w-full my-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-800">{editingId ? 'Edit Product' : 'Create Custom Product'}</h3>
                <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-red-500"><FaTimes size={24}/></button>
              </div>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="text-sm font-bold text-slate-700">Name</label><input type="text" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" /></div>
                  <div><label className="text-sm font-bold text-slate-700">Price (₹)</label><input type="number" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" /></div>
                  <div><label className="text-sm font-bold text-slate-700">Stock Count</label><input type="number" required value={productForm.countInStock} onChange={e => setProductForm({...productForm, countInStock: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" /></div>
                  <div><label className="text-sm font-bold text-slate-700">Category</label><input type="text" required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" /></div>
                  <div><label className="text-sm font-bold text-slate-700">Brand</label><input type="text" required value={productForm.brand} onChange={e => setProductForm({...productForm, brand: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" /></div>                  
                  <div className="col-span-2"><label className="text-sm font-bold text-slate-700">Image URL (Unsplash recommended)</label><input type="text" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" /></div>
                  <div className="col-span-2"><label className="text-sm font-bold text-slate-700">Description</label><textarea rows="3" required value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"></textarea></div>
                </div>
                <button type="submit" className="w-full py-4 mt-6 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition uppercase tracking-widest">{editingId ? 'Save Changes' : 'Publish Product'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner Modal */}
      <AnimatePresence>
        {showBannerModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 max-w-xl w-full my-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-800">{editingId ? 'Edit Slide Banner' : 'Create Slide Banner'}</h3>
                <button onClick={() => setShowBannerModal(false)} className="text-slate-400 hover:text-red-500"><FaTimes size={24}/></button>
              </div>
              <form onSubmit={handleBannerSubmit} className="space-y-4">
                <div><label className="text-sm font-bold text-slate-700">Main Title (Huge Text)</label><input type="text" required value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="text-sm font-bold text-slate-700">Subtitle (Offer details)</label><input type="text" value={bannerForm.subtitle} onChange={e => setBannerForm({...bannerForm, subtitle: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" /></div>
                <div><label className="text-sm font-bold text-slate-700">Background Image URL</label><input type="url" required value={bannerForm.image} onChange={e => setBannerForm({...bannerForm, image: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" /></div>
                <div>
                  <label className="text-sm font-bold text-slate-700">Gradient Overlay Theme</label>
                  <select value={bannerForm.color} onChange={e => setBannerForm({...bannerForm, color: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none">
                    <option value="from-blue-900 to-indigo-800">Blue & Indigo (Tech)</option>
                    <option value="from-pink-600 to-purple-800">Pink & Purple (Fashion)</option>
                    <option value="from-emerald-700 to-green-900">Emerald & Green (Groceries)</option>
                    <option value="from-red-600 to-orange-500">Red & Orange (Hot Deals)</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-4 mt-6 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition uppercase tracking-widest">{editingId ? 'Save Changes' : 'Activate Banner'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
