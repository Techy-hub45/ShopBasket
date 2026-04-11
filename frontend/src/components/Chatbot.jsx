import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaPaperPlane, FaBoxOpen, FaWallet, FaQuestionCircle } from 'react-icons/fa';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello there! I am BasketBot, your super animatic assistant. How can I power up your shopping today?' }
  ]);
  const [input, setInput] = useState('');

  const sendPredefined = (msg, reply) => {
    setMessages(prev => [...prev, { sender: 'user', text: msg }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    const currentInput = input;
    setInput('');
    
    setTimeout(() => {
      let reply = "I am a simple demo bot, but I can help you with orders and wallet info! Try clicking the quick actions.";
      if (currentInput.toLowerCase().includes('order')) {
         reply = "You can track your orders by going to the Profile section and clicking on any recent order!";
      } else if (currentInput.toLowerCase().includes('wallet') || currentInput.toLowerCase().includes('coin')) {
         reply = "ShopBasket rewards you with coins on every purchase! You can use them at checkout.";
      }
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 800);
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)] border-2 border-white pointer-events-auto hover:scale-110 transition-transform"
      >
        <FaRobot className="text-white text-3xl animate-bounce" />
        <div className="absolute inset-0 rounded-full border-2 border-cyan-300 animate-ping opacity-20"></div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 w-[350px] md:w-[400px] h-[550px] max-h-[80vh] bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 flex flex-col overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 flex items-center justify-between relative overflow-hidden">
               <div className="absolute inset-0 bg-white/10 opacity-50 mix-blend-overlay"></div>
               <div className="flex items-center gap-3 relative z-10">
                 <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-md relative">
                   <div className="w-2 h-2 bg-cyan-300 rounded-full absolute top-1 right-1 animate-pulse"></div>
                   <FaRobot className="text-white text-xl" />
                 </div>
                 <div>
                   <h3 className="text-white font-bold text-lg leading-tight">BasketBot</h3>
                   <p className="text-cyan-100 text-xs font-medium flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Online
                   </p>
                 </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-2 relative z-10">
                 <FaTimes />
               </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.sender === 'bot' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx} 
                  className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'bot' ? 'bg-white/10 text-slate-100 rounded-tl-sm border border-white/5' : 'bg-blue-600 text-white rounded-tr-sm shadow-md'}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="px-4 pb-2 pt-2 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
               <button onClick={() => sendPredefined("Where is my order?", "You can track orders in your Profile. Navigate to Profile > My Orders to see real-time updates!")} className="text-xs whitespace-nowrap bg-white/5 hover:bg-white/10 text-cyan-200 border border-cyan-900/50 rounded-full px-3 py-1.5 flex items-center gap-1.5 transition-colors">
                  <FaBoxOpen /> Track Order
               </button>
               <button onClick={() => sendPredefined("Reward Coins?", "Reward Coins are earned on every purchase! 10 coins = ₹1 discount on your next checkout.")} className="text-xs whitespace-nowrap bg-white/5 hover:bg-white/10 text-amber-200 border border-amber-900/50 rounded-full px-3 py-1.5 flex items-center gap-1.5 transition-colors">
                  <FaWallet /> Reward Coins
               </button>
               <button onClick={() => sendPredefined("Find items", "Use the search bar at the top or browse our categories to find fresh groceries!")} className="text-xs whitespace-nowrap bg-white/5 hover:bg-white/10 text-purple-200 border border-purple-900/50 rounded-full px-3 py-1.5 flex items-center gap-1.5 transition-colors">
                  <FaQuestionCircle /> Find Items
               </button>
            </div>

            <form onSubmit={handleSend} className="p-4 bg-slate-900/50 border-t border-white/10 flex gap-2 relative z-10">
              <input 
                 type="text" 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder="Type a message..."
                 className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button type="submit" disabled={!input.trim()} className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-shadow">
                <FaPaperPlane className="text-sm shadow-md" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
