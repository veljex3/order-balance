const User = require("../models/user.model");
const Transaction = require("../models/transaction.model");
const MarketService = require("../services/market.service");

const getUserBalance = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    let user = await User.findOne({ walletAddress });

    if (!user) {
      user = new User({ walletAddress });
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        balances: user.balances,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Error getting user balance:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const resetUserBalance = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    let user = await User.findOne({ walletAddress });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldBalances = { ...user.balances };

    user.resetBalances();
    await user.save();

    const mongoose = require("mongoose");
    const resetTransaction = new Transaction({
      walletAddress,
      orderId: new mongoose.Types.ObjectId(),
      symbol: "RESET",
      type: "RESET",
      baseAsset: "ALL",
      quoteAsset: "ALL",
      baseAmount: 0,
      quoteAmount: 0,
      price: 0,
      balancesBefore: new Map(Object.entries(oldBalances)),
      balancesAfter: new Map(Object.entries(user.balances)),
      pnl: 0,
      notes: "Demo balance reset by user",
    });

    await resetTransaction.save();

    res.json({
      success: true,
      message: "Balance reset successfully",
      data: {
        walletAddress: user.walletAddress,
        balances: user.balances,
      },
    });
  } catch (error) {
    console.error("Error resetting user balance:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const createOrGetUser = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    let user = await User.findOne({ walletAddress });

    if (!user) {
      user = new User({ walletAddress });
      await user.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    res.json({
      success: true,
      message: user.isNew ? "User created successfully" : "User found",
      data: {
        walletAddress: user.walletAddress,
        balances: user.balances,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating/getting user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateUserBalance = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { balances } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    if (!balances || typeof balances !== "object") {
      return res.status(400).json({
        success: false,
        message: "Balances object is required",
      });
    }

    let user = await User.findOne({ walletAddress });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldBalances = { ...user.balances };

    const supportedAssets = ["BTC", "ETH", "LTC", "XRP", "USDT"];
    for (const asset of supportedAssets) {
      if (balances[asset] !== undefined) {
        const amount = parseFloat(balances[asset]);
        if (isNaN(amount) || amount < 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid amount for ${asset}. Must be a positive number.`,
          });
        }
        user.balances[asset] = amount;
      }
    }

    await user.save();

    const mongoose = require("mongoose");
    const updateTransaction = new Transaction({
      walletAddress,
      orderId: new mongoose.Types.ObjectId(),
      symbol: "UPDATE",
      type: "RESET",
      baseAsset: "ALL",
      quoteAsset: "ALL",
      baseAmount: 0,
      quoteAmount: 0,
      price: 0,
      balancesBefore: new Map(Object.entries(oldBalances)),
      balancesAfter: new Map(Object.entries(user.balances)),
      pnl: 0,
      notes: "Demo balance updated by user",
    });

    await updateTransaction.save();

    res.json({
      success: true,
      message: "Balance updated successfully",
      data: {
        walletAddress: user.walletAddress,
        balances: user.balances,
      },
    });
  } catch (error) {
    console.error("Error updating user balance:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getUserBalance,
  resetUserBalance,
  createOrGetUser,
  updateUserBalance,
};
