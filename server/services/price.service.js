const axios = require("axios");

class PriceService {
  static priceCache = new Map();
  static cacheExpiry = 30000;

  static async getCurrentPrice(symbol) {
    try {
      const binanceSymbol = symbol.replace("/", "").toUpperCase();

      const cacheKey = binanceSymbol;
      const cached = this.priceCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.price;
      }

      const response = await axios.get(
        `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`,
        { timeout: 5000 }
      );

      const price = parseFloat(response.data.price);

      this.priceCache.set(cacheKey, {
        price,
        timestamp: Date.now(),
      });

      return price;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error.message);

      const cached = this.priceCache.get(symbol.replace("/", "").toUpperCase());
      return cached ? cached.price : null;
    }
  }
}

module.exports = PriceService;
