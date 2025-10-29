const express = require('express');
const router = express.Router();
const { Transaction, User } = require('../schema/schema');
const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

// Import authentication middleware
const auth = require('../middlewareUser/middleware');

// Paystack configuration
const PAYSTACK_CONFIG = {
  secretKey: process.env.PAYSTACK_SECRET_KEY,
  publicKey: process.env.PAYSTACK_PUBLIC_KEY,
  baseUrl: 'https://api.paystack.co'
};

const PAYSTACK_ENDPOINTS = {
  initialize: '/transaction/initialize',
  verify: '/transaction/verify',
  webhook: '/transaction'
};

// Validate Paystack configuration
function validatePaystackConfig() {
  if (!PAYSTACK_CONFIG.secretKey || !PAYSTACK_CONFIG.publicKey) {
    throw new Error('Paystack credentials not configured');
  }
}

// Get Paystack headers
function getPaystackHeaders() {
  return {
    'Authorization': `Bearer ${PAYSTACK_CONFIG.secretKey}`,
    'Content-Type': 'application/json'
  };
}

// Generate callback URL
function generateCallbackUrl(reference) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  return `${baseUrl}/payment/callback?reference=${reference}`;
}

// Fee configuration
function calculateFee(amount) {
  if (amount <= 100) return 2;
  if (amount <= 500) return 3;
  if (amount <= 1000) return 5;
  return 10;
}

// Convert to Paystack amount (smallest currency unit)
function toPaystackAmount(amount) {
  return Math.round(amount * 100);
}

// Convert from Paystack amount
function fromPaystackAmount(amount) {
  return amount / 100;
}

// Validate amount
function validateAmount(amount) {
  const errors = [];
  if (amount < 1) errors.push('Minimum amount is GHS 1');
  if (amount > 50000) errors.push('Maximum amount is GHS 50,000');
  return { isValid: errors.length === 0, errors };
}

// Generate reference
function generateReference(prefix = 'TXN') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Verify webhook signature
function verifyWebhookSignature(body, signature) {
  if (!signature) return false;
  const hash = crypto
    .createHmac('sha512', PAYSTACK_CONFIG.secretKey)
    .update(JSON.stringify(body))
    .digest('hex');
  return hash === signature;
}

// Validate Paystack configuration on startup
let paystackConfigValid = false;
try {
  validatePaystackConfig();
  paystackConfigValid = true;
  console.log('✅ Paystack configuration validated successfully');
} catch (error) {
  console.error('❌ Paystack configuration error:', error.message);
  console.warn('⚠️ Paystack integration will be disabled until configuration is fixed');
}

// Rate limiting
const depositLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 min
  message: 'Too many deposit attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = '233' + cleaned.substring(1);
  if (!cleaned.startsWith('233')) cleaned = '233' + cleaned;
  return cleaned;
};

const sendSMS = async (to, message) => {
  try {
    const formattedPhone = formatPhoneNumber(to);
    if (!formattedPhone || formattedPhone.length < 12) {
      throw new Error('Invalid phone number format');
    }
    const url = `${process.env.MNOTIFY_BASE_URL}?key=${process.env.MNOTIFY_API_KEY}&to=${formattedPhone}&msg=${encodeURIComponent(message)}&sender_id=${process.env.MNOTIFY_SENDER_ID || 'DataMart'}`;
    const response = await axios.get(url);
    const responseCode = typeof response.data === 'number' ? response.data : 
      typeof response.data === 'string' ? parseInt(response.data.match(/\d+/)?.[0] || '0') : 
      response.data.code || 0;
    
    if (responseCode === 1000 || responseCode === 1007) {
      return { success: true, message: 'SMS sent successfully' };
    }
    throw new Error(`SMS Error Code: ${responseCode}`);
  } catch (error) {
    console.error('SMS Error:', error.message);
    return { success: false, error: error.message };
  }
};

const sendDepositSMS = async (user, amount, newBalance) => {
  try {
    const message = `Hello ${user.name}! Your account has been credited with GHS ${amount.toFixed(2)}. New balance: GHS ${newBalance.toFixed(2)}. Thank you!`;
    const result = await sendSMS(user.phoneNumber, message);
    if (result.success) {
      console.log(`Deposit SMS sent to ${user.phoneNumber}`);
    }
    return result;
  } catch (error) {
    console.error('Send Deposit SMS Error:', error);
    return { success: false, error: error.message };
  }
};

// ✅ INITIATE DEPOSIT
router.post('/deposit', depositLimiter, async (req, res) => {
  try {
    if (!paystackConfigValid) {
      return res.status(503).json({ 
        success: false, 
        error: 'Payment service temporarily unavailable',
        message: 'Paystack configuration is missing.'
      });
    }

    const { userId, amount, email } = req.body;
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid deposit details' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.isDisabled) {
      return res.status(403).json({
        success: false,
        error: 'Account disabled',
        message: 'Your account has been disabled'
      });
    }

    const depositAmount = parseFloat(amount);
    if (depositAmount > 50000) {
      return res.status(400).json({ success: false, error: 'Maximum deposit is GHS 50,000' });
    }

    const amountValidation = validateAmount(depositAmount);
    if (!amountValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid amount', 
        details: amountValidation.errors 
      });
    }

    const fee = calculateFee(depositAmount);
    const totalAmountWithFee = depositAmount + fee;
    const clientIP = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const reference = generateReference('DEP');
    const balanceBefore = user.walletBalance;
    const balanceAfter = balanceBefore + depositAmount;

    const transaction = new Transaction({
      userId,
      type: 'deposit',
      amount: depositAmount,
      balanceBefore,
      balanceAfter,
      status: 'pending',
      reference,
      gateway: 'paystack',
      description: `Wallet deposit via Paystack`,
      metadata: {
        expectedPaystackAmount: totalAmountWithFee,
        fee,
        baseAmount: depositAmount,
        ip: clientIP,
        userAgent: req.headers['user-agent'],
        initiatedAt: new Date()
      }
    });

    await transaction.save();

    try {
      const paystackResponse = await axios.post(
        `${PAYSTACK_CONFIG.baseUrl}${PAYSTACK_ENDPOINTS.initialize}`,
        {
          email: email || user.email,
          amount: toPaystackAmount(totalAmountWithFee),
          currency: 'GHS',
          reference,
          callback_url: generateCallbackUrl(reference),
          metadata: {
            custom_fields: [
              { display_name: "User ID", variable_name: "user_id", value: userId.toString() },
              { display_name: "Base Amount", variable_name: "base_amount", value: depositAmount.toString() }
            ]
          }
        },
        {
          headers: getPaystackHeaders()
        }
      );

      if (!paystackResponse.data?.data?.authorization_url) {
        throw new Error('Invalid response from Paystack API');
      }

      return res.json({
        success: true,
        message: 'Deposit initiated',
        paystackUrl: paystackResponse.data.data.authorization_url,
        reference,
        depositInfo: {
          baseAmount: depositAmount,
          fee,
          totalAmount: totalAmountWithFee
        }
      });
    } catch (paystackError) {
      console.error('Paystack API Error:', paystackError.response?.data || paystackError.message);
      
      transaction.status = 'failed';
      transaction.metadata = {
        ...transaction.metadata,
        paystackError: paystackError.response?.data || paystackError.message,
        failedAt: new Date()
      };
      await transaction.save();

      return res.status(502).json({
        success: false,
        error: 'Payment gateway error',
        message: 'Unable to initialize payment. Please try again.'
      });
    }
  } catch (error) {
    console.error('Deposit Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ✅ PROCESS SUCCESSFUL PAYMENT
async function processSuccessfulPayment(reference) {
  const transaction = await Transaction.findOneAndUpdate(
    { reference, status: 'pending', processing: { $ne: true } },
    { $set: { processing: true } },
    { new: true }
  );

  if (!transaction) {
    console.log(`Transaction ${reference} not found or already processed`);
    return { success: false, message: 'Transaction not found or already processed' };
  }

  try {
    console.log(`✅ Verifying payment with Paystack: ${reference}`);
    const paystackResponse = await axios.get(
      `${PAYSTACK_CONFIG.baseUrl}${PAYSTACK_ENDPOINTS.verify}/${reference}`,
      { headers: getPaystackHeaders() }
    );

    const paystackData = paystackResponse.data.data;
    const actualAmountPaid = fromPaystackAmount(paystackData.amount);
    
    let expectedAmount;
    if (transaction.metadata?.expectedPaystackAmount) {
      expectedAmount = transaction.metadata.expectedPaystackAmount;
    } else {
      const calculatedFee = calculateFee(transaction.amount);
      expectedAmount = transaction.amount + calculatedFee;
    }
    
    // FRAUD CHECK
    const tolerance = Math.max(0.5, expectedAmount * 0.01);
    
    if (Math.abs(actualAmountPaid - expectedAmount) > tolerance) {
      console.error(`🚨 FRAUD DETECTED!`, { reference, expectedAmount, actualAmountPaid });
      transaction.status = 'failed';
      transaction.processing = false;
      transaction.metadata = {
        ...transaction.metadata,
        fraudDetected: true,
        fraudReason: 'Amount mismatch',
        expectedAmount,
        actualAmountPaid,
        fraudDetectedAt: new Date()
      };
      await transaction.save();
      return { success: false, message: 'Payment verification failed' };
    }

    if (paystackData.status !== 'success') {
      transaction.status = 'failed';
      transaction.processing = false;
      await transaction.save();
      return { success: false, message: `Payment not successful: ${paystackData.status}` };
    }

    const user = await User.findById(transaction.userId);
    if (!user) {
      transaction.processing = false;
      await transaction.save();
      return { success: false, message: 'User not found' };
    }

    const previousBalance = user.walletBalance;
    user.walletBalance += transaction.amount;
    await user.save();
    
    transaction.status = 'completed';
    transaction.balanceBefore = previousBalance;
    transaction.balanceAfter = user.walletBalance;
    transaction.processing = false;
    transaction.completedAt = new Date();
    transaction.metadata = {
      ...transaction.metadata,
      paystackData,
      verifiedAt: new Date()
    };
    await transaction.save();

    await sendDepositSMS(user, transaction.amount, user.walletBalance);
    return { success: true, message: 'Deposit successful', newBalance: user.walletBalance };
  } catch (error) {
    transaction.processing = false;
    transaction.status = 'failed';
    await transaction.save();
    throw error;
  }
}

// ✅ CALLBACK ROUTE
router.get('/callback', async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment?error=no_reference`);
    }
    
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment?reference=${reference}`);
  } catch (error) {
    console.error('Callback Error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment?error=processing_error`);
  }
});

