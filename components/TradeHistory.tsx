
import React from 'react';
import { Transaction, TransactionType, AssetType, Portfolio } from '../types';
import { formatCurrency } from '../utils/calculations';

interface TradeHistoryProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  currentPortfolio: Portfolio;
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ transactions, onDelete, currentPortfolio }) => {
  const filtered = transactions.filter(tx => tx.portfolioId === currentPortfolio.id);
  const sortedTransactions = [...filtered].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">Transaction History ({currentPortfolio.name})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Asset</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Price</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Quantity</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedTransactions.length > 0 ? sortedTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(tx.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    tx.type === TransactionType.BUY ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-gray-800">{tx.symbol}</td>
                <td className="px-6 py-4 text-right">{formatCurrency(tx.price, currentPortfolio.baseCurrency)}</td>
                <td className="px-6 py-4 text-right font-medium">{tx.quantity}</td>
                <td className="px-6 py-4 text-right font-bold text-gray-800">
                  {formatCurrency(tx.price * tx.quantity + tx.fees, currentPortfolio.baseCurrency)}
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => onDelete(tx.id)} className="text-gray-300 hover:text-rose-500 transition-colors p-2">
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                  No trade history in this portfolio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeHistory;
