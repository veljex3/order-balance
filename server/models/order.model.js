const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      enum: ["BTC/USDT", "ETH/BTC", "LTC/USDT", "XRP/USDT"],
    },
    type: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3, 4, 5],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: Number,
      required: true,
      enum: [0, 1, 2],
      default: 0,
    },
    executedPrice: {
      type: Number,
      default: null,
    },
    executedQuantity: {
      type: Number,
      default: 0,
    },
    created: {
      type: Date,
      default: Date.now,
    },
    completed: {
      type: Date,
      default: null,
    },

    lockedBalance: {
      type: Number,
      default: null,
    },
    lockedAsset: {
      type: String,
      default: null,
    },

    cancelPnL: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ walletAddress: 1, created: -1 });
orderSchema.index({ status: 1, symbol: 1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
