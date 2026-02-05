import React from 'react';
import { Position, AIInsight, AssetType, Portfolio } from '../types.ts';
import { formatCurrency, formatPercent } from '../utils/calculations.ts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  positions: Position[];
  aiInsight: AIInsight | null;
  loading: boolean;
  currentPortfolio: Portfolio;
}

const Dashboard: React.FC<DashboardProps> = ({ positions, aiInsight, loading, currentPortfolio }) => {
  const totalMarketValue = positions.reduce((acc, curr) => acc + (curr.marketValue || curr.totalInvested), 0);
  const totalInvested = positions.reduce((acc, curr) => acc + curr.totalInvested, 0);
  const totalGain = totalMarketValue - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  const savingsPosition = positions.filter(p => p.assetType === AssetType.SAVING);
  const savingsTotal = savingsPosition.reduce((acc, curr) => acc + (curr.marketValue || curr.totalInvested), 0);
  const savingsCapital = savingsPosition.reduce((acc, curr) => acc + curr.totalInvested, 0);
  const savingsYield = savingsTotal - savingsCapital;

  const platformsGroups = positions.reduce((acc, curr) => {
    const value = curr.marketValue || curr.totalInvested;
    acc[curr.platform] = (acc[curr.platform] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(platformsGroups).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4', '#f97316'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fa-solid fa-vault text-8xl"></i>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Portfolio Market Value</p>
          <p className="text-5xl font-black text-gray-900 tracking-tighter">{formatCurrency(totalMarketValue, currentPortfolio.baseCurrency)}</p>
          <div className={`flex items-center gap-2 mt-4 text-sm font-black ${totalGain >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
             <span className={`px-2 py-1 rounded-lg ${totalGain >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
               <i className={`fa-solid fa-arrow-trend-${totalGain >= 0 ? 'up' : 'down'} mr-1`}></i>
               {formatPercent(totalGainPercent)}
             </span>
             <span className="opacity-60 text-xs">+{formatCurrency(Math.abs(totalGain), currentPortfolio.baseCurrency)} Total Gain</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Capital (Pure)</p>
            <p className="text-2xl font-black text-gray-800">{formatCurrency(totalInvested, currentPortfolio.baseCurrency)}</p>
          </div>
          <p className="text-[9px] text-gray-400 font-bold uppercase mt-4">Excluded Transaction Fees</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Savings Growth</p>
            <p className="text-2xl font-black text-gray-800">{formatCurrency(savingsYield, currentPortfolio.baseCurrency)}</p>
          </div>
          <p className="text-[9px] text-emerald-500 font-black uppercase mt-4 flex items-center gap-1">
            <i className="fa-solid fa-piggy-bank"></i> Accrued Interest
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-chart-simple text-blue-500"></i> Assets by Platform
            </h3>
          </div>
          <div className="h-[320px]">
            {positions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={100}
                    style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(248, 250, 252, 0.8)' }}
                    formatter={(value: number) => formatCurrency(value, currentPortfolio.baseCurrency)}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={28}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-20">
                <i className="fa-solid fa-chart-pie text-6xl mb-4"></i>
                <p className="text-xs font-black uppercase">No active positions</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 p-8 rounded-3xl shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Market Intel</h3>
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              aiInsight?.sentiment === 'positive' ? 'bg-emerald-500' : 
              aiInsight?.sentiment === 'negative' ? 'bg-rose-500' : 'bg-gray-500'
            }`}></div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-5 text-gray-300">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex flex-col gap-2">
                    <div className="h-2 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-800 rounded"></div>
                  </div>
                ))}
              </div>
            ) : aiInsight ? (
              <>
                <div className="text-[12px] leading-relaxed font-medium">
                  <p>{aiInsight.content}</p>
                </div>
                {aiInsight.sources.length > 0 && (
                  <div className="pt-5 border-t border-gray-800 flex flex-wrap gap-2">
                    {aiInsight.sources.slice(0, 3).map((source, i) => (
                      <a key={i} href={source.uri} target="_blank" rel="noreferrer" className="text-[9px] bg-gray-800 text-gray-300 px-2 py-1 rounded font-black uppercase hover:bg-white hover:text-black transition">
                        {source.title}
                      </a>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10 opacity-30">
                <i className="fa-solid fa-brain text-4xl text-white mb-4 block"></i>
                <p className="text-[10px] text-white font-black uppercase">Add assets to analyze</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;