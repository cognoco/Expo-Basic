import { getStorageItem, setStorageItem } from '@utils/core/storage';

export type RewardTransaction = {
  id: string;
  amount: number; // positive for earn, negative for spend
  reason: string;
  timestamp: number; // ms since epoch
};

export type RewardItem = {
  id: string;
  name: string;
  description?: string;
  cost: number; // tokens required
};

export type RedemptionRecord = {
  id: string;
  itemId: string;
  cost: number;
  timestamp: number;
};

const BALANCE_KEY = 'rewards:balance';
const TX_KEY = 'rewards:transactions';
const REDEMPTIONS_KEY = 'rewards:redemptions';

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export async function getBalance(): Promise<number> {
  const raw = await getStorageItem(BALANCE_KEY);
  const parsed = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

async function setBalance(value: number): Promise<void> {
  await setStorageItem(BALANCE_KEY, String(Math.max(0, Math.floor(value))));
}

async function getTransactions(): Promise<RewardTransaction[]> {
  try {
    const raw = await getStorageItem(TX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RewardTransaction[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

async function setTransactions(list: RewardTransaction[]): Promise<void> {
  await setStorageItem(TX_KEY, JSON.stringify(list));
}

async function getRedemptions(): Promise<RedemptionRecord[]> {
  try {
    const raw = await getStorageItem(REDEMPTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RedemptionRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

async function setRedemptions(list: RedemptionRecord[]): Promise<void> {
  await setStorageItem(REDEMPTIONS_KEY, JSON.stringify(list));
}

// Public API

export async function addTokens(amount: number, reason: string = 'Reward'): Promise<number> {
  if (!Number.isFinite(amount) || amount <= 0) return getBalance();
  const [bal, txs] = await Promise.all([getBalance(), getTransactions()]);
  const newBal = bal + Math.floor(amount);
  const tx: RewardTransaction = {
    id: generateId('earn'),
    amount: Math.floor(amount),
    reason,
    timestamp: Date.now(),
  };
  await Promise.all([setBalance(newBal), setTransactions([tx, ...txs].slice(0, 500))]);
  return newBal;
}

export async function spendTokens(amount: number, reason: string): Promise<{ success: boolean; balance: number; error?: string }>{
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, balance: await getBalance(), error: 'Invalid amount' };
  }
  const [bal, txs] = await Promise.all([getBalance(), getTransactions()]);
  if (bal < amount) {
    return { success: false, balance: bal, error: 'Insufficient balance' };
  }
  const newBal = bal - Math.floor(amount);
  const tx: RewardTransaction = {
    id: generateId('spend'),
    amount: -Math.floor(amount),
    reason,
    timestamp: Date.now(),
  };
  await Promise.all([setBalance(newBal), setTransactions([tx, ...txs].slice(0, 500))]);
  return { success: true, balance: newBal };
}

export function getRewardsCatalog(): RewardItem[] {
  // Static catalog for now; in future this can be remote-configured
  return [
    { id: 'confetti', name: 'Confetti Burst', description: 'Celebrate a win with confetti!', cost: 20 },
    { id: 'sticker_pack', name: 'Sticker Pack', description: 'Unlock fun study stickers!', cost: 50 },
    { id: 'buddy_hat', name: 'Buddy Hat', description: 'A stylish hat for your buddy', cost: 75 },
  ];
}

export async function redeemTokens(itemId: string): Promise<{ success: boolean; balance: number; record?: RedemptionRecord; error?: string }>{
  const catalog = getRewardsCatalog();
  const item = catalog.find(i => i.id === itemId);
  if (!item) {
    return { success: false, balance: await getBalance(), error: 'Item not found' };
  }
  const spend = await spendTokens(item.cost, `Redeem: ${item.name}`);
  if (!spend.success) {
    return { success: false, balance: spend.balance, error: spend.error };
  }
  const record: RedemptionRecord = {
    id: generateId('redeem'),
    itemId: item.id,
    cost: item.cost,
    timestamp: Date.now(),
  };
  const history = await getRedemptions();
  await setRedemptions([record, ...history].slice(0, 500));
  return { success: true, balance: spend.balance, record };
}

export async function logRedemption(record: RedemptionRecord): Promise<void> {
  const history = await getRedemptions();
  await setRedemptions([record, ...history].slice(0, 500));
}

export async function getRedemptionHistory(): Promise<RedemptionRecord[]> {
  return getRedemptions();
}

export async function getTransactionsHistory(): Promise<RewardTransaction[]> {
  return getTransactions();
}
