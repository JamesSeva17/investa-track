
import React, { useState } from 'react';
import { Transaction, SyncData } from '../types.ts';
import { syncService } from '../services/syncService.ts';

interface SyncModalProps {
  onClose: () => void;
  transactions: Transaction[];
  platforms: string[];
  onLoadData: (transactions: Transaction[], platforms: string[]) => void;
}

const SyncModal: React.FC<SyncModalProps> = ({ onClose, transactions, platforms, onLoadData }) => {
  const [syncCode, setSyncCode] = useState(localStorage.getItem('investtrack_sync_code') || '');
  const [inputCode, setInputCode] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  const handlePush = async () => {
    setStatus({ type: 'loading', message: syncCode ? 'Updating cloud...' : 'Creating backup...' });
    
    const data: SyncData = {
      transactions,
      platforms,
      lastSynced: Date.now()
    };

    try {
      const newKey = await syncService.push(syncCode, data);
      
      if (newKey) {
        setSyncCode(newKey);
        localStorage.setItem('investtrack_sync_code', newKey);
        setStatus({ type: 'success', message: 'Data pushed successfully!' });
      } else {
        setStatus({ type: 'error', message: 'Sync failed. Please try again.' });
      }
    } catch (e) {
      setStatus({ type: 'error', message: 'Failed to push data.' });
    }
  };

  const handlePull = async () => {
    const codeToUse = inputCode || syncCode;
    if (!codeToUse) {
      setStatus({ type: 'error', message: 'Enter a Sync Code.' });
      return;
    }
    setStatus({ type: 'loading', message: 'Pulling from cloud...' });
    
    try {
      const data = await syncService.pull(codeToUse);
      if (!data) {
        throw new Error('Code not found or invalid.');
      }
      
      onLoadData(data.transactions, data.platforms);
      setSyncCode(codeToUse);
      localStorage.setItem('investtrack_sync_code', codeToUse);
      
      setStatus({ type: 'success', message: 'Cloud data restored!' });
    } catch (e: any) {
      setStatus({ type: 'error', message: e.message || 'Failed to pull data.' });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(syncCode);
    setStatus({ type: 'success', message: 'Code copied!' });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Cloud Sync</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Multi-device Continuity</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition text-gray-400">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Device Sync Code</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-4 flex items-center justify-between min-h-[56px]">
                <span className="font-mono font-black text-sm text-gray-800 tracking-wider break-all pr-2">
                  {syncCode || 'NOT BACKED UP'}
                </span>
                {syncCode && (
                  <button onClick={copyToClipboard} className="text-blue-500 hover:text-blue-600 p-2">
                    <i className="fa-solid fa-copy"></i>
                  </button>
                )}
              </div>
            </div>
            
            <button 
              onClick={handlePush}
              disabled={status.type === 'loading'}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-blue-700 transition shadow-xl shadow-blue-100 disabled:opacity-50"
            >
              {syncCode ? 'Update Cloud Backup' : 'Create First Backup'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-[10px]"><span className="bg-white px-4 text-gray-300 font-black uppercase tracking-widest">OR RESTORE FROM CODE</span></div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter Bin ID..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition text-sm text-gray-900 font-black placeholder-gray-300"
            />
            <button 
              onClick={handlePull}
              disabled={status.type === 'loading'}
              className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-gray-200 transition disabled:opacity-50"
            >
              Restore from Cloud
            </button>
          </div>

          {status.message && (
            <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 
              status.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
            }`}>
              {status.type === 'loading' && <i className="fa-solid fa-spinner animate-spin mr-2"></i>}
              {status.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncModal;
