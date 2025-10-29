// routes/adminAgentStoreRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middlewareUser/middleware');
const adminAuth = require('../adminMiddleware/middleware'); // Admin authentication middleware

// Import schemas
const { 
  User, 
  DataPurchase, 
  Transaction,
  OrderReport
} = require('../schema/schema');

const {
  AgentStore,
  AgentProduct,
  AgentTransaction,
  AgentWithdrawal,
  AgentCustomer,
  StoreReview,
  StoreAnalytics
} = require('../Agent_Store_Schema/page');

// ===== OFFICIAL PRICING STRUCTURE =====
const OFFICIAL_PRICING = {
  'YELLO': { // MTN pricing structure
    '1': 4.50,
    '2': 9.20,
    '3': 13.50,
    '4': 18.50,
    '5': 23.50,
    '6': 27.00,
    '8': 35.50,
    '10': 43.50,
    '15': 62.50,
    '20': 83.00,
    '25': 105.00,
    '30': 129.00,
    '40': 166.00,
    '50': 207.00,
    '100': 407.00
  },
  'AT_PREMIUM': { // AirtelTigo Premium pricing structure
    '1': 3.95,
    '2': 8.35,
    '3': 13.25,
    '4': 16.50,
    '5': 19.50,
    '6': 23.50,
    '8': 30.50,
    '10': 38.50,
    '12': 45.50,
    '15': 57.50,
    '25': 95.00,
    '30': 115.00,
    '40': 151.00,
    '50': 190.00
  },
  'TELECEL': { // Telecel pricing structure
    '10': 36.50,
    '12': 43.70,
    '15': 52.85,
    '20': 69.80,
    '25': 86.75,
    '30': 103.70,
    '35': 120.65,
    '40': 137.60,
    '45': 154.55,
    '50': 171.50,
    '100': 341.00
  }
};

// Helper function to log admin operations
const logAdminOperation = (operation, adminId, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [ADMIN] [${operation}] Admin: ${adminId}`, JSON.stringify(data, null, 2));
};

// ===== STORE MANAGEMENT ROUTES =====

// Get all stores with filtering and pagination
router.get('/stores', auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;

    const query = {};

    // Add filters
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { storeSlug: { $regex: search, $options: 'i' } },
        { 'contactInfo.email': { $regex: search, $options: 'i' } },
        { 'contactInfo.phoneNumber': { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [stores, total] = await Promise.all([
      AgentStore.find(query)
        .populate('agentId', 'name email phoneNumber')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      AgentStore.countDocuments(query)
    ]);

    // Get summary statistics
    const stats = await AgentStore.aggregate([
      {
        $group: {
          _id: null,
          totalStores: { $sum: 1 },
          activeStores: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          pendingStores: {
            $sum: { $cond: [{ $eq: ['$status', 'pending_approval'] }, 1, 0] }
          },
          suspendedStores: {
            $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$metrics.totalRevenue' },
          totalProfit: { $sum: '$metrics.totalProfit' }
        }
      }
    ]);

    logAdminOperation('GET_ALL_STORES', req.user._id, {
      filters: { status, search },
      page,
      limit,
      totalFound: total
    });

    res.json({
      status: 'success',
      data: {
        stores,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        statistics: stats[0] || {
          totalStores: 0,
          activeStores: 0,
          pendingStores: 0,
          suspendedStores: 0,
          totalRevenue: 0,
          totalProfit: 0
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stores',
      details: error.message
    });
  }
});

// Get single store details
router.get('/stores/:storeId', auth, adminAuth, async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await AgentStore.findById(storeId)
      .populate('agentId', 'name email phoneNumber walletBalance')
      .populate('approvedBy', 'name email');

    if (!store) {
      return res.status(404).json({
        status: 'error',
        message: 'Store not found'
      });
    }

    // Get additional stats
    const [products, transactions, withdrawals, customers] = await Promise.all([
      AgentProduct.countDocuments({ storeId }),
      AgentTransaction.countDocuments({ storeId }),
      AgentWithdrawal.find({ storeId }).sort({ createdAt: -1 }).limit(5),
      AgentCustomer.countDocuments({ storeId })
    ]);

    res.json({
      status: 'success',
      data: {
        store,
        statistics: {
          totalProducts: products,
          totalTransactions: transactions,
          totalCustomers: customers,
          recentWithdrawals: withdrawals
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch store details',
      details: error.message
    });
  }
});

// Approve store
router.post('/stores/:storeId/approve', auth, adminAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { storeId } = req.params;
    const { notes } = req.body;

    const store = await AgentStore.findById(storeId).session(session);

    if (!store) {
      await session.abortTransaction();
      return res.status(404).json({
        status: 'error',
        message: 'Store not found'
      });
    }

    if (store.status === 'active') {
      await session.abortTransaction();
      return res.status(400).json({
        status: 'error',
        message: 'Store is already active'
      });
    }

    // Update store status
    store.status = 'active';
    store.approvedAt = new Date();
    store.approvedBy = req.user._id;
    
    // Add admin note
    store.adminNotes.push({
      note: notes || `Store approved by admin`,
      addedBy: req.user._id,
      addedAt: new Date()
    });

    await store.save({ session });

    // Create initial analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingAnalytics = await StoreAnalytics.findOne({
      storeId: store._id,
      date: today
    }).session(session);

    if (!existingAnalytics) {
      const analytics = new StoreAnalytics({
        storeId: store._id,
        date: today
      });
      await analytics.save({ session });
    }

    await session.commitTransaction();

    logAdminOperation('APPROVE_STORE', req.user._id, {
      storeId,
      storeName: store.storeName,
      notes
    });

    res.json({
      status: 'success',
      message: 'Store approved successfully',
      data: store
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve store',
      details: error.message
    });
  } finally {
    session.endSession();
  }
});

// Suspend store
router.post('/stores/:storeId/suspend', auth, adminAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { storeId } = req.params;
    const { reason, duration, violationType } = req.body;

    if (!reason) {
      await session.abortTransaction();
      return res.status(400).json({
        status: 'error',
        message: 'Suspension reason is required'
      });
    }

    const store = await AgentStore.findById(storeId).session(session);

    if (!store) {
      await session.abortTransaction();
      return res.status(404).json({
        status: 'error',
        message: 'Store not found'
      });
    }

    // Update store status
    store.status = 'suspended';
    store.isOpen = false;
    
    // Add suspension history
    store.suspensionHistory.push({
      reason,
      suspendedBy: req.user._id,
      suspendedAt: new Date(),
      liftedAt: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null
    });

    // Add violation if specified
    if (violationType) {
      store.violations.push({
        type: violationType,
        description: reason,
        date: new Date(),
        penalty: 'Store suspension'
      });
    }

    // Add admin note
    store.adminNotes.push({
      note: `Store suspended: ${reason}`,
      addedBy: req.user._id,
      addedAt: new Date()
    });

    await store.save({ session });

    await session.commitTransaction();

    logAdminOperation('SUSPEND_STORE', req.user._id, {
      storeId,
      storeName: store.storeName,
      reason,
      duration,
      violationType
    });

    res.json({
      status: 'success',
      message: 'Store suspended successfully',
      data: store
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      status: 'error',
      message: 'Failed to suspend store',
      details: error.message
    });
  } finally {
    session.endSession();
  }
});

// Unsuspend store
router.post('/stores/:storeId/unsuspend', auth, adminAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { storeId } = req.params;
    const { notes } = req.body;

    const store = await AgentStore.findById(storeId).session(session);

    if (!store) {
      await session.abortTransaction();
      return res.status(404).json({
        status: 'error',
        message: 'Store not found'
      });
    }

    if (store.status !== 'suspended') {
      await session.abortTransaction();
      return res.status(400).json({
        status: 'error',
        message: 'Store is not suspended'
      });
    }

    // Update store status
    store.status = 'active';
    store.isOpen = true;
    
    // Update last suspension record
    if (store.suspensionHistory.length > 0) {
      const lastSuspension = store.suspensionHistory[store.suspensionHistory.length - 1];
      lastSuspension.liftedAt = new Date();
    }

    // Add admin note
    store.adminNotes.push({
      note: notes || 'Store suspension lifted',
      addedBy: req.user._id,
      addedAt: new Date()
    });

    await store.save({ session });

    await session.commitTransaction();

    logAdminOperation('UNSUSPEND_STORE', req.user._id, {
      storeId,
      storeName: store.storeName,
      notes
    });

    res.json({
      status: 'success',
      message: 'Store unsuspended successfully',
      data: store
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      status: 'error',
      message: 'Failed to unsuspend store',
      details: error.message
    });
  } finally {
    session.endSession();
  }
});

// Close store permanently
router.post('/stores/:storeId/close', auth, adminAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { storeId } = req.params;
    const { reason, refundBalance } = req.body;

    if (!reason) {
      await session.abortTransaction();
      return res.status(400).json({
        status: 'error',
        message: 'Closure reason is required'
      });
    }

    const store = await AgentStore.findById(storeId).session(session);

    if (!store) {
      await session.abortTransaction();
      return res.status(404).json({
        status: 'error',
        message: 'Store not found'
      });
    }

    // Check for pending withdrawals
    const pendingWithdrawals = await AgentWithdrawal.countDocuments({
      storeId,
      status: { $in: ['pending', 'processing'] }
    }).session(session);

    if (pendingWithdrawals > 0) {
      await session.abortTransaction();
      return res.status(400).json({
        status: 'error',
        message: 'Cannot close store with pending withdrawals',
        pendingWithdrawals
      });
    }

    // Handle balance refund if requested
    if (refundBalance && store.wallet.availableBalance > 0) {
      const refundAmount = store.wallet.availableBalance;
      
      // Create final withdrawal
      const finalWithdrawal = new AgentWithdrawal({
        withdrawalId: `FINAL-${Date.now()}`,
        agentId: store.agentId,
        storeId: store._id,
        requestedAmount: refundAmount,
        fee: 0,
        netAmount: refundAmount,
        method: 'bank',
        status: 'pending',
        agentNotes: 'Final balance withdrawal - Store closure',
        adminNotes: `Store closed by admin. Final balance refund initiated.`
      });
      await finalWithdrawal.save({ session });
      
      store.wallet.availableBalance = 0;
      store.wallet.pendingBalance = refundAmount;
    }

    // Update store status
    store.status = 'closed';
    store.isOpen = false;
    store.closureReason = reason;
    store.closedAt = new Date();

    // Deactivate all products
    await AgentProduct.updateMany(
      { storeId },
      { isActive: false, inStock: false },
      { session }
    );

    // Add admin note
    store.adminNotes.push({
      note: `Store permanently closed: ${reason}`,
      addedBy: req.user._id,
      addedAt: new Date()
    });

    await store.save({ session });

    await session.commitTransaction();

    logAdminOperation('CLOSE_STORE', req.user._id, {
      storeId,
      storeName: store.storeName,
      reason,
      refundBalance
    });

    res.json({
      status: 'success',
      message: 'Store closed permanently',
      data: store
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      status: 'error',
      message: 'Failed to close store',
      details: error.message
    });
  } finally {
    session.endSession();
  }
});

// Update store settings
router.put('/stores/:storeId/settings', auth, adminAuth, async (req, res) => {
  try {
    const { storeId } = req.params;
    const updates = req.body;

    // Remove protected fields
    delete updates._id;
    delete updates.agentId;
    delete updates.createdAt;
    delete updates.wallet;

    const store = await AgentStore.findByIdAndUpdate(
      storeId,
      {
        ...updates,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!store) {
      return res.status(404).json({
        status: 'error',
        message: 'Store not found'
      });
    }

    // Add admin note
    await AgentStore.findByIdAndUpdate(storeId, {
      $push: {
        adminNotes: {
          note: `Store settings updated by admin`,
          addedBy: req.user._id,
          addedAt: new Date()
        }
      }
    });

    logAdminOperation('UPDATE_STORE_SETTINGS', req.user._id, {
      storeId,
      storeName: store.storeName,
      updatedFields: Object.keys(updates)
    });

    res.json({
      status: 'success',
      message: 'Store settings updated successfully',
      data: store
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update store settings',
      details: error.message
    });
  }
});

// ===== PRODUCT MANAGEMENT ROUTES =====

// Update base prices globally
// In adminAgentStoreRoutes.js, update the update-base-prices route:
router.post('/products/update-base-prices', auth, adminAuth, async (req, res) => {
  try {
    const { network, prices } = req.body;

    if (!network || !prices) {
      return res.status(400).json({
        status: 'error',
        message: 'Network and prices are required'
      });
    }

    const updatedProducts = [];

    // Update all products for the specified network WITHOUT session
    for (const [capacity, newBasePrice] of Object.entries(prices)) {
      const products = await AgentProduct.find({
        network,
        capacity: parseInt(capacity)
      }); // Removed .session(session)

      for (const product of products) {
        const oldBasePrice = product.basePrice;
        product.basePrice = newBasePrice;
        
        // Recalculate profit
        product.profit = product.sellingPrice - newBasePrice;
        product.profitMargin = ((product.profit / newBasePrice) * 100).toFixed(2);
        
        await product.save(); // Removed { session }
        
        updatedProducts.push({
          productId: product._id,
          storeId: product.storeId,
          oldBasePrice,
          newBasePrice,
          sellingPrice: product.sellingPrice,
          newProfit: product.profit
        });
      }
    }

    // Removed session.commitTransaction();

    logAdminOperation('UPDATE_BASE_PRICES', req.user._id, {
      network,
      prices,
      affectedProducts: updatedProducts.length
    });

    res.json({
      status: 'success',
      message: `Base prices updated for ${updatedProducts.length} products`,
      data: {
        network,
        newPrices: prices,
        affectedProducts: updatedProducts
      }
    });

  } catch (error) {
    // Removed session.abortTransaction();
    console.error('UPDATE_BASE_PRICES_ERROR:', error); // Add logging
    res.status(500).json({
      status: 'error',
      message: 'Failed to update base prices',
      details: error.message
    });
  }
});

// Force update product pricing
router.put('/stores/:storeId/products/:productId/price', auth, adminAuth, async (req, res) => {
  try {
    const { storeId, productId } = req.params;
    const { basePrice, sellingPrice, forceUpdate } = req.body;

    const product = await AgentProduct.findOne({
      _id: productId,
      storeId
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Update prices
    if (basePrice !== undefined) {
      product.basePrice = basePrice;
    }
    
    if (sellingPrice !== undefined) {
      product.sellingPrice = sellingPrice;
    }

    // Recalculate profit
    product.profit = product.sellingPrice - product.basePrice;
    product.profitMargin = ((product.profit / product.basePrice) * 100).toFixed(2);

    // Validate pricing unless forced
    if (!forceUpdate) {
      const store = await AgentStore.findById(storeId);
      
      if (product.profitMargin < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Selling price cannot be below base price'
        });
      }

      if (store.commissionSettings.maximumMarkup && 
          product.profitMargin > store.commissionSettings.maximumMarkup) {
        return res.status(400).json({
          status: 'error',
          message: `Markup exceeds maximum allowed (${store.commissionSettings.maximumMarkup}%)`,
          currentMarkup: product.profitMargin
        });
      }
    }

    await product.save();

    logAdminOperation('UPDATE_PRODUCT_PRICE', req.user._id, {
      storeId,
      productId,
      network: product.network,
      capacity: product.capacity,
      basePrice: product.basePrice,
      sellingPrice: product.sellingPrice,
      forceUpdate
    });

    res.json({
      status: 'success',
      message: 'Product price updated successfully',
      data: product
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update product price',
      details: error.message
    });
  }
});

// Disable/Enable products in bulk
router.post('/stores/:storeId/products/bulk-update', auth, adminAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { storeId } = req.params;
    const { productIds, action, reason } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        status: 'error',
        message: 'Product IDs are required'
      });
    }

    let updateData = {};

    switch (action) {
      case 'activate':
        updateData = { isActive: true, inStock: true };
        break;
      case 'deactivate':
        updateData = { isActive: false };
        break;
      case 'out_of_stock':
        updateData = { inStock: false };
        break;
      case 'in_stock':
        updateData = { inStock: true };
        break;
      default:
        await session.abortTransaction();
        return res.status(400).json({
          status: 'error',
          message: 'Invalid action'
        });
    }

    const result = await AgentProduct.updateMany(
      {
        _id: { $in: productIds },
        storeId
      },
      updateData,
      { session }
    );

    // Add admin note to store
    await AgentStore.findByIdAndUpdate(
      storeId,
      {
        $push: {
          adminNotes: {
            note: `Bulk product update: ${action} for ${result.modifiedCount} products. Reason: ${reason || 'Not specified'}`,
            addedBy: req.user._id,
            addedAt: new Date()
          }
        }
      },
      { session }
    );

    await session.commitTransaction();

    logAdminOperation('BULK_UPDATE_PRODUCTS', req.user._id, {
      storeId,
      action,
      affectedProducts: result.modifiedCount,
      reason
    });

    res.json({
      status: 'success',
      message: `${result.modifiedCount} products updated successfully`,
      data: {
        action,
        affectedProducts: result.modifiedCount,
        totalProducts: productIds.length
      }
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      status: 'error',
      message: 'Failed to update products',
      details: error.message
    });
  } finally {
    session.endSession();
  }
});

// ===== WITHDRAWAL MANAGEMENT ROUTES =====

// Get all pending withdrawals
router.get('/withdrawals/pending', auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      method,
      minAmount,
      maxAmount
    } = req.query;

    const query = { status: 'pending' };

    if (method) query.method = method;
    if (minAmount || maxAmount) {
      query.requestedAmount = {};
      if (minAmount) query.requestedAmount.$gte = parseFloat(minAmount);
      if (maxAmount) query.requestedAmount.$lte = parseFloat(maxAmount);
    }

    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      AgentWithdrawal.find(query)
        .populate('agentId', 'name email phoneNumber')
        .populate('storeId', 'storeName storeSlug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AgentWithdrawal.countDocuments(query)
    ]);

    // Calculate total pending amount
    const totalPending = await AgentWithdrawal.aggregate([
      { $match: { status: 'pending' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$requestedAmount' },
          totalFees: { $sum: '$fee' },
          netAmount: { $sum: '$netAmount' }
        }
      }
    ]);

    res.json({
      status: 'success',
      data: {
        withdrawals,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        },
        summary: totalPending[0] || {
          totalAmount: 0,
          totalFees: 0,
          netAmount: 0
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending withdrawals',
      details: error.message
    });
  }
});

// Approve withdrawal
router.post('/withdrawals/:withdrawalId/approve', auth, adminAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { withdrawalId } = req.params;
    const { paymentReference, notes } = req.body;

    const withdrawal = await AgentWithdrawal.findById(withdrawalId)
      .populate('storeId')
      .session(session);

    if (!withdrawal) {
      await session.abortTransaction();
      return res.status(404).json({
        status: 'error',
        message: 'Withdrawal not found'
      });
    }

    if (withdrawal.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({
        status: 'error',
        message: 'Withdrawal is not pending'
      });
    }

    // Update withdrawal
    withdrawal.status = 'completed';
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();
    withdrawal.completedAt = new Date();
    withdrawal.paymentReference = paymentReference;
    withdrawal.adminNotes = notes || 'Approved by admin';
    await withdrawal.save({ session });

    // Update store wallet
    const store = withdrawal.storeId;
    store.wallet.pendingBalance -= withdrawal.requestedAmount;
    store.wallet.totalWithdrawn += withdrawal.requestedAmount;
    await store.save({ session });

    await session.commitTransaction();

    logAdminOperation('APPROVE_WITHDRAWAL', req.user._id, {
      withdrawalId,
      amount: withdrawal.requestedAmount,
      storeId: store._id,
      paymentReference
    });

    res.json({
      status: 'success',
      message: 'Withdrawal approved successfully',
      data: withdrawal
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve withdrawal',
      details: error.message
    });
  } finally {
    session.endSession();
  }
});

// Reject withdrawal
router.post('/withdrawals/:withdrawalId/reject', auth, adminAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { withdrawalId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      await session.abortTransaction();
      return res.status(400).json({
        status: 'error',
        message: 'Rejection reason is required'
      });
    }

    const withdrawal = await AgentWithdrawal.findById(withdrawalId)
      .populate('storeId')
      .session(session);

    if (!withdrawal) {
      await session.abortTransaction();
      return res.status(404).json({
        status: 'error',
        message: 'Withdrawal not found'
      });
    }

    if (withdrawal.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({
        status: 'error',
        message: 'Withdrawal is not pending'
      });
    }

    // Update withdrawal
    withdrawal.status = 'rejected';
    withdrawal.rejectedBy = req.user._id;
    withdrawal.rejectedAt = new Date();
    withdrawal.rejectionReason = reason;
    await withdrawal.save({ session });

    // Return funds to available balance
    const store = withdrawal.storeId;
    store.wallet.pendingBalance -= withdrawal.requestedAmount;
    store.wallet.availableBalance += withdrawal.requestedAmount;
    await store.save({ session });

    await session.commitTransaction();

    logAdminOperation('REJECT_WITHDRAWAL', req.user._id, {
      withdrawalId,
      amount: withdrawal.requestedAmount,
      storeId: store._id,
      reason
    });

    res.json({
      status: 'success',
      message: 'Withdrawal rejected',
      data: withdrawal
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      status: 'error',
      message: 'Failed to reject withdrawal',
      details: error.message
    });
  } finally {
    session.endSession();
  }
});

// ===== FINANCIAL MANAGEMENT ROUTES =====

// Adjust store wallet balance
router.post('/stores/:storeId/wallet/adjust', auth, adminAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { storeId } = req.params;
    const { amount, type, reason } = req.body;

    if (!amount || !type || !reason) {
      await session.abortTransaction();
      return res.status(400).json({
        status: 'error',
        message: 'Amount, type, and reason are required'
      });
    }

    const store = await AgentStore.findById(storeId).session(session);

    if (!store) {
      await session.abortTransaction();
      return res.status(404).json({
        status: 'error',
        message: 'Store not found'
      });
    }

    const previousBalance = store.wallet.availableBalance;

    if (type === 'credit') {
      store.wallet.availableBalance += amount;
      store.wallet.totalEarnings += amount;
    } else if (type === 'debit') {
      if (store.wallet.availableBalance < amount) {
        await session.abortTransaction();
        return res.status(400).json({
          status: 'error',
          message: 'Insufficient balance for debit',
          currentBalance: store.wallet.availableBalance
        });
      }
      store.wallet.availableBalance -= amount;
    } else {
      await session.abortTransaction();
      return res.status(400).json({
        status: 'error',
        message: 'Invalid adjustment type. Use "credit" or "debit"'
      });
    }

    // Add admin note
    store.adminNotes.push({
      note: `Wallet adjustment: ${type} ₵${amount} - ${reason}`,
      addedBy: req.user._id,
      addedAt: new Date()
    });

    await store.save({ session });

    // Create transaction record for audit
    const transaction = new AgentTransaction({
      transactionId: `ADMIN-ADJ-${Date.now()}`,
      storeId: store._id,
      agentId: store.agentId,
      network: 'ADMIN',
      capacity: 0,
      phoneNumber: 'ADMIN',
      basePrice: 0,
      sellingPrice: 0,
      agentProfit: type === 'credit' ? amount : -amount,
      platformFee: 0,
      netProfit: type === 'credit' ? amount : -amount,
      paymentMethod: 'wallet',
      paymentStatus: 'completed',
      orderStatus: 'completed',
      agentNotes: `Admin adjustment: ${reason}`,
      systemNotes: `Adjusted by admin ${req.user._id}`
    });
    await transaction.save({ session });

    await session.commitTransaction();

    logAdminOperation('WALLET_ADJUSTMENT', req.user._id, {
      storeId,
      storeName: store.storeName,
      type,
      amount,
      previousBalance,
      newBalance: store.wallet.availableBalance,
      reason
    });

    res.json({
      status: 'success',
      message: 'Wallet adjusted successfully',
      data: {
        storeId,
        storeName: store.storeName,
        adjustment: {
          type,
          amount,
          reason,
          previousBalance,
          newBalance: store.wallet.availableBalance
        }
      }
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      status: 'error',
      message: 'Failed to adjust wallet',
      details: error.message
    });
  } finally {
    session.endSession();
  }
});

// ===== ANALYTICS & REPORTING ROUTES =====

// Get system-wide analytics
router.get('/analytics/overview', auth, adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [
      storeStats,
      transactionStats,
      withdrawalStats,
      productStats
    ] = await Promise.all([
      // Store statistics
      AgentStore.aggregate([
        {
          $group: {
            _id: null,
            totalStores: { $sum: 1 },
            activeStores: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            suspendedStores: {
              $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
            },
            totalRevenue: { $sum: '$metrics.totalRevenue' },
            totalProfit: { $sum: '$metrics.totalProfit' },
            avgRating: { $avg: '$metrics.rating' }
          }
        }
      ]),

      // Transaction statistics
      AgentTransaction.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            completedTransactions: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'completed'] }, 1, 0] }
            },
            totalVolume: { $sum: '$sellingPrice' },
            totalProfit: { $sum: '$netProfit' },
            totalPlatformFees: { $sum: '$platformFee' }
          }
        }
      ]),

      // Withdrawal statistics
      AgentWithdrawal.aggregate([
        {
          $group: {
            _id: null,
            totalWithdrawals: { $sum: 1 },
            pendingWithdrawals: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            totalWithdrawn: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$requestedAmount', 0] }
            },
            totalFees: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$fee', 0] }
            }
          }
        }
      ]),

      // Product statistics
      AgentProduct.aggregate([
        {
          $group: {
            _id: '$network',
            count: { $sum: 1 },
            totalSold: { $sum: '$totalSold' },
            totalRevenue: { $sum: '$totalRevenue' },
            avgProfit: { $avg: '$profit' }
          }
        }
      ])
    ]);

    res.json({
      status: 'success',
      data: {
        stores: storeStats[0] || {},
        transactions: transactionStats[0] || {},
        withdrawals: withdrawalStats[0] || {},
        productsByNetwork: productStats,
        dateRange: {
          startDate,
          endDate
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch analytics',
      details: error.message
    });
  }
});

// Get top performing stores
router.get('/analytics/top-stores', auth, adminAuth, async (req, res) => {
  try {
    const { limit = 10, sortBy = 'revenue' } = req.query;

    let sortField;
    switch (sortBy) {
      case 'revenue':
        sortField = 'metrics.totalRevenue';
        break;
      case 'profit':
        sortField = 'metrics.totalProfit';
        break;
      case 'orders':
        sortField = 'metrics.totalOrders';
        break;
      case 'rating':
        sortField = 'metrics.rating';
        break;
      default:
        sortField = 'metrics.totalRevenue';
    }

    const topStores = await AgentStore.find({ status: 'active' })
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit))
      .populate('agentId', 'name email')
      .select('storeName storeSlug metrics wallet agentId');

    res.json({
      status: 'success',
      data: {
        topStores,
        sortedBy: sortBy
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch top stores',
      details: error.message
    });
  }
});

// ===== COMMISSION MANAGEMENT ROUTES =====

// Update commission settings
router.put('/stores/:storeId/commission', auth, adminAuth, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { 
      type, 
      defaultCommissionRate, 
      minimumMarkup, 
      maximumMarkup,
      tieredCommissions 
    } = req.body;

    const store = await AgentStore.findById(storeId);

    if (!store) {
      return res.status(404).json({
        status: 'error',
        message: 'Store not found'
      });
    }

    // Update commission settings
    if (type) store.commissionSettings.type = type;
    if (defaultCommissionRate !== undefined) {
      store.commissionSettings.defaultCommissionRate = defaultCommissionRate;
    }
    if (minimumMarkup !== undefined) {
      store.commissionSettings.minimumMarkup = minimumMarkup;
    }
    if (maximumMarkup !== undefined) {
      store.commissionSettings.maximumMarkup = maximumMarkup;
    }
    if (tieredCommissions) {
      store.commissionSettings.tieredCommissions = tieredCommissions;
    }

    // Add admin note
    store.adminNotes.push({
      note: `Commission settings updated by admin`,
      addedBy: req.user._id,
      addedAt: new Date()
    });

    await store.save();

    logAdminOperation('UPDATE_COMMISSION_SETTINGS', req.user._id, {
      storeId,
      storeName: store.storeName,
      newSettings: store.commissionSettings
    });

    res.json({
      status: 'success',
      message: 'Commission settings updated successfully',
      data: store.commissionSettings
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update commission settings',
      details: error.message
    });
  }
});

// ===== VIOLATION & PENALTY MANAGEMENT =====

// Add violation to store
router.post('/stores/:storeId/violations', auth, adminAuth, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { type, description, penalty } = req.body;

    if (!type || !description) {
      return res.status(400).json({
        status: 'error',
        message: 'Violation type and description are required'
      });
    }

    const store = await AgentStore.findById(storeId);

    if (!store) {
      return res.status(404).json({
        status: 'error',
        message: 'Store not found'
      });
    }

    // Add violation
    store.violations.push({
      type,
      description,
      penalty,
      date: new Date()
    });

    // Add admin note
    store.adminNotes.push({
      note: `Violation added: ${type} - ${description}`,
      addedBy: req.user._id,
      addedAt: new Date()
    });

    await store.save();

    logAdminOperation('ADD_VIOLATION', req.user._id, {
      storeId,
      storeName: store.storeName,
      violation: { type, description, penalty }
    });

    res.json({
      status: 'success',
      message: 'Violation added successfully',
      data: store.violations[store.violations.length - 1]
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to add violation',
      details: error.message
    });
  }
});

// ===== SEARCH & FILTER ROUTES =====

// Search transactions across all stores
router.get('/transactions/search', auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      network,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount
    } = req.query;

    const query = {};

    // Build search query
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    if (network) query.network = network;
    if (status) query.orderStatus = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      query.sellingPrice = {};
      if (minAmount) query.sellingPrice.$gte = parseFloat(minAmount);
      if (maxAmount) query.sellingPrice.$lte = parseFloat(maxAmount);
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      AgentTransaction.find(query)
        .populate('storeId', 'storeName storeSlug')
        .populate('agentId', 'name email')
        .populate('productId', 'network capacity')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AgentTransaction.countDocuments(query)
    ]);

    res.json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to search transactions',
      details: error.message
    });
  }
});

// Remove specific product from all stores
router.delete('/products/remove-from-all-stores', auth, adminAuth, async (req, res) => {
  try {
    const { network, capacity, action = 'deactivate' } = req.body;

    if (!network || !capacity) {
      return res.status(400).json({
        status: 'error',
        message: 'Network and capacity are required'
      });
    }

    console.log(`[ADMIN] Removing ${network} ${capacity}GB from all stores. Action: ${action}`);

    let result;
    let message;

    if (action === 'delete') {
      // Permanently delete the products
      result = await AgentProduct.deleteMany({
        network,
        capacity: parseInt(capacity)
      });
      
      message = `Permanently deleted ${result.deletedCount} products`;
      
      logAdminOperation('DELETE_PRODUCT_FROM_ALL_STORES', req.user._id, {
        network,
        capacity,
        deletedCount: result.deletedCount,
        action: 'delete'
      });

    } else if (action === 'deactivate') {
      // Soft delete - just deactivate and mark as out of stock
      result = await AgentProduct.updateMany(
        {
          network,
          capacity: parseInt(capacity)
        },
        {
          isActive: false,
          inStock: false,
          deactivatedBy: req.user._id,
          deactivatedAt: new Date(),
          deactivationReason: 'Admin removed product from all stores'
        }
      );
      
      message = `Deactivated ${result.modifiedCount} products`;
      
      logAdminOperation('DEACTIVATE_PRODUCT_FROM_ALL_STORES', req.user._id, {
        network,
        capacity,
        modifiedCount: result.modifiedCount,
        action: 'deactivate'
      });

    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid action. Use "delete" or "deactivate"'
      });
    }

    // Get affected stores for logging
    const affectedStores = await AgentProduct.distinct('storeId', {
      network,
      capacity: parseInt(capacity)
    });

    res.json({
      status: 'success',
      message,
      data: {
        network,
        capacity,
        action,
        affectedProducts: action === 'delete' ? result.deletedCount : result.modifiedCount,
        affectedStores: affectedStores.length
      }
    });

  } catch (error) {
    console.error('REMOVE_PRODUCT_FROM_ALL_STORES_ERROR:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove product from all stores',
      details: error.message
    });
  }
});

// Bulk remove multiple products from all stores
router.post('/products/bulk-remove-from-all-stores', auth, adminAuth, async (req, res) => {
  try {
    const { products, action = 'deactivate' } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Products array is required'
      });
    }

    const results = [];
    let totalAffected = 0;

    for (const product of products) {
      const { network, capacity } = product;
      
      if (!network || !capacity) continue;

      let result;
      
      if (action === 'delete') {
        result = await AgentProduct.deleteMany({
          network,
          capacity: parseInt(capacity)
        });
        
        results.push({
          network,
          capacity,
          affected: result.deletedCount
        });
        
        totalAffected += result.deletedCount;
        
      } else if (action === 'deactivate') {
        result = await AgentProduct.updateMany(
          {
            network,
            capacity: parseInt(capacity)
          },
          {
            isActive: false,
            inStock: false,
            deactivatedBy: req.user._id,
            deactivatedAt: new Date(),
            deactivationReason: 'Admin bulk removed products'
          }
        );
        
        results.push({
          network,
          capacity,
          affected: result.modifiedCount
        });
        
        totalAffected += result.modifiedCount;
      }
    }

    logAdminOperation('BULK_REMOVE_PRODUCTS_FROM_ALL_STORES', req.user._id, {
      products,
      action,
      totalAffected,
      results
    });

    res.json({
      status: 'success',
      message: `${action === 'delete' ? 'Deleted' : 'Deactivated'} ${totalAffected} products across all stores`,
      data: {
        action,
        totalAffected,
        details: results
      }
    });

  } catch (error) {
    console.error('BULK_REMOVE_PRODUCTS_ERROR:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to bulk remove products',
      details: error.message
    });
  }
});

// Get list of products that exist across stores (to see what can be removed)
router.get('/products/distribution', auth, adminAuth, async (req, res) => {
  try {
    const distribution = await AgentProduct.aggregate([
      {
        $group: {
          _id: {
            network: '$network',
            capacity: '$capacity'
          },
          storeCount: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          totalSold: { $sum: '$totalSold' },
          avgPrice: { $avg: '$sellingPrice' }
        }
      },
      {
        $sort: {
          '_id.network': 1,
          '_id.capacity': 1
        }
      }
    ]);

    const formatted = distribution.map(item => ({
      network: item._id.network,
      capacity: item._id.capacity,
      storeCount: item.storeCount,
      activeCount: item.activeCount,
      totalSold: item.totalSold,
      avgPrice: item.avgPrice?.toFixed(2) || 0
    }));

    res.json({
      status: 'success',
      data: formatted
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch product distribution',
      details: error.message
    });
  }
});

module.exports = router;

