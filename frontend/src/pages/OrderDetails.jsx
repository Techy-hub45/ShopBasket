import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaBox, FaWallet, FaTruck, FaMapMarkerAlt, FaCreditCard, FaRegClock, FaBoxOpen, FaUndo, FaVideo, FaExclamationCircle, FaLock } from 'react-icons/fa';

const OrderDetails = () => {
  const { id } = useParams();
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payStatus, setPayStatus] = useState('IDLE');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); 
  
  // Innovative feature: Instant Return
  const [showReturnPanel, setShowReturnPanel] = useState(false);
  const [returnStatus, setReturnStatus] = useState('IDLE'); // IDLE, UPLOADING, APPROVED

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchOrder = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`/api/orders/${id}`, config);
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, token, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setPayStatus('PROCESSING');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const amountToPay = Math.round((order.totalPrice - (order.walletAmountUsed || 0) - Math.floor((order.coinsUsed || 0) / 10)));
      
      // 1. Get Razorpay key
      const { data: { razorpayKeyId } } = await axios.get('/api/payment/config');
      
      // 2. Create order on backend
      const { data: paymentOrder } = await axios.post('/api/payment/order', { amount: amountToPay }, config);
      
      if (paymentOrder.isMock) {
        setTimeout(async () => {
          const { data } = await axios.put(`/api/orders/${id}/pay`, {
            id: paymentOrder.id,
            status: 'COMPLETED',
            update_time: new Date().toISOString(),
            email_address: user.email
          }, config);
          setOrder(data);
          setPayStatus('SUCCESS');
        }, 1500);
        return;
      }

      // 3. Load script for real Razorpay
      const res = await loadRazorpayScript();
      if (!res) {
        setPayStatus('IDLE');
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // 4. Open Razorpay options
      const options = {
        key: razorpayKeyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'ShopBasket',
        description: 'Payment for Order',
        order_id: paymentOrder.id,
        handler: async function (response) {
            setPayStatus('PROCESSING');
            try {
                // Verify payment
                const verifyRes = await axios.post('/api/payment/verify', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                }, config);

                if (verifyRes.data.verified) {
                   // Complete order payment
                   const { data } = await axios.put(`/api/orders/${id}/pay`, {
                     id: response.razorpay_payment_id,
                     status: 'COMPLETED',
                     update_time: new Date().toISOString(),
                     email_address: user.email
                   }, config);
                   setOrder(data);
                   setPayStatus('SUCCESS');
                } else {
                   setPayStatus('IDLE');
                   alert('Payment verification failed');
                }
            } catch (err) {
               console.error(err);
               setPayStatus('IDLE');
               alert('Payment verification failed');
            }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#3b82f6'
        }
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
         setPayStatus('IDLE');
         alert('Payment Failed! ' + response.error.description);
      });
      rzp1.open();

    } catch (error) {
      console.error(error);
      setPayStatus('IDLE');
      alert('Error initiating payment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReturnStatus('UPLOADING');
      // Simulate AI Video Analysis for instant approval
      setTimeout(() => {
        setReturnStatus('APPROVED');
      }, 3000);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
  if (!order) return <div className="text-center py-16 text-2xl font-bold text-slate-800">Order Not Found</div>;

  let trackingEvents = [];
  
  if (order.trackingHistory && order.trackingHistory.length > 0) {
      trackingEvents = [...order.trackingHistory];
      if (order?.isDelivered && !trackingEvents.find(e => e.status === 'DELIVERED')) {
          trackingEvents.push({
              status: 'DELIVERED',
              timestamp: order.deliveredAt || new Date(order.updatedAt),
              location: order?.shippingAddress?.city || 'Destination',
              message: 'Package delivered successfully to the recipient.'
          });
      }
  } else {
      trackingEvents.push({
          status: 'ORDER_PLACED',
          timestamp: order.createdAt,
          location: 'ShopBasket Systems',
          message: 'Order placed internally.'
      });
      if (order.isPaid) {
          trackingEvents.push({
              status: 'PAYMENT_CONFIRMED',
              timestamp: order.paidAt || order.createdAt,
              location: 'Payment Gateway',
              message: 'Payment verified fully.'
          });
          const procTime = new Date(new Date(order.paidAt || order.createdAt).getTime() + 3600000);
          if (procTime < Date.now()) {
             trackingEvents.push({
                 status: 'PROCESSING',
                 timestamp: procTime,
                 location: 'Fulfillment Center',
                 message: 'Order packed and ready for dispatch.'
             });
          }
      }
      if (order.isDelivered) {
          trackingEvents.push({
              status: 'SHIPPED',
              timestamp: new Date(new Date(order.deliveredAt).getTime() - 86400000), 
              location: 'Logistics Hub',
              message: 'Package handed over to delivery partner.'
          });
          trackingEvents.push({
              status: 'DELIVERED',
              timestamp: order.deliveredAt,
              location: order?.shippingAddress?.city || 'Destination',
              message: 'Package delivered.'
          });
      }
  }

  trackingEvents.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pt-8 pb-16"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold mb-1">
            <FaBox /> Order Summary
          </div>
          <h1 className="text-3xl font-bold text-slate-800 break-all">ID: {order._id}</h1>
        </div>
        <p className="text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
          Placed on {order?.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-8">
         <h2 className="text-xl font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4">Real-time Order Tracking</h2>
         <div className="max-w-3xl mx-auto py-4">
            <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200">
               {trackingEvents.map((event, idx) => {
                  const isLast = idx === trackingEvents.length - 1;
                  const isCompleted = new Date(event.timestamp).getTime() <= Date.now();
                  
                  return (
                    <div key={idx} className={`relative mb-8 ${isLast ? 'mb-0' : ''}`}>
                      <div className={`absolute -left-[33px] sm:-left-[41px] w-6 h-6 rounded-full border-4 border-white shadow-sm ring-2 ${isCompleted ? 'bg-primary ring-primary/30' : 'bg-slate-300 ring-slate-200'} flex items-center justify-center`}>
                        {isCompleted && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      
                      <div className={`bg-white p-5 rounded-2xl border ${isCompleted ? 'border-primary/20 shadow-md shadow-primary/5' : 'border-slate-100 shadow-sm opacity-60'} w-full transition-all hover:border-primary/50`}>
                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                           <h4 className={`font-black text-lg capitalize ${isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>
                             {event.status.replace(/_/g, ' ').toLowerCase()}
                           </h4>
                           <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full w-max border border-slate-100">
                              {event.timestamp ? new Date(event.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                           </span>
                         </div>
                         <p className="text-sm text-slate-600 font-medium leading-relaxed">{event.message}</p>
                         <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                            <FaMapMarkerAlt className={isCompleted ? "text-primary-light" : "text-slate-300"} /> 
                            {event.location || 'System Tracking'}
                         </div>
                      </div>
                    </div>
                  )
               })}
            </div>
         </div>
         
         {/* INNOVATIVE FEATURE: AI INSTANT RETURN FOR DELIVERED ITEMS */}
         {order.isDelivered && (
            <div className="mt-12 bg-slate-50 border-2 border-slate-200 border-dashed rounded-3xl p-6 md:p-8 flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-red-500 mb-4 shadow-sm">
                 <FaUndo size={24} />
               </div>
               <h3 className="text-xl font-black text-slate-800 mb-2">Received a damaged or wrong item?</h3>
               <p className="text-slate-500 font-medium max-w-lg mb-6 leading-relaxed">
                 Don't wait for days! ShopBasket uses <span className="text-primary font-bold py-0.5 px-2 bg-primary/10 rounded-full">AI Video Analysis</span> to instantly approve your return and initiate refunds to your wallet in seconds.
               </p>
               
               {!showReturnPanel ? (
                 <button onClick={() => setShowReturnPanel(true)} className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2">
                   <FaVideo /> Start 1-Click Return Request
                 </button>
               ) : (
                 <AnimatePresence mode="wait">
                    {returnStatus === 'IDLE' && (
                       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-primary border-dashed rounded-xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors">
                             <div className="flex flex-col items-center justify-center pt-5 pb-6">
                               <FaVideo className="text-primary-light text-3xl mb-3" />
                               <p className="text-sm text-slate-600 font-bold mb-1">Click to record or upload a 10s video</p>
                               <p className="text-xs text-slate-400">MP4, WebM up to 10MB</p>
                             </div>
                             <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} />
                          </label>
                       </motion.div>
                    )}
                    
                    {returnStatus === 'UPLOADING' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-6">
                          <div className="relative w-16 h-16 mb-4">
                             <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                             <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                             <FaExclamationCircle className="absolute inset-0 m-auto text-primary animate-pulse" />
                          </div>
                          <p className="font-bold text-slate-800">ShopBasket AI is analyzing your video...</p>
                          <p className="text-sm text-slate-500 mt-1">Checking for physical damage and product match.</p>
                       </motion.div>
                    )}
                    
                    {returnStatus === 'APPROVED' && (
                       <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-green-50 border p-6 rounded-2xl border-green-200 text-center">
                          <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-3 drop-shadow-sm" />
                          <h4 className="text-xl font-black text-green-800 mb-2">Return Approved!</h4>
                          <p className="text-sm text-green-700 font-medium leading-relaxed">
                             Our AI verified the damage. The pickup is scheduled for tomorrow. 
                             <span className="block mt-2 font-bold bg-white/50 py-1 px-3 rounded text-green-900 border border-green-200">
                                ₹{(order?.totalPrice || 0).toLocaleString('en-IN')} has been immediately refunded to your ShopBasket Wallet.
                             </span>
                          </p>
                       </motion.div>
                    )}
                 </AnimatePresence>
               )}
            </div>
         )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Order details */}
        <div className="flex-1 w-full flex flex-col gap-8">
          
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-6 text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">
               <FaMapMarkerAlt className="text-primary" /> Delivery details
             </div>
             
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-800 text-lg mb-1">{order?.user?.name || 'Guest'}</p>
                <p className="text-slate-500 mb-4 text-sm">{order?.user?.email || 'N/A'}</p>
                <p className="text-slate-700 leading-relaxed max-w-md border-t border-slate-200 pt-4">
                  {order?.shippingAddress?.address}, <br/>
                  {order?.shippingAddress?.city}, {order?.shippingAddress?.postalCode} <br/>
                  {order?.shippingAddress?.country}
                </p>
             </div>
             
             <div className="mt-6 flex flex-col md:flex-row gap-4">
                {order.isDelivered ? (
                  <div className="flex-1 flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold">
                    <FaCheckCircle className="text-2xl" /> Delivered on {order?.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'Verified'}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl font-bold">
                    <FaTruck className="text-2xl text-yellow-500" /> 
                    {order?.expectedDeliveryDate ? `Expected Delivery: ${new Date(order.expectedDeliveryDate).toLocaleDateString()}` : "Processing Delivery"}
                  </div>
                )}
             </div>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6 text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">
               <FaBox className="text-primary" /> Items in order
            </div>
            
            <div className="divide-y divide-slate-100">
              {(order?.orderItems || []).map((item, index) => (
                <div key={index} className="py-4 flex items-center gap-4 group">
                  <div className="w-20 h-20 bg-slate-50 rounded-xl p-2 border border-slate-100 shrink-0">
                    <img src={item?.image} alt={item?.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-1 mb-1">{item?.name}</div>
                    <div className="text-slate-500 text-sm font-medium">Qty: {item?.qty}</div>
                  </div>
                  <div className="font-bold text-slate-900 text-lg shrink-0">
                    ₹{((item?.qty || 0) * (item?.price || 0)).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Payment & Summary */}
        <div className="w-full lg:w-[420px] lg:sticky lg:top-24 flex flex-col gap-8">
          
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl">
             <div className="flex items-center gap-3 mb-6 text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">
               <FaCreditCard className="text-primary" /> Order Summary
             </div>
             
             <div className="space-y-4 text-slate-600 text-sm font-medium mb-6">
                <div className="flex justify-between items-center">
                  <span>Items Total</span> 
                  <span className="font-bold text-slate-800">₹{(order?.itemsPrice || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Charge</span> 
                  <span className="font-bold text-slate-800">
                    {(order?.shippingPrice || 0) === 0 ? <span className="text-green-600">Free</span> : `₹${(order?.shippingPrice || 0).toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estimated Tax (GST 18%)</span> 
                  <span className="font-bold text-slate-800">₹{(order?.taxPrice || 0).toLocaleString('en-IN')}</span>
                </div>
                {order.coinsUsed > 0 && (
                  <div className="flex justify-between items-center text-amber-600">
                    <span>Reward Coins Used</span> 
                    <span className="font-bold">₹{Math.floor(order.coinsUsed / 10).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {order.walletAmountUsed > 0 && (
                  <div className="flex justify-between items-center text-primary">
                    <span>Wallet Balance Used</span> 
                    <span className="font-bold">₹{order.walletAmountUsed.toLocaleString('en-IN')}</span>
                  </div>
                )}
             </div>
             
             <div className="border-y border-slate-100 py-6 mb-6">
               <div className="flex justify-between items-center">
                 <span className="text-lg font-bold text-slate-800">Grand Total</span>
                 <span className="text-3xl font-black text-primary tracking-tight">₹{Math.round(order?.totalPrice || 0).toLocaleString('en-IN')}</span>
               </div>
             </div>

             {order.isPaid ? (
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2">
                    <FaCheckCircle className="text-xl" /> Paid successfully
                  </div>
                  <div className="text-center text-xs font-bold text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {order?.paymentResult?.update_time && `Transaction Time: ${new Date(order.paymentResult.update_time).toLocaleString('en-IN')}`}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl font-bold text-center mb-6 text-sm flex items-center justify-center gap-2">
                     <FaWallet /> Payment Required to Process Order
                  </div>
                  
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">Select Payment Gateway</h4>
                  <div className="flex flex-col gap-3 mb-6">
                    <label className="flex items-center gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all border-primary bg-primary/5">
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-primary shrink-0">
                        <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto" fill="#072654" viewBox="0 0 1896 401" id="razorpay">
                        <path fill="#3395FF" d="m122.63 105.7-15.75 57.97 90.15-58.3-58.96 219.98 59.88.05L285.05.48"></path>
                        <path d="M25.6 232.92.8 325.4h122.73l50.22-188.13L25.6 232.92m426.32-81.42c-3 11.15-8.78 19.34-17.4 24.57-8.6 5.22-20.67 7.84-36.25 7.84h-49.5l17.38-64.8h49.5c15.56 0 26.25 2.6 32.05 7.9 5.8 5.3 7.2 13.4 4.22 24.6m51.25-1.4c6.3-23.4 3.7-41.4-7.82-54-11.5-12.5-31.68-18.8-60.48-18.8H324.4l-66.5 248.1h53.67l26.8-100h35.2c7.9 0 14.12 1.3 18.66 3.8 4.55 2.6 7.22 7.1 8.04 13.6l9.58 82.6h57.5l-9.32-77c-1.9-17.2-9.77-27.3-23.6-30.3 17.63-5.1 32.4-13.6 44.3-25.4a92.6 92.6 0 0 0 24.44-42.5m130.46 86.4c-4.5 16.8-11.4 29.5-20.73 38.4-9.34 8.9-20.5 13.3-33.52 13.3-13.26 0-22.25-4.3-27-13-4.76-8.7-4.92-21.3-.5-37.8 4.42-16.5 11.47-29.4 21.17-38.7 9.7-9.3 21.04-13.95 34.06-13.95 13 0 21.9 4.5 26.4 13.43 4.6 8.97 4.7 21.8.2 38.5zm23.52-87.8-6.72 25.1c-2.9-9-8.53-16.2-16.85-21.6-8.34-5.3-18.66-8-30.97-8-15.1 0-29.6 3.9-43.5 11.7-13.9 7.8-26.1 18.8-36.5 33-10.4 14.2-18 30.3-22.9 48.4-4.8 18.2-5.8 34.1-2.9 47.9 3 13.9 9.3 24.5 19 31.9 9.8 7.5 22.3 11.2 37.6 11.2a82.4 82.4 0 0 0 35.2-7.7 82.11 82.11 0 0 0 28.4-21.2l-7 26.16h51.9L709.3 149h-52zm238.65 0H744.87l-10.55 39.4h87.82l-116.1 100.3-9.92 37h155.8l10.55-39.4h-94.1l117.88-101.8m142.4 52c-4.67 17.4-11.6 30.48-20.75 39-9.15 8.6-20.23 12.9-33.24 12.9-27.2 0-36.14-17.3-26.86-51.9 4.6-17.2 11.56-30.13 20.86-38.84 9.3-8.74 20.57-13.1 33.82-13.1 13 0 21.78 4.33 26.3 13.05 4.52 8.7 4.48 21.67-.13 38.87m30.38-80.83c-11.95-7.44-27.2-11.16-45.8-11.16-18.83 0-36.26 3.7-52.3 11.1a113.09 113.09 0 0 0-41 32.06c-11.3 13.9-19.43 30.2-24.42 48.8-4.9 18.53-5.5 34.8-1.7 48.73 3.8 13.9 11.8 24.6 23.8 32 12.1 7.46 27.5 11.17 46.4 11.17 18.6 0 35.9-3.74 51.8-11.18 15.9-7.48 29.5-18.1 40.8-32.1 11.3-13.94 19.4-30.2 24.4-48.8 5-18.6 5.6-34.84 1.8-48.8-3.8-13.9-11.7-24.6-23.6-32.05m185.1 40.8 13.3-48.1c-4.5-2.3-10.4-3.5-17.8-3.5-11.9 0-23.3 2.94-34.3 8.9-9.46 5.06-17.5 12.2-24.3 21.14l6.9-25.9-15.07.06h-37l-47.7 176.7h52.63l24.75-92.37c3.6-13.43 10.08-24 19.43-31.5 9.3-7.53 20.9-11.3 34.9-11.3 8.6 0 16.6 1.97 24.2 5.9m146.5 41.1c-4.5 16.5-11.3 29.1-20.6 37.8-9.3 8.74-20.5 13.1-33.5 13.1s-21.9-4.4-26.6-13.2c-4.8-8.85-4.9-21.6-.4-38.36 4.5-16.75 11.4-29.6 20.9-38.5 9.5-8.97 20.7-13.45 33.7-13.45 12.8 0 21.4 4.6 26 13.9 4.6 9.3 4.7 22.2.28 38.7m36.8-81.4c-9.75-7.8-22.2-11.7-37.3-11.7-13.23 0-25.84 3-37.8 9.06-11.95 6.05-21.65 14.3-29.1 24.74l.18-1.2 8.83-28.1h-51.4l-13.1 48.9-.4 1.7-54 201.44h52.7l27.2-101.4c2.7 9.02 8.2 16.1 16.6 21.22 8.4 5.1 18.77 7.63 31.1 7.63 15.3 0 29.9-3.7 43.75-11.1 13.9-7.42 25.9-18.1 36.1-31.9 10.2-13.8 17.77-29.8 22.6-47.9 4.9-18.13 5.9-34.3 3.1-48.45-2.85-14.17-9.16-25.14-18.9-32.9m174.65 80.65c-4.5 16.7-11.4 29.5-20.7 38.3-9.3 8.86-20.5 13.27-33.5 13.27-13.3 0-22.3-4.3-27-13-4.8-8.7-4.9-21.3-.5-37.8 4.4-16.5 11.42-29.4 21.12-38.7 9.7-9.3 21.05-13.94 34.07-13.94 13 0 21.8 4.5 26.4 13.4 4.6 8.93 4.63 21.76.15 38.5zm23.5-87.85-6.73 25.1c-2.9-9.05-8.5-16.25-16.8-21.6-8.4-5.34-18.7-8-31-8-15.1 0-29.68 3.9-43.6 11.7-13.9 7.8-26.1 18.74-36.5 32.9-10.4 14.16-18 30.3-22.9 48.4-4.85 18.17-5.8 34.1-2.9 47.96 2.93 13.8 9.24 24.46 19 31.9 9.74 7.4 22.3 11.14 37.6 11.14 12.3 0 24.05-2.56 35.2-7.7a82.3 82.3 0 0 0 28.33-21.23l-7 26.18h51.9l47.38-176.7h-51.9zm269.87.06.03-.05h-31.9c-1.02 0-1.92.05-2.85.07h-16.55l-8.5 11.8-2.1 2.8-.9 1.4-67.25 93.68-13.9-109.7h-55.08l27.9 166.7-61.6 85.3h54.9l14.9-21.13c.42-.62.8-1.14 1.3-1.8l17.4-24.7.5-.7 77.93-110.5 65.7-93 .1-.06h-.03z"></path>
                      </svg>
                      <span className="font-bold text-slate-700 ml-auto text-xs uppercase tracking-wider">Secure Checkout</span>
                    </label>
                  </div>



                  {payStatus === 'PROCESSING' ? (
                    <button disabled className="w-full bg-slate-800 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Processing secure payment...
                    </button>
                  ) : (
                    <button 
                      onClick={handlePayment} 
                      className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-4 font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
                    >
                      <FaLock /> Pay ₹{Math.round((order?.totalPrice || 0) - (order?.walletAmountUsed || 0) - Math.floor((order?.coinsUsed || 0) / 10)).toLocaleString('en-IN')}
                    </button>
                  )}
                  <p className="text-xs text-center text-slate-400 mt-4 leading-relaxed">Secured with 256-bit encryption</p>
                </div>
              )}
          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default OrderDetails;
