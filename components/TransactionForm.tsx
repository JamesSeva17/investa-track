
import React, { useState } from 'react';
import { Transaction, TransactionType, AssetType } from '../types';

interface TransactionFormProps {
  onAdd: (tx: Omit<Transaction, 'id' | 'portfolioId'>) => void;
  onClose: () => void;
  platforms: string[];
  onUpdatePlatforms: (platforms: string[]) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onClose, platforms, onUpdatePlatforms }) => {
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.BUY);
  const [assetType, setAssetType] = useState<AssetType>(AssetType.STOCK);
  const [platform, setPlatform] = useState(platforms[0] || 'col');
  const [newPlatform, setNewPlatform] = useState('');
  const [isAddingPlatform, setIsAddingPlatform] = useState(false);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [fees, setFees] = useState('0');
  const [balanceSnapshot, setBalanceSnapshot] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !price || (!quantity && assetType !== AssetType.SAVING)) return;

    onAdd({
      symbol: symbol.toUpperCase(),
      type,
      assetType,
      platform,
      price: parseFloat(price),
      quantity: assetType === AssetType.SAVING ? 1 : parseFloat(quantity),
      fees: parseFloat(fees),
      date,
      currentBalanceSnapshot: assetType === AssetType.SAVING && balanceSnapshot ? parseFloat(balanceSnapshot) : undefined
    });
    onClose();
  };

  const handleAddPlatform = () => {
    if (newPlatform && !platforms.includes(newPlatform.toLowerCase())) {
      const updated = [...platforms, newPlatform.toLowerCase()];
      onUpdatePlatforms(updated);
      setPlatform(newPlatform.toLowerCase());
      setNewPlatform('');
      setIsAddingPlatform(false);
    }
  };

  const isSaving = assetType === AssetType.SAVING;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Log Transaction</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Entry Log</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition text-gray-400">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType(TransactionType.BUY)}
              className={`flex-1 py-2.5 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all ${type === TransactionType.BUY ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
            >
              {isSaving ? 'Deposit / Add' : 'Purchase / Buy'}
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.SELL)}
              className={`flex-1 py-2.5 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all ${type === TransactionType.SELL ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-400'}`}
            >
              {isSaving ? 'Withdraw' : 'Sell / Dispose'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Platform</label>
              <div className="space-y-2">
                {!isAddingPlatform ? (
                  <div className="flex gap-2">
                    <select 
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition text-sm text-gray-900 font-bold"
                    >
                      {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button 
                      type="button"
                      onClick={() => setIsAddingPlatform(true)}
                      className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-200 transition"
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="New platform..."
                      value={newPlatform}
                      onChange={(e) => setNewPlatform(e.target.value)}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition text-sm text-gray-900 font-bold"
                      autoFocus
                    />
                    <button 
                      type="button"
                      onClick={handleAddPlatform}
                      className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition"
                    >
                      <i className="fa-solid fa-check"></i>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsAddingPlatform(false)}
                      className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-200 transition"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Asset Type</label>
              <select 
                value={assetType}
                onChange={(e) => setAssetType(e.target.value as AssetType)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition text-sm text-gray-900 font-bold"
              >
                <option value={AssetType.STOCK}>Philippine Stock</option>
                <option value={AssetType.CRYPTO}>Crypto</option>
                <option value={AssetType.SAVING}>Savings / Bank</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
              {isSaving ? 'Account Name / Bank' : 'Symbol (BTC, ETH, SM, BDO)'}
            </label>
            <input
              type="text"
              placeholder={isSaving ? "e.g. Maya Savings" : "Enter ticker"}
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition text-sm text-gray-900 font-bold placeholder-gray-300"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                {isSaving ? 'Amount' : 'Purchase Price'}
              </label>
              <input
                type="number"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition text-sm text-gray-900 font-bold"
                required
              />
            </div>
            {!isSaving && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Quantity</label>
                <input
                  type="number"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition text-sm text-gray-900 font-bold"
                  required
                />
              </div>
            )}
            {isSaving && (
              <div>
                <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5 ml-1">Current Balance</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Snapshot balance"
                  value={balanceSnapshot}
                  onChange={(e) => setBalanceSnapshot(e.target.value)}
                  className="w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition text-sm text-gray-900 font-bold placeholder-blue-200"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition text-sm text-gray-900 font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Fees</label>
              <input
                type="number"
                step="any"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition text-sm text-gray-900 font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] mt-4 hover:bg-black transition-all shadow-xl shadow-gray-200"
          >
            Log Transaction
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
