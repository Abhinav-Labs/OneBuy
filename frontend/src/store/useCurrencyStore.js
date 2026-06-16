import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const EXCHANGE_RATES = {
  USD: { rate: 1, symbol: '$' },
  EUR: { rate: 0.92, symbol: '€' },
  GBP: { rate: 0.79, symbol: '£' },
  INR: { rate: 83.50, symbol: '₹' },
};

const useCurrencyStore = create(
  persist(
    (set, get) => ({
      currency: 'USD',
      setCurrency: (currency) => set({ currency }),
      formatPrice: (priceInUSD) => {
        const { currency } = get();
        const { rate, symbol } = EXCHANGE_RATES[currency] || EXCHANGE_RATES.USD;
        const convertedPrice = priceInUSD * rate;
        
        return `${symbol}${convertedPrice.toFixed(2)}`;
      },
    }),
    {
      name: 'currency-store',
    }
  )
);

export default useCurrencyStore;
