# Order Balance - Demo Trading Platform

A full-stack demo trading application with real-time order management, balance tracking, and P&L calculations. Built with React/TypeScript frontend and Node.js/Express backend.

## 🚀 What Was Built

This project started as a basic trading app concept and evolved into a comprehensive trading platform with advanced features:

### **Phase 1: Backend Foundation**

- **Complete Trading Engine**: Built from scratch with market/limit order processing
- **MongoDB Integration**: Proper schemas for Orders, Users, and Transactions
- **Balance Management**: Real-time balance updates with validation
- **P&L Calculations**: Automatic profit/loss tracking for all trades
- **RESTful API**: Comprehensive endpoints for all trading operations

### **Phase 2: Advanced Order System**

- **Limit Orders with Balance Locking**: Orders lock funds immediately when placed
- **Market Orders**: Execute instantly at current market prices
- **Order Cancellation with P&L**: Smart P&L calculation when canceling orders
- **Real-time Price Integration**: Live prices from Binance API
- **Transaction Logging**: Complete audit trail for all operations

### **Phase 3: Frontend Integration**

- **MetaMask Wallet Connection**: Seamless wallet integration
- **Real-time Balance Updates**: Balances update instantly after trades
- **Order History**: Complete trading history with status tracking
- **Live Order Book**: Real-time market data from Binance
- **Trading Charts**: Integrated TradingView charts

## 🏗️ Architecture

```
Frontend (React/TypeScript)     Backend (Node.js/Express)     External APIs
├── Wallet Connection          ├── Order Controller           ├── Binance API
├── Trading Interface          ├── User Controller            └── Price Service
├── Order Management           ├── Balance Management
├── Real-time Updates          ├── P&L Calculations          Database (MongoDB)
└── Market Data Display        └── Transaction Logging        ├── Orders Collection
                                                             ├── Users Collection
                                                             └── Transactions Collection
```

## 💡 Key Features Implemented

### **Smart Order Management**

- **Buy Limit**: Place orders below market price, funds locked until execution/cancellation
- **Sell Limit**: Place orders above market price, crypto locked until execution/cancellation
- **Market Orders**: Instant execution at current market prices
- **Order Cancellation**: Calculate P&L based on current vs order price

### **P&L Calculation Logic**

When canceling limit orders, the system calculates what you gained or lost:

**Buy Limit Cancellation:**

- Current price < Order price = **Positive P&L** (saved money)
- Current price > Order price = **Negative P&L** (missed opportunity)

**Sell Limit Cancellation:**

- Current price > Order price = **Negative P&L** (missed profit)
- Current price < Order price = **Positive P&L** (avoided loss)

### **Real-time Balance System**

- Balances update immediately when orders are placed (funds locked)
- Balances update when orders execute (assets exchanged)
- Balances update when orders are canceled (P&L applied + funds unlocked)
- All balance changes are logged for audit purposes

## 🛠️ Technical Implementation

### **Backend Stack**

- **Node.js + Express**: RESTful API server
- **MongoDB + Mongoose**: Database with proper schemas and validation
- **Axios**: External API integration for real-time prices
- **CORS**: Cross-origin resource sharing for frontend integration

### **Frontend Stack**

- **React + TypeScript**: Modern frontend with type safety
- **Redux**: State management for trading data
- **Web3.js**: MetaMask wallet integration
- **TradingView**: Professional trading charts
- **React-Toastify**: User notifications

### **Key Services**

- **Price Service**: Real-time price fetching with caching
- **Market Service**: Order execution and P&L calculations
- **User Service**: Balance management and user operations
- **Transaction Service**: Complete audit logging

## 📁 Project Structure

```
order-balance/
├── app/                          # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── custom/           # Trading-specific components
│   │   │   ├── shared/           # Reusable UI components
│   │   │   └── wallet-connect/   # MetaMask integration
│   │   ├── api/                  # Backend API integration
│   │   ├── types/                # TypeScript definitions
│   │   └── utils/                # Helper functions
│   └── package.json
├── server/                       # Backend Node.js application
│   ├── controllers/              # API route handlers
│   ├── models/                   # MongoDB schemas
│   ├── routes/                   # API route definitions
│   ├── services/                 # Business logic services
│   ├── database/                 # Database connection
│   └── package.json
└── README.MD                     # This documentation
```

## 🚦 API Endpoints

### **Order Management**

- `POST /api/orders` - Place new order (market/limit)
- `GET /api/orders/history` - Get order history
- `DELETE /api/orders/:id` - Cancel order (with P&L calculation)

### **User Management**

- `POST /api/user/create` - Create/get user
- `GET /api/user/balance/:address` - Get user balances
- `POST /api/user/balance/update/:address` - Update balances
- `POST /api/user/balance/reset/:address` - Reset to demo balances

## 🎯 How It Works

### **Placing a Limit Order**

1. User connects MetaMask wallet
2. User sets price and quantity for limit order
3. System validates sufficient balance
4. Funds are immediately locked (USDT for buy, crypto for sell)
5. Order status set to "Pending"
6. Balance display updates to show locked funds

### **Canceling a Limit Order**

1. User clicks cancel on pending order
2. System fetches current market price
3. P&L calculated: (current_price - order_price) × quantity
4. P&L applied to USDT balance
5. Original locked funds returned
6. Order status set to "Canceled"
7. User sees updated balance with P&L

### **Market Order Execution**

1. User places market order
2. System fetches current market price
3. Order executes immediately at market price
4. Balances updated instantly (crypto ↔ USDT)
5. Transaction logged for audit
6. Order status set to "Filled"

## 🔧 Setup & Installation

### **Backend Setup**

```bash
cd server
npm install
# Configure .env with MongoDB connection
npm start  # Runs on port 5000
```

### **Frontend Setup**

```bash
cd app
npm install
npm run dev  # Runs on port 8081
```

### **Requirements**

- Node.js 16+
- MongoDB database
- MetaMask browser extension
- Internet connection (for real-time prices)

## 🎮 Usage

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **View Balances**: See your demo balances in the wallet panel
3. **Place Orders**: Use the trading interface to place buy/sell orders
4. **Monitor Orders**: Check order history and status
5. **Cancel Orders**: Cancel pending orders to see P&L calculation
6. **Track Balance**: Watch balances update in real-time

## 🏆 Achievement Summary

✅ **Complete Trading Engine** - From concept to working platform  
✅ **Smart Balance Management** - Real-time locking and P&L  
✅ **Professional UI** - Trading-grade interface  
✅ **Wallet Integration** - Seamless MetaMask connection  
✅ **Real-time Data** - Live prices and order book  
✅ **Audit Trail** - Complete transaction logging  
✅ **P&L Calculations** - Smart profit/loss tracking

This project demonstrates a complete understanding of trading systems, from order management to balance calculations, with a professional-grade implementation.
