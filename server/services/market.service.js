const Order = require("../models/order.model");
const User = require("../models/user.model");
const Transaction = require("../models/transaction.model");

class MarketService {
  static async checkAndExecuteLimitOrders(symbol, currentPrice) {
    try {
      const pendingOrders = await Order.find({
        symbol,
        status: 0,
        type: { $in: [0, 1] },
      });

      const executedOrders = [];

      for (const order of pendingOrders) {
        let shouldExecute = false;

        if (order.type === 0) {
          shouldExecute = currentPrice <= order.price;
        } else if (order.type === 1) {
          shouldExecute = currentPrice >= order.price;
        }

        if (shouldExecute) {
          const executed = await this.executeLimitOrder(order, currentPrice);
          if (executed) {
            executedOrders.push(executed);
          }
        }
      }

      return executedOrders;
    } catch (error) {
      console.error("Error checking limit orders:", error);
      return [];
    }
  }

  static async executeLimitOrder(order, executionPrice) {
    try {
      const user = await User.findOne({ walletAddress: order.walletAddress });
      if (!user) {
        console.error(`User not found for order ${order._id}`);
        return null;
      }

      const [baseAsset, quoteAsset] = order.symbol.split("/");
      const isBuy = order.type === 0;

      let requiredBalance, requiredAsset;
      if (isBuy) {
        requiredBalance = executionPrice * order.quantity;
        requiredAsset = quoteAsset;
      } else {
        requiredBalance = order.quantity;
        requiredAsset = baseAsset;
      }

      if (!user.hasBalance(requiredAsset, requiredBalance)) {
        console.log(
          `Insufficient balance for order ${order._id}, skipping execution`
        );
        return null;
      }

      const balancesBefore = { ...user.balances };

      order.status = 1;
      order.executedPrice = executionPrice;
      order.executedQuantity = order.quantity;
      order.completed = new Date();

      if (isBuy) {
        user.updateBalance(quoteAsset, -requiredBalance);
        user.updateBalance(baseAsset, order.quantity);
      } else {
        user.updateBalance(baseAsset, -order.quantity);
        user.updateBalance(quoteAsset, executionPrice * order.quantity);
      }

      await user.save();
      await order.save();

      const transaction = Transaction.createFromOrder(
        order,
        user,
        balancesBefore,
        user.balances
      );
      await transaction.save();

      console.log(
        `Executed limit order ${order._id} at price ${executionPrice}`
      );
      return order;
    } catch (error) {
      console.error(`Error executing limit order ${order._id}:`, error);
      return null;
    }
  }

  static async calculateUserPnL(walletAddress, symbol = null) {
    try {
      const filter = { walletAddress };
      if (symbol) {
        filter.symbol = symbol;
      }

      const transactions = await Transaction.find(filter)
        .sort({ createdAt: 1 })
        .lean();

      let totalPnL = 0;
      const positions = {};

      for (const tx of transactions) {
        if (tx.type === "RESET") continue;

        const symbol = tx.symbol;
        if (!positions[symbol]) {
          positions[symbol] = {
            quantity: 0,
            totalCost: 0,
            realizedPnL: 0,
          };
        }

        const position = positions[symbol];

        if (tx.type === "BUY") {
          position.totalCost += Math.abs(tx.quoteAmount);
          position.quantity += tx.baseAmount;
        } else if (tx.type === "SELL") {
          const soldQuantity = Math.abs(tx.baseAmount);
          const avgCostPerUnit =
            position.quantity > 0 ? position.totalCost / position.quantity : 0;
          const costOfSold = avgCostPerUnit * soldQuantity;
          const proceeds = tx.quoteAmount;
          const realizedPnL = proceeds - costOfSold;

          position.realizedPnL += realizedPnL;
          position.quantity -= soldQuantity;
          position.totalCost -= costOfSold;

          if (position.quantity <= 0) {
            position.quantity = 0;
            position.totalCost = 0;
          }
        }

        totalPnL += position.realizedPnL;
      }

      return {
        totalPnL,
        positions,
        transactions: transactions.length,
      };
    } catch (error) {
      console.error("Error calculating P&L:", error);
      return { totalPnL: 0, positions: {}, transactions: 0 };
    }
  }

  static async getTradingStats(walletAddress) {
    try {
      const orders = await Order.find({ walletAddress }).lean();
      const transactions = await Transaction.find({ walletAddress }).lean();

      const stats = {
        totalOrders: orders.length,
        filledOrders: orders.filter((o) => o.status === 1).length,
        canceledOrders: orders.filter((o) => o.status === 2).length,
        pendingOrders: orders.filter((o) => o.status === 0).length,
        totalVolume: 0,
        symbolBreakdown: {},
      };

      for (const order of orders) {
        if (order.status === 1) {
          stats.totalVolume += order.total;

          if (!stats.symbolBreakdown[order.symbol]) {
            stats.symbolBreakdown[order.symbol] = {
              orders: 0,
              volume: 0,
            };
          }

          stats.symbolBreakdown[order.symbol].orders++;
          stats.symbolBreakdown[order.symbol].volume += order.total;
        }
      }

      const pnlData = await this.calculateUserPnL(walletAddress);
      stats.totalPnL = pnlData.totalPnL;
      stats.positions = pnlData.positions;

      return stats;
    } catch (error) {
      console.error("Error getting trading stats:", error);
      return null;
    }
  }
}

module.exports = MarketService;
