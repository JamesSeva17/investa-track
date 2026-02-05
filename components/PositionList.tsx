
import React, { useState } from 'react';
import { Position, AssetType, Portfolio } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';

interface PositionListProps {
  positions: any[]; 
  currentPortfolio: Portfolio;
}

const AssetIcon: React.FC<{ symbol: string; type: AssetType }> = ({ symbol, type }) => {
  const [error, setError] = useState(false);
  
  const cryptoSrc = `https://coinicons-api.vercel.app/api/icon/${symbol.toLowerCase()}`;
  const stockSrc = `https://ui-avatars.com/api/?name=${symbol}&background=random&color=fff&font-size=0.45&bold=true&rounded=true`;
  
  const iconSrc = type === AssetType.CRYPTO ? cryptoSrc : stockSrc;

  if (error || !symbol) {
    return (
      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase border border-gray-100 shadow-sm">
        {symbol.slice(0, 2)}
      </div>
    );
  }

  return (
    <div className="relative w-12 h-12 shrink-0">
      <img 
        src={iconSrc} 
        alt={symbol} 
        className="w-full h-full rounded-full object-cover shadow-sm bg-white border border-gray-50"
        onError={() => setError(true)}
      />
    </div>
  );
};

const PositionList: React.FC<PositionListProps> = ({ positions, currentPortfolio }) => {
  const [collapsedPlatforms, setCollapsedPlatforms] = useState<Record<string, boolean>>({});

  const togglePlatform = (platform: string) => {
    setCollapsedPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const grouped = positions.reduce((acc, pos) => {
    if (!acc[pos.platform]) acc[pos.platform] = [];
    acc[pos.platform].push(pos);
    return acc;
  }, {} as Record<string, any[]>);

  const platforms = Object.keys(grouped).sort();

  if (platforms.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 md:p-20 text-center border-2 border-dashed border-gray-100 flex flex-col items-center">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 text-3xl md:text-4xl mb-6">
          <i className="fa-solid fa-magnifying-glass-chart"></i>
        </div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] md:text-xs">No assets recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-20">
      {platforms.map(platform => {
        const isCollapsed = collapsedPlatforms[platform];
        // Total Capital = Total invested amount (quantity * price, excluding buy/sell fees)
        const platformTotalCapital = grouped[platform].reduce((sum, p) => sum + p.totalInvested, 0);
        
        return (
          <div key={platform} className="space-y-3">
            {/* Platform Header: Clean naming (no PORTFOLIO suffix) */}
            <div 
              onClick={() => togglePlatform(platform)}
              className="flex justify-between items-end px-2 cursor-pointer select-none group"
            >
              <div className="flex flex-col">
                <h4 className="font-black text-gray-900 uppercase tracking-tighter text-sm flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                  <i className={`fa-solid fa-chevron-${isCollapsed ? 'right' : 'down'} text-[10px] text-gray-300 transition-transform`}></i>
                  {platform}
                </h4>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">
                   {grouped[platform].length} Active Holdings
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-900 tracking-tight leading-none">
                  {formatCurrency(platformTotalCapital, currentPortfolio.baseCurrency)}
                </p>
                <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Capital</p>
              </div>
            </div>

            {!isCollapsed && (
              <div className="grid grid-cols-1 gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                {grouped[platform].map((pos) => {
                  const marketVal = pos.marketValue || (pos.totalQuantity * (pos.currentPrice || pos.averagePrice));
                  
                  return (
                    <div 
                      key={`${pos.platform}_${pos.symbol}`} 
                      className="bg-white px-5 py-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <AssetIcon symbol={pos.symbol} type={pos.assetType} />
                        <div className="flex flex-col">
                          <h3 className="font-black text-gray-900 text-[15px] leading-none tracking-tight uppercase">
                            {pos.symbol} <span className="text-gray-300 text-[10px] font-bold uppercase">({pos.symbol})</span>
                          </h3>
                          <div className="flex flex-col gap-0.5 mt-1.5">
                            <p className="text-[11px] font-bold text-gray-500 leading-none">
                              {pos.totalQuantity.toLocaleString()} Units
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[8px] font-black bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded border border-gray-100 uppercase tracking-widest">
                                Ave: {formatCurrency(pos.averagePrice, currentPortfolio.baseCurrency, 4)}
                              </span>
                              <span className="text-[8px] font-black bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-widest">
                                Cur: {pos.currentPrice ? formatCurrency(pos.currentPrice, currentPortfolio.baseCurrency, 4) : '---'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <p className="text-base font-black text-gray-900 tracking-tight leading-none">
                          {formatCurrency(marketVal, currentPortfolio.baseCurrency)}
                        </p>
                        <div className="mt-2">
                          {pos.unrealizedGainPercent !== undefined ? (
                            <p className={`text-[13px] font-bold leading-none ${pos.unrealizedGainPercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {formatPercent(pos.unrealizedGainPercent)}
                            </p>
                          ) : (
                            <p className="text-[9px] font-black text-gray-300 uppercase italic">Updating</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PositionList;
