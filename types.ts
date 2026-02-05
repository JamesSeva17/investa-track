
export enum AssetType {
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO',
  SAVING = 'SAVING'
}

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export interface Portfolio {
  id: string;
  name: string;
  baseCurrency: string;
}

export interface Transaction {
  id: string;
  portfolioId: string;
  symbol: string;
  type: TransactionType;
  assetType: AssetType;
  platform: string;
  price: number;
  quantity: number;
  date: string;
  fees: number;
  currentBalanceSnapshot?: number;
}

export interface Position {
  symbol: string;
  assetType: AssetType;
  platform: string;
  totalQuantity: number;
  averagePrice: number;
  totalInvested: number;
  currentPrice?: number;
  marketValue?: number;
  unrealizedGain?: number;
  unrealizedGainPercent?: number;
}

export interface AIInsight {
  title: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sources: { title: string; uri: string }[];
}

export interface SyncData {
  transactions: Transaction[];
  platforms: string[];
  lastSynced: number;
}