// ✅ WEBHOOK
router.post('/paystack/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    if (!verifyWebhookSignature(req.body, signature)) {
      console.error('❌ Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    if (event.event === 'charge.success') {
      const { reference } = event.data;
      console.log(`Processing webhook payment: ${reference}`);
      await processSuccessfulPayment(reference);
    }
    
    return res.json({ message: 'Event received' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ VERIFY PAYMENT
router.get('/verify-payment', async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) {
      return res.status(400).json({ success: false, error: 'Reference required' });
    }

    const transaction = await Transaction.findOne({ reference });
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    if (transaction.status === 'completed') {
      return res.json({
        success: true,
        message: 'Payment verified',
        data: {
          reference,
          amount: transaction.amount,
          status: transaction.status,
          balanceBefore: transaction.balanceBefore,
          balanceAfter: transaction.balanceAfter,
          balanceChange: transaction.balanceAfter - transaction.balanceBefore
        }
      });
    }

    if (transaction.status === 'pending') {
      const result = await processSuccessfulPayment(reference);
      if (result.success) {
        const updated = await Transaction.findOne({ reference });
        return res.json({
          success: true,
          message: 'Payment verified successfully',
          data: {
            reference,
            amount: updated.amount,
            status: 'completed',
            balanceBefore: updated.balanceBefore,
            balanceAfter: updated.balanceAfter,
            balanceChange: updated.balanceAfter - updated.balanceBefore,
            newBalance: result.newBalance
          }
        });
      } else {
        return res.json({
          success: false,
          message: result.message,
          data: { reference, amount: transaction.amount, status: transaction.status }
        });
      }
    }

    return res.json({
      success: false,
      message: `Payment status: ${transaction.status}`,
      data: { reference, amount: transaction.amount, status: transaction.status }
    });
  } catch (error) {
    console.error('Verification Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;

