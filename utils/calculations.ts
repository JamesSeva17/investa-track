
import { Transaction, Position, TransactionType, AssetType } from "../types";

export interface PositionWithGrowth extends Position {
  previousMonthBalance?: number;
  monthlyGain?: number;
  monthlyGainPercent?: number;
  grossMarketValue?: number;
  sellingFees?: number;
}

/**
 * Calculates positions using High-Precision Weighted Average Cost (WAC).
 * 
 * UPDATE: Following user request to exclude fees from capital calculations.
 * totalInvested now purely represents (quantity * purchase_price).
 */
export const calculatePositions = (transactions: Transaction[], portfolioId: string): PositionWithGrowth[] => {
  const positionMap: Record<string, PositionWithGrowth> = {};
  
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Sort by date to ensure calculations are chronological
  const filtered = transactions
    .filter(tx => tx.portfolioId === portfolioId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  filtered.forEach((tx) => {
    const key = `${tx.symbol}_${tx.platform}`;
    
    if (!positionMap[key]) {
      positionMap[key] = {
        symbol: tx.symbol,
        assetType: tx.assetType,
        platform: tx.platform,
        totalQuantity: 0,
        averagePrice: 0,
        totalInvested: 0,
      };
    }

    const pos = positionMap[key];
    const txDate = new Date(tx.date);

    if (tx.type === TransactionType.BUY) {
      // EXCLUDING FEES from capital as requested
      const purchaseOutlay = (tx.price * tx.quantity); 
      pos.totalInvested += purchaseOutlay;
      pos.totalQuantity += tx.quantity;
      // Derive precision Average Price
      pos.averagePrice = pos.totalQuantity > 0 ? pos.totalInvested / pos.totalQuantity : 0;
    } else {
      // SELL logic: Reduce holdings proportionally to the current cost basis
      if (pos.totalQuantity > 0) {
        const ratio = tx.quantity / pos.totalQuantity;
        pos.totalInvested -= (pos.totalInvested * ratio);
        pos.totalQuantity -= tx.quantity;
        pos.averagePrice = pos.totalQuantity > 0 ? pos.totalInvested / pos.totalQuantity : 0;
      }
      
      if (pos.totalQuantity <= 0) {
        pos.totalQuantity = 0;
        pos.averagePrice = 0;
        pos.totalInvested = 0;
      }
    }

    // Savings logic
    if (tx.assetType === AssetType.SAVING) {
      if (tx.currentBalanceSnapshot !== undefined) {
        if (txDate < startOfThisMonth) {
          pos.previousMonthBalance = tx.currentBalanceSnapshot;
        }
        pos.currentPrice = tx.currentBalanceSnapshot;
      }
    }
  });

  return Object.values(positionMap)
    .filter(p => p.totalQuantity > 0)
    .map(pos => {
      if (pos.currentPrice !== undefined) {
        if (pos.assetType === AssetType.SAVING) {
          pos.marketValue = pos.currentPrice;
          pos.unrealizedGain = pos.marketValue - pos.totalInvested;
        } else {
          const grossValue = pos.totalQuantity * pos.currentPrice;
          pos.grossMarketValue = grossValue;

          // SPECIAL COL FINANCIAL CALCULATION (Net Paper Gain)
          // Matching 'col' to the default platform list
          if (pos.platform.toLowerCase() === 'col' || pos.assetType === AssetType.STOCK) {
            const estimatedExitFees = grossValue * 0.00395;
            pos.sellingFees = estimatedExitFees;
            pos.marketValue = grossValue - estimatedExitFees;
          } else {
            pos.marketValue = grossValue;
          }
          
          pos.unrealizedGain = pos.marketValue - pos.totalInvested;
        }

        pos.unrealizedGainPercent = pos.totalInvested > 0 ? (pos.unrealizedGain / pos.totalInvested) * 100 : 0;
        
        if (pos.assetType === AssetType.SAVING && pos.previousMonthBalance !== undefined) {
          pos.monthlyGain = pos.marketValue - pos.previousMonthBalance;
          pos.monthlyGainPercent = pos.previousMonthBalance > 0 ? (pos.monthlyGain / pos.previousMonthBalance) * 100 : 0;
        }
      }
      return pos;
    });
};

export const formatCurrency = (value: number, currencyCode: string, precision: number = 2) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
};

export const formatPercent = (value: number) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};
