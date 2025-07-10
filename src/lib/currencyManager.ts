import { create } from 'zustand';

interface CurrencyState {
  currency: string;
  setCurrency: (currency: string) => void;
  exchangeRates: Record<string, number>;
  formatPrice: (price: number) => string;
}

// Exchange rates (base: EUR)
const exchangeRates = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86
};

// Currency symbols
const currencySymbols = {
  EUR: '€',
  USD: '$',
  GBP: '£'
};

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currency: typeof window !== 'undefined' && window.localStorage.getItem('currency')
    ? window.localStorage.getItem('currency') as string
    : 'USD',
  exchangeRates,
  setCurrency: (currency) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('currency', currency);
    }
    set({ currency });
  },
  formatPrice: (price: number) => {
    const { currency } = get();
    const rate = exchangeRates[currency as keyof typeof exchangeRates] || 1;
    const symbol = currencySymbols[currency as keyof typeof currencySymbols] || '€';
    const convertedPrice = price * rate;
    return `${symbol}${convertedPrice.toFixed(2)}`;
  }
}));
