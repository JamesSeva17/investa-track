
import React, { useState } from 'react';
import { Portfolio } from '../types.ts';

interface PortfolioModalProps {
  onAdd: (name: string, currency: string) => void;
  onClose: () => void;
}

const PortfolioModal: React.FC<PortfolioModalProps> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('PHP');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAdd(name, currency);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">New Portfolio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Portfolio Name</label>
            <input
              type="text"
              placeholder="e.g. Coins.ph Crypto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Base Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900"
            >
              <option value="PHP">PHP (Philippine Peso)</option>
              <option value="USD">USD (US Dollar)</option>
            </select>
            <p className="text-[10px] text-gray-400 mt-1 italic">Note: Use PHP for apps like Coins.ph even for crypto.</p>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Create Portfolio
          </button>
        </form>
      </div>
    </div>
  );
};

export default PortfolioModal;
