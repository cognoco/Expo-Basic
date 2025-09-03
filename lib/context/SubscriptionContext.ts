import { createContext } from 'react';

export interface SubscriptionContextValue {
  isPremium: boolean;
  checkPremiumStatus: () => Promise<void> | void;
}

export const SubscriptionContext = createContext<SubscriptionContextValue>({
  isPremium: false,
  checkPremiumStatus: () => {},
});
