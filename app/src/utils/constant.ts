import { ISymbol } from "../types/global/symbol.type";

const symbols: ISymbol[] = [
  {
    coinA: "BTC",
    coinB: "USDT",
    symbol: "BTC/USDT",
  },
  {
    coinA: "ETH",
    coinB: "BTC",
    symbol: "ETH/BTC",
  },
  {
    coinA: "LTC",
    coinB: "USDT",
    symbol: "LTC/USDT",
  },
  {
    coinA: "XRP",
    coinB: "USDT",
    symbol: "XRP/USDT",
  },
];

const colorVariants = {
  blue: "bg-blue-600 hover:bg-blue-500",
  red: "bg-red-600 hover:bg-red-500",
  yellow: "bg-yellow-600 hover:bg-yellow-500",
  green: "bg-green-600 hover:bg-green-500",
};

export { symbols, colorVariants };
