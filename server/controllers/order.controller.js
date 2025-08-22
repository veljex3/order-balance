const Order = require("../models/order.model");
const User = require("../models/user.model");
const Transaction = require("../models/transaction.model");
const PriceService = require("../services/price.service");

async function orderAdd(req, res) {
  try {
    const { type, symbol, price, quantity, total, status, walletAddress } =
      req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    if (
      !symbol ||
      !["BTC/USDT", "ETH/BTC", "LTC/USDT", "XRP/USDT"].includes(symbol)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing symbol",
      });
    }

    if (type === undefined || ![0, 1, 2, 3, 4, 5].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order type",
      });
    }

    if (!price || price <= 0 || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price and quantity must be positive numbers",
      });
    }

    let user = await User.findOne({ walletAddress });
    if (!user) {
      user = new User({ walletAddress });
      await user.save();
    }

    const [baseAsset, quoteAsset] = symbol.split("/");
    const isBuy = [0, 2, 4].includes(type);

    let requiredBalance, requiredAsset;
    if (isBuy) {
      requiredBalance = total || price * quantity;
      requiredAsset = quoteAsset;
    } else {
      requiredBalance = quantity;
      requiredAsset = baseAsset;
    }

    if (!user.hasBalance(requiredAsset, requiredBalance)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${requiredAsset} balance. Required: ${requiredBalance}, Available: ${user.getBalance(
          requiredAsset
        )}`,
      });
    }

    const order = new Order({
      walletAddress,
      symbol,
      type,
      price,
      quantity,
      total: total || price * quantity,
      status: status !== undefined ? status : 0,
    });

    const isMarketOrder = [2, 3].includes(type);
    const isLimitOrder = [0, 1].includes(type);

    if (isMarketOrder) {
      const currentPrice = await PriceService.getCurrentPrice(symbol);
      if (!currentPrice) {
        return res.status(500).json({
          success: false,
          message: "Unable to get current market price",
        });
      }

      const balancesBefore = { ...user.balances };

      order.status = 1;
      order.executedPrice = currentPrice;
      order.executedQuantity = quantity;
      order.completed = new Date();
      order.total = currentPrice * quantity;

      if (isBuy) {
        const actualCost = currentPrice * quantity;
        user.updateBalance(quoteAsset, -actualCost);
        user.updateBalance(baseAsset, quantity);
      } else {
        user.updateBalance(baseAsset, -quantity);
        user.updateBalance(quoteAsset, currentPrice * quantity);
      }

      await user.save();

      const transaction = Transaction.createFromOrder(
        order,
        user,
        balancesBefore,
        user.balances
      );
      await transaction.save();
    } else if (isLimitOrder) {
      order.lockedBalance = requiredBalance;
      order.lockedAsset = requiredAsset;

      user.updateBalance(requiredAsset, -requiredBalance);
      await user.save();
    }

    await order.save();

    res.json({
      success: true,
      message: isMarketOrder
        ? "Market order executed successfully"
        : "Limit order placed successfully",
      data: {
        order: {
          _id: order._id,
          symbol: order.symbol,
          type: order.type,
          price: order.price,
          quantity: order.quantity,
          total: order.total,
          status: order.status,
          executedPrice: order.executedPrice,
          executedQuantity: order.executedQuantity,
          created: order.created,
          completed: order.completed,
        },
        balances: user.balances,
      },
    });
  } catch (error) {
    console.error("Error adding order:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function orderGetHistory(req, res) {
  try {
    const { walletAddress, page = 1, size = 50 } = req.query;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required as query parameter",
      });
    }

    const pageNum = parseInt(page);
    const sizeNum = parseInt(size);
    const skip = (pageNum - 1) * sizeNum;

    const orders = await Order.find({ walletAddress })
      .sort({ created: -1 })
      .skip(skip)
      .limit(sizeNum)
      .lean();

    const totalCount = await Order.countDocuments({ walletAddress });

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      created: order.created,
      status: order.status,
      completed: order.completed,
      price: order.price,
      quantity: order.quantity,
      total: order.total,
      type: order.type,
      symbol: order.symbol,
      executedPrice: order.executedPrice,
      executedQuantity: order.executedQuantity,
    }));

    res.json({
      success: true,
      data: formattedOrders,
      pagination: {
        page: pageNum,
        size: sizeNum,
        total: totalCount,
        pages: Math.ceil(totalCount / sizeNum),
      },
    });
  } catch (error) {
    console.error("Error getting order history:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function orderCancel(req, res) {
  try {
    const { id } = req.params;
    const { walletAddress } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    const order = await Order.findOne({ _id: id, walletAddress });
    const user = await User.findOne({ walletAddress });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or does not belong to this wallet",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (order.status !== 0) {
      const statusLabels = ["Pending", "Filled", "Canceled"];
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order. Current status: ${
          statusLabels[order.status]
        }`,
      });
    }

    const currentPrice = await PriceService.getCurrentPrice(order.symbol);
    let pnl = 0;

    if (currentPrice) {
      const isLimitOrder = [0, 1].includes(order.type);

      if (isLimitOrder) {
        const isBuyLimit = order.type === 0;

        if (isBuyLimit) {
          console.log(order.quantity);
          console.log(currentPrice);
          console.log(order.price);
          console.log(order.price - currentPrice);
          pnl = (currentPrice - order.price) * order.quantity;
        } else {
          console.log(order.quantity);
          console.log(currentPrice);
          console.log(order.price);
          console.log(currentPrice - order.price);
          pnl = (order.price - currentPrice) * order.quantity;
        }

        user.updateBalance("USDT", pnl);
      }

      if (order.lockedBalance && order.lockedAsset) {
        user.updateBalance(order.lockedAsset, order.lockedBalance);
      }
    } else {
      if (order.lockedBalance && order.lockedAsset) {
        user.updateBalance(order.lockedAsset, order.lockedBalance);
      }
    }

    order.status = 2;
    order.completed = new Date();
    order.cancelPnL = pnl;

    await user.save();
    await order.save();

    if (pnl !== 0) {
      const [baseAsset, quoteAsset] = order.symbol.split("/");
      const balancesBefore = { ...user.balances };
      balancesBefore.USDT -= pnl;

      const transaction = new Transaction({
        walletAddress,
        orderId: order._id,
        symbol: order.symbol,
        type: "CANCEL",
        baseAsset,
        quoteAsset,
        baseAmount: 0,
        quoteAmount: pnl,
        price: currentPrice || order.price,
        balancesBefore: new Map(Object.entries(balancesBefore)),
        balancesAfter: new Map(Object.entries(user.balances)),
        pnl: pnl,
        notes: `Order ${order._id} canceled with P&L: ${pnl.toFixed(2)} USDT`,
      });
      await transaction.save();
    }

    res.json({
      success: true,
      message: "Order canceled successfully",
      data: {
        order: {
          _id: order._id,
          symbol: order.symbol,
          type: order.type,
          price: order.price,
          quantity: order.quantity,
          total: order.total,
          status: order.status,
          created: order.created,
          completed: order.completed,
          cancelPnL: pnl,
        },
        pnl: pnl,
        currentPrice: currentPrice,
        balances: user.balances,
      },
    });
  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

module.exports = {
  orderAdd,
  orderGetHistory,
  orderCancel,
};
