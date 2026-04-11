// Mock SMS Service for demoing purposes
const sendSMS = (phoneNumber, message) => {
  if (!phoneNumber) {
    console.log(`\n[SMS ERROR] No phone number provided. Could not send message: "${message}"\n`);
    return;
  }
  
  console.log("\n========== 📱 SHOPBASKET SMS NOTIFICATION ==========");
  console.log(`To: ${phoneNumber}`);
  console.log(`Message: ${message}`);
  console.log("====================================================\n");
};

module.exports = { sendSMS };
