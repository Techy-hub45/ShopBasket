const nodemailer = require('nodemailer');

const sendWelcomeEmail = async (userEmail, userName) => {
  const quotes = [
    "Welcome to ShopBasket! Where your everyday needs meet extraordinary convenience.",
    "Hello from ShopBasket! Your ultimate destination for fresh groceries and beyond.",
    "Welcome aboard! ShopBasket is excited to make your shopping experience magical.",
    "Great to have you here! ShopBasket delivers happiness straight to your door."
  ];
  const selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];

  console.log("\n============================================================");
  console.log("📧 MOCK EMAIL DISPATCHED (No SMTP Configured)");
  console.log("------------------------------------------------------------");
  console.log(`TO      : ${userEmail}`);
  console.log(`FROM    : "ShopBasket Team 🛒" <welcome@shopbasket.com>`);
  console.log(`SUBJECT : Welcome to ShopBasket! 🎉`);
  console.log("------------------------------------------------------------");
  console.log(`Hello ${userName},\n`);
  console.log(`We are absolutely thrilled to have you here.`);
  console.log(`\n  "${selectedQuote}"\n`);
  console.log(`Dive in and start exploring the best products curated just for you.`);
  console.log(`\n- The ShopBasket Team`);
  console.log("============================================================\n");
};

module.exports = { sendWelcomeEmail };
