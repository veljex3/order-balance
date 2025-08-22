const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    balances: {
      BTC: {
        type: Number,
        default: 1.0,
        min: 0,
      },
      ETH: {
        type: Number,
        default: 10.0,
        min: 0,
      },
      LTC: {
        type: Number,
        default: 50.0,
        min: 0,
      },
      XRP: {
        type: Number,
        default: 1000.0,
        min: 0,
      },
      USDT: {
        type: Number,
        default: 1000000.0,
        min: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getBalance = function (symbol) {
  return this.balances[symbol] || 0;
};

userSchema.methods.updateBalance = function (symbol, amount) {
  if (!this.balances[symbol] && this.balances[symbol] !== 0) {
    this.balances[symbol] = 0;
  }
  this.balances[symbol] += amount;
  return this.balances[symbol];
};

userSchema.methods.hasBalance = function (symbol, amount) {
  return this.getBalance(symbol) >= amount;
};

userSchema.methods.resetBalances = function () {
  this.balances = {
    BTC: 1.0,
    ETH: 10.0,
    LTC: 50.0,
    XRP: 1000.0,
    USDT: 10000.0,
  };
};

const User = mongoose.model("User", userSchema);

module.exports = User;
