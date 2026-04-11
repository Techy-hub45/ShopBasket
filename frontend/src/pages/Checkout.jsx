import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaCreditCard, FaMapMarkerAlt, FaTruck, FaWallet, FaCoins, FaCheckCircle, FaLocationArrow } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Mock addresses for auto-suggest
const MOCK_ADDRESSES = [
  "123 MG Road, Bengaluru, 560001, India",
  "45 Brigade Road, Bengaluru, 560001, India",
  "78 Connaught Place, New Delhi, 110001, India",
  "12 Andheri West, Mumbai, 400053, India",
  "90 T Nagar, Chennai, 600017, India",
  "Galaxy Hostel Bedi Morbi Highway, Rajkot, 360001, India",
  "Kembalu, Post office road Channarayapattana Hassan, 573111 , India",
  "near sbi bank jayanagr ,outer ring road ,Hassan ,573201, India"
];

const Checkout = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  
  const [addressInput, setAddressInput] = useState(user?.addresses?.[0]?.street || '');
  const [suggestions, setSuggestions] = useState([]);
  const [city, setCity] = useState(user?.addresses?.[0]?.city || '');
  const [country, setCountry] = useState(user?.addresses?.[0]?.country || 'India');
  const [postalCode, setPostalCode] = useState(user?.addresses?.[0]?.postalCode || '');
  
  // Wallet & Rewards local state
  const [profileData, setProfileData] = useState(null);
  const [useWallet, setUseWallet] = useState(false);
  const [useCoins, setUseCoins] = useState(false);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [mapPosition, setMapPosition] = useState([20.5937, 78.9629]);
  
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  const handleMapClick = async (lat, lng) => {
    setMapPosition([lat, lng]);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      if (res.data && res.data.address) {
         const addr = res.data.address;
         const street = addr.road || addr.village || addr.suburb || addr.neighbourhood || '';
         const fetchedCity = addr.city || addr.town || addr.county || addr.state || '';
         const pin = addr.postcode || '';
         const fullAddr = (street ? street + ', ' : '') + fetchedCity;
         setAddressInput(fullAddr || 'Selected Location');
         if (fetchedCity) setCity(fetchedCity);
         if (pin) setPostalCode(pin);
      }
    } catch (e) { console.error("Map Error:", e); }
  };

  useEffect(() => {
    if (!mapRef.current) return;
    
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(mapPosition, 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OSM'
      }).addTo(mapInstance.current);

      markerInstance.current = L.marker(mapPosition).addTo(mapInstance.current);

      mapInstance.current.on('click', (e) => {
        handleMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    // Cleanup on unmount
    return () => {
       if (mapInstance.current) {
         mapInstance.current.remove();
         mapInstance.current = null;
       }
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current && markerInstance.current) {
      mapInstance.current.setView(mapPosition);
      markerInstance.current.setLatLng(mapPosition);
    }
  }, [mapPosition]);

  const locateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        handleMapClick(pos.coords.latitude, pos.coords.longitude);
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    // Fetch wallet & coins balance
    if (token) {
      const fetchProfile = async () => {
        try {
          const { data } = await axios.get('/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProfileData(data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchProfile();
    }
  }, [token]);

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
    
    // Auto-fill mock details based on typical format "Street, City, PIN, India"
    const parts = addr.split(', ');
    if (parts.length >= 4) {
      setCity(parts[1]);
      setPostalCode(parts[2]);
    }
  };

  const shippingCost = cartTotal > 500 ? 0 : 40;
  const tax = cartTotal * 0.18;
  const initialTotal = cartTotal + shippingCost + tax;

  // Rewards Calculations
  const availableCoins = profileData?.rewardCoins || 0;
  const maxCoinsUsable = Math.min(availableCoins, Math.floor(initialTotal * 10)); // e.g. Max 100% of order value
  const coinDiscount = Math.floor(maxCoinsUsable / 10); // 10 coins = 1 INR

  const totalAfterCoins = useCoins ? Math.max(0, initialTotal - coinDiscount) : initialTotal;
  
  const availableWallet = profileData?.walletBalance || 0;
  const walletUsedAmount = useWallet ? Math.min(availableWallet, totalAfterCoins) : 0;
  
  const finalTotal = totalAfterCoins - walletUsedAmount;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please log in to checkout');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        orderItems: cartItems,
        shippingAddress: { address: addressInput, city, postalCode, country },
        paymentMethod: finalTotal <= 0 ? 'Wallet/Coins' : 'UPI/Card',
        itemsPrice: cartTotal,
        shippingPrice: shippingCost,
        taxPrice: tax,
        totalPrice: initialTotal, // Send gross total, not net payable
        coinsUsed: useCoins ? maxCoinsUsable : 0,
        walletAmountUsed: walletUsedAmount,
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post('/api/orders', orderData, config);
      clearCart();
      navigate(`/order/${data._id}`);
    } catch (error) {
      alert('Error placing order: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary-dark transition font-medium">Return to Shop</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pt-8 pb-16">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full text-2xl">
          <FaLock />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">Secure Checkout</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="flex-1 space-y-8"
        >
          {/* Address Box */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6 text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">
              <FaMapMarkerAlt className="text-primary" /> Delivery Details
            </div>
            
            <form id="checkout-form" onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-slate-700">Select Location on Map</label>
                  <button type="button" onClick={locateMe} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-primary hover:text-white transition-colors">
                    <FaLocationArrow /> Locate Me
                  </button>
                </div>
                <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 z-10 relative">
                  <div ref={mapRef} style={{ height: '100%', width: '100%', zIndex: 1 }}></div>
                </div>
              </div>

              <div className="md:col-span-2 relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Address (Start typing for suggestions)</label>
                <div className="relative z-20">
                  <input 
                    type="text" 
                    value={addressInput} 
                    onChange={handleAddressChange} 
                    required 
                    placeholder="123 Main Street..."
                    autoComplete="off"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all outline-none" 
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                <input 
                  type="text" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  required 
                  placeholder="Mumbai"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">PIN Code</label>
                <input 
                  type="text" 
                  value={postalCode} 
                  onChange={(e) => setPostalCode(e.target.value)} 
                  required 
                  placeholder="400001"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all outline-none" 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Country</label>
                <input 
                  type="text" 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)} 
                  required 
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed" 
                />
              </div>
            </form>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4 text-blue-800 text-sm">
              <FaTruck className="text-xl mt-0.5 shrink-0" />
              <p><strong>Fast Delivery Available.</strong> Order now and select express shipping at checkout for next-day delivery on eligible items.</p>
            </div>
          </div>
          
          {/* Rewards & Wallet Application */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-3">
              <FaCoins className="text-amber-500" /> ShopBasket Rewards
            </h3>
            
            {/* Coins Toggle */}
            <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${useCoins ? 'border-amber-400 bg-amber-50' : 'border-slate-100 hover:border-amber-200'}`}>
               <input type="checkbox" checked={useCoins} onChange={() => setUseCoins(!useCoins)} className="mt-1 w-5 h-5 accent-amber-500 cursor-pointer" disabled={availableCoins < 10} />
               <div>
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                     Apply Reward Coins
                     {useCoins && <FaCheckCircle className="text-amber-500" />}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Available: <span className="font-bold text-amber-600">{availableCoins} Coins</span></div>
                  
                  {availableCoins >= 10 ? (
                    <div className="text-xs font-bold text-amber-700 bg-amber-100/50 inline-block px-2 py-1 rounded mt-2">
                       -{maxCoinsUsable} coins (₹{coinDiscount} Off)
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 mt-2">Requires minimum 10 coins.</div>
                  )}
               </div>
            </label>

            {/* Wallet Toggle */}
            <label className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${useWallet ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-primary/30'}`}>
               <input type="checkbox" checked={useWallet} onChange={() => setUseWallet(!useWallet)} className="mt-1 w-5 h-5 accent-primary cursor-pointer" disabled={availableWallet <= 0} />
               <div>
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                     Pay from ShopBasket Wallet
                     {useWallet && <FaCheckCircle className="text-primary" />}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Available Balance: <span className="font-bold text-slate-800">₹{availableWallet.toLocaleString('en-IN')}</span></div>
                  
                  {useWallet && availableWallet > 0 && (
                    <div className="text-xs font-bold text-primary bg-primary/10 inline-block px-2 py-1 rounded mt-2">
                       Using ₹{walletUsedAmount.toLocaleString('en-IN')} from wallet
                    </div>
                  )}
               </div>
            </label>
          </div>
          
        </motion.div>

        {/* Right Sidebar: Order Summary */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-[420px] h-fit sticky top-24"
        >
          <div className="bg-slate-900 p-6 md:p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl mix-blend-screen opacity-50 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 text-xl font-bold text-white border-b border-slate-700 pb-4">
                <FaCreditCard className="text-primary-light" /> Order Details
              </div>
              
              <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <div className="w-12 h-12 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center p-1 shrink-0 backdrop-blur-md">
                       <img src={item.image} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/png?text=Image'; }} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-screen drop-shadow-md brightness-110" />
                    </div>
                    <div className="flex-1 line-clamp-2 text-slate-200 font-medium">{item.name}</div>
                    <div className="font-bold text-white shrink-0">₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 text-slate-300 text-sm border-t border-slate-700 pt-6 mb-6">
                <div className="flex justify-between">
                  <span>Items ({cartItems.reduce((a,c) => a+c.qty,0)})</span>
                  <span className="font-bold text-white">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-white">{shippingCost === 0 ? <span className="text-emerald-400">Free</span> : `₹${shippingCost.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (GST 18%)</span>
                  <span className="font-bold text-white">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                
                {useCoins && coinDiscount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Reward Coins</span>
                    <span className="font-bold">-₹{coinDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {useWallet && walletUsedAmount > 0 && (
                  <div className="flex justify-between text-primary-light">
                    <span>Wallet Balance</span>
                    <span className="font-bold">-₹{walletUsedAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center border-t border-slate-700 pt-6 mb-8">
                <span className="text-lg font-bold text-slate-200">Amount to Pay</span>
                <span className="text-4xl font-black text-white px-3 py-1 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">₹{Math.round(finalTotal).toLocaleString('en-IN')}</span>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 mb-6 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                 <FaCoins /> You will earn ~{Math.floor(initialTotal * 0.05)} coins!
              </div>

              <button 
                form="checkout-form"
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-white hover:text-slate-900 text-white py-4 rounded-xl font-black text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider disabled:hover:bg-primary disabled:hover:text-white disabled:hover:translate-y-0"
              >
                {loading ? 'Processing Securely...' : (finalTotal === 0 ? 'Place Order' : 'Proceed to Pay')}
              </button>
              <p className="text-xs text-center text-slate-400 mt-4 leading-relaxed mix-blend-screen opacity-70">
                Secured by ShopBasket™ Advanced 256-bit Encryption
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
