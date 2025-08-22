const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["BUY", "SELL", "CANCEL", "RESET"],
    },
    baseAsset: {
      type: String,
      required: true,
    },
    quoteAsset: {
      type: String,
      required: true,
    },
    baseAmount: {
      type: Number,
      required: true,
    },
    quoteAmount: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    balancesBefore: {
      type: Map,
      of: Number,
      required: true,
    },
    balancesAfter: {
      type: Map,
      of: Number,
      required: true,
    },
    pnl: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ walletAddress: 1, createdAt: -1 });
transactionSchema.index({ orderId: 1 });
transactionSchema.index({ symbol: 1, type: 1 });

transactionSchema.statics.createFromOrder = function (
  order,
  user,
  balancesBefore,
  balancesAfter,
  pnl = 0
) {
  const [baseAsset, quoteAsset] = order.symbol.split("/");

  let baseAmount, quoteAmount;
  const isBuy = [0, 2, 4].includes(order.type);

  if (isBuy) {
    baseAmount = order.executedQuantity || order.quantity;
    quoteAmount = -(order.executedPrice || order.price) * baseAmount;
  } else {
    baseAmount = -(order.executedQuantity || order.quantity);
    quoteAmount = (order.executedPrice || order.price) * Math.abs(baseAmount);
  }

  return new this({
    walletAddress: order.walletAddress,
    orderId: order._id,
    symbol: order.symbol,
    type: isBuy ? "BUY" : "SELL",
    baseAsset,
    quoteAsset,
    baseAmount,
    quoteAmount,
    price: order.executedPrice || order.price,
    balancesBefore: new Map(Object.entries(balancesBefore)),
    balancesAfter: new Map(Object.entries(balancesAfter)),
    pnl,
    notes: `Order ${order._id} executed`,
  });
};

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
