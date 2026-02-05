
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Transaction, Position, AIInsight, TransactionType, AssetType, Portfolio } from './types.ts';
import { calculatePositions } from './utils/calculations.ts';
import { getMarketInsights, getAssetPrices } from './services/geminiService.ts';
import Dashboard from './components/Dashboard.tsx';
import PositionList from './components/PositionList.tsx';
import TradeHistory from './components/TradeHistory.tsx';
import TransactionForm from './components/TransactionForm.tsx';
import SyncModal from './components/SyncModal.tsx';

const DEFAULT_PLATFORMS = ['coins.ph', 'col', 'bybit', 'maya', 'all ph banks', 'gcash'];

const DEFAULT_PORTFOLIO: Portfolio = {
  id: 'main',
  name: 'Unified Portfolio',
  baseCurrency: 'PHP'
};

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('investtrack_v4_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [platforms, setPlatforms] = useState<string[]>(() => {
    const saved = localStorage.getItem('investtrack_v4_platforms');
    return saved ? JSON.parse(saved) : DEFAULT_PLATFORMS;
  });
  
  const [positions, setPositions] = useState<Position[]>([]);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'positions' | 'history'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});

  const syncAttempted = useRef(false);
  const currentPortfolio = DEFAULT_PORTFOLIO;
  const activePortfolioId = 'main';

  // Persistence
  useEffect(() => {
    localStorage.setItem('investtrack_v4_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('investtrack_v4_platforms', JSON.stringify(platforms));
  }, [platforms]);

  // Position Calculation
  useEffect(() => {
    const calculated = calculatePositions(transactions, activePortfolioId);
    
    const withPrices = calculated.map(pos => {
      const livePrice = priceMap[pos.symbol];
      if (livePrice !== undefined && pos.assetType !== AssetType.SAVING) {
        const grossValue = pos.totalQuantity * livePrice;
        let marketValue = grossValue;
        if (pos.platform === 'col' || pos.assetType === AssetType.STOCK) {
          marketValue = grossValue - (grossValue * 0.00395);
        }
        const unrealizedGain = marketValue - pos.totalInvested;
        const unrealizedGainPercent = pos.totalInvested > 0 ? (unrealizedGain / pos.totalInvested) * 100 : 0;
        return { ...pos, currentPrice: livePrice, marketValue, unrealizedGain, unrealizedGainPercent };
      }
      return pos;
    });
    
    setPositions(withPrices);
  }, [transactions, priceMap]);

  const refreshMarketData = useCallback(async (targetSymbols?: string[]) => {
    const syncablePositions = calculatePositions(transactions, activePortfolioId).filter(p => p.assetType !== AssetType.SAVING);
    const symbols = targetSymbols || Array.from(new Set(syncablePositions.map(p => p.symbol)));
    
    if (symbols.length === 0) return;
    
    setLoadingPrices(true);
    setLoadingInsights(true);
    
    try {
      const prices = await getAssetPrices(symbols, currentPortfolio.baseCurrency);
      setPriceMap(prev => ({ ...prev, ...prices }));
      
      const insight = await getMarketInsights(symbols, currentPortfolio.baseCurrency);
      setAiInsight(insight);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setLoadingPrices(false);
      setLoadingInsights(false);
    }
  }, [transactions, currentPortfolio.baseCurrency]);

  useEffect(() => {
    if (!syncAttempted.current && transactions.length > 0) {
      refreshMarketData();
      syncAttempted.current = true;
    }
  }, [transactions.length, refreshMarketData]);

  const addTransaction = (newTxData: Omit<Transaction, 'id' | 'portfolioId'>) => {
    const tx: Transaction = {
      ...newTxData,
      id: crypto.randomUUID(),
      portfolioId: activePortfolioId
    };
    setTransactions(prev => [...prev, tx]);
    if (!priceMap[tx.symbol] && tx.assetType !== AssetType.SAVING) {
      refreshMarketData([tx.symbol]);
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  const handleCloudDataLoad = (newTransactions: Transaction[], newPlatforms: string[]) => {
    setTransactions(newTransactions);
    setPlatforms(newPlatforms);
    syncAttempted.current = false; // Trigger re-sync of prices
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className="fa-solid fa-vault"></i>
          </div>
          <h1 className="text-xl font-black text-gray-800 tracking-tighter uppercase">Vaultify</h1>
        </div>

        <nav className="flex-1 space-y-1.5">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}>
            <i className="fa-solid fa-grid-2"></i> Dashboard
          </button>
          <button onClick={() => setActiveTab('positions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${activeTab === 'positions' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}>
            <i className="fa-solid fa-list-ul"></i> Portfolio
          </button>
          <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}>
            <i className="fa-solid fa-clock-rotate-left"></i> History
          </button>
        </nav>

        <div className="mt-auto space-y-3 pt-6 border-t border-gray-100">
          <button 
            onClick={() => setIsSyncOpen(true)} 
            className="w-full bg-blue-50 text-blue-600 p-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-blue-100 transition flex items-center justify-center gap-2 border border-blue-100"
          >
            <i className="fa-solid fa-cloud-arrow-up"></i> Cloud Sync
          </button>
          <button 
            onClick={() => setIsFormOpen(true)} 
            className="w-full bg-gray-900 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-black transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-plus"></i> New Transaction
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
              {activeTab === 'dashboard' && 'Market View'}
              {activeTab === 'positions' && 'Asset Allocation'}
              {activeTab === 'history' && 'Audit Log'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-black bg-blue-50 text-blue-500 px-2 py-0.5 rounded tracking-widest uppercase">{currentPortfolio.baseCurrency} Base</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => refreshMarketData()}
              disabled={loadingPrices}
              className={`flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition shadow-sm ${loadingPrices ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <i className={`fa-solid fa-arrows-rotate ${loadingPrices ? 'animate-spin' : ''}`}></i>
              {loadingPrices ? 'Syncing...' : 'Refresh Price'}
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && <Dashboard positions={positions} aiInsight={aiInsight} loading={loadingInsights} currentPortfolio={currentPortfolio} />}
        {activeTab === 'positions' && <PositionList positions={positions} currentPortfolio={currentPortfolio} />}
        {activeTab === 'history' && <TradeHistory transactions={transactions} onDelete={deleteTransaction} currentPortfolio={currentPortfolio} />}
      </main>

      {isFormOpen && (
        <TransactionForm 
          onAdd={addTransaction} 
          onClose={() => setIsFormOpen(false)} 
          platforms={platforms}
          onUpdatePlatforms={setPlatforms}
        />
      )}
      {isSyncOpen && (
        <SyncModal 
          onClose={() => setIsSyncOpen(false)} 
          transactions={transactions} 
          platforms={platforms}
          onLoadData={handleCloudDataLoad}
        />
      )}
    </div>
  );
};

export default App;
