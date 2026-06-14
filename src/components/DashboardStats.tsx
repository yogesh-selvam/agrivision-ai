import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { SystemStats } from '../types';
import { BarChart3, TrendingUp, Users, Sprout, ShieldAlert, FileSpreadsheet } from 'lucide-react';

interface DashboardStatsProps {
  stats: SystemStats;
  isAdmin: boolean;
}

const COLORS = ['#1B4332', '#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2'];

export default function DashboardStats({ stats, isAdmin }: DashboardStatsProps) {
  const chartData = useMemo(() => {
    return stats.diseaseTrends || [];
  }, [stats.diseaseTrends]);

  const cropPieData = useMemo(() => {
    return stats.cropDistribution || [];
  }, [stats.cropDistribution]);

  return (
    <div id="dashboard-stats-container" className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div id="stat-card-users" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4 transition-all hover:scale-[1.01]">
          <div className="p-3.5 bg-brand-50 text-brand-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest">Registered Users</p>
            <h3 className="text-3xl font-light text-slate-800 mt-0.5">{stats.userCount || 1}</h3>
          </div>
        </div>

        <div id="stat-card-predictions" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4 transition-all hover:scale-[1.01]">
          <div className="p-3.5 bg-brand-50 text-brand-600 rounded-2xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest font-medium">Diagnostic Runs</p>
            <h3 className="text-3xl font-light text-slate-800 mt-0.5">{stats.predictionCount}</h3>
          </div>
        </div>

        <div id="stat-card-diseases" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4 transition-all hover:scale-[1.01]">
          <div className="p-3.5 bg-red-50 text-red-600 rounded-2xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest font-medium">Threats Spotted</p>
            <h3 className="text-3xl font-light text-slate-800 mt-0.5">
              {stats.diseaseCount} <span className="text-[10px] text-amber-600 font-bold uppercase ml-1">Moderate</span>
            </h3>
          </div>
        </div>

        <div id="stat-card-queries" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4 transition-all hover:scale-[1.01]">
          <div className="p-3.5 bg-teal-50 text-teal-700 rounded-2xl">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest font-medium">Assistant Chat</p>
            <h3 className="text-3xl font-light text-slate-800 mt-0.5">{stats.chatbotQueryCount}</h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Disease Diagnostics Trends */}
        <div id="disease-trends-chart" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-bold font-display text-slate-800">Disease Occurrence & Recoveries</h4>
              <p className="text-xs text-slate-400 font-medium">Weekly diagnosis vs active bio-remedies applied successfully</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDiagnosed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                <Area type="monotone" dataKey="diagnosed" name="Identified Spores" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDiagnosed)" />
                <Area type="monotone" dataKey="treated" name="Recoveries Prescribed" stroke="#2D6A4F" strokeWidth={2} fillOpacity={1} fill="url(#colorTreated)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Recommended Crops Distribution */}
        <div id="crop-recommendations-chart" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold font-display text-slate-800">Cultivation Evaluation Mix</h4>
            <p className="text-xs text-slate-400 font-medium">Aggregate proportional representation of ML-ranked soils</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center mt-3">
            <div className="sm:col-span-3 h-52 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cropPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {cropPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} scans`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400 font-bold font-mono tracking-widest uppercase">Metrics</span>
                <span className="text-2xl font-bold font-display text-slate-800">{stats.predictionCount}</span>
              </div>
            </div>
            
            <div className="sm:col-span-2 space-y-2">
              <p className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase mb-2">Soil Top Matches</p>
              {cropPieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-slate-700 font-medium truncate max-w-[120px]">{item.name}</span>
                  <span className="text-slate-400 font-mono ml-auto">({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Admin logs / Recent logs */}
      <div id="logs-panel" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="flex gap-2 items-center mb-4">
          <FileSpreadsheet className="w-5 h-5 text-brand-600" />
          <h4 className="text-lg font-bold font-display text-slate-800">Operational Audit Trail</h4>
        </div>
        <div className="overflow-x-auto max-h-60 overflow-y-auto rounded-2xl border border-slate-50">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-3.5 text-slate-400 font-semibold uppercase tracking-widest text-[9px] font-bold">Timestamp (UTC)</th>
                <th className="p-3.5 text-slate-400 font-semibold uppercase tracking-widest text-[9px] font-bold">Operator</th>
                <th className="p-3.5 text-slate-400 font-semibold uppercase tracking-widest text-[9px] font-bold">Trigger Scope</th>
                <th className="p-3.5 text-slate-400 font-semibold uppercase tracking-widest text-[9px] font-bold">Action Narrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentLogs && stats.recentLogs.length > 0 ? (
                stats.recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 font-mono">
                    <td className="p-3.5 text-slate-500 text-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-3.5 text-slate-700 font-semibold">{log.userName}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-lg font-bold text-[10px] ${
                        log.action === 'DISEASE_DETECTION' ? 'bg-red-50 text-red-700 border border-red-100' :
                        log.action === 'CROP_DIAGNOSIS' ? 'bg-brand-50 text-brand-650 border border-brand-100' :
                        log.action === 'USER_REGISTERED' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-teal-50 text-teal-850 border border-teal-100'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 font-sans">{log.details}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400">No telemetry log entries available for this segment.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
