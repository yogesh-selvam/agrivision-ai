import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { SystemStats } from '../types';
import { 
  Users, 
  TrendingUp, 
  Bug, 
  Activity, 
  FileText,
  Sliders,
  Sparkles,
  ArrowRight,
  Filter,
  Download,
  MoreVertical
} from 'lucide-react';

interface DashboardStatsProps {
  stats: SystemStats;
  isAdmin: boolean;
}

export default function DashboardStats({ stats, isAdmin }: DashboardStatsProps) {
  // Weekly trend matching Platform Usage Trends
  const trendData = useMemo(() => {
    return [
      { name: 'Mon', value: 120 },
      { name: 'Tue', value: 180 },
      { name: 'Wed', value: 90 },
      { name: 'Thu', value: 240 },
      { name: 'Fri', value: 210 },
      { name: 'Sat', value: 160 },
      { name: 'Sun', value: 290 },
    ];
  }, []);

  return (
    <div id="dashboard-stats-viewport" className="space-y-6">
      
      {/* 4 Multi-colored metrics row matching mockup 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-start relative hover:shadow-md transition-all duration-250">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">Total Users</span>
            <span className="text-3xl font-bold font-sans text-slate-800 tracking-tight block">12,842</span>
          </div>
          <div className="flex flex-col items-end justify-between h-full">
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-mono">+12%</span>
            <div className="p-3 bg-brand-50 text-brand-700 rounded-xl mt-4">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-start relative hover:shadow-md transition-all duration-250">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">Total Predictions</span>
            <span className="text-3xl font-bold font-sans text-slate-800 tracking-tight block">45,109</span>
          </div>
          <div className="flex flex-col items-end justify-between h-full">
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-mono">+18%</span>
            <div className="p-3 bg-brand-50 text-brand-700 rounded-xl mt-4">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-start relative hover:shadow-md transition-all duration-250">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">Disease Scans</span>
            <span className="text-3xl font-bold font-sans text-slate-800 tracking-tight block">8,231</span>
          </div>
          <div className="flex flex-col items-end justify-between h-full">
            <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-mono">-2%</span>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl mt-4">
              <Bug className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-start relative hover:shadow-md transition-all duration-250">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">Active Users</span>
            <span className="text-3xl font-bold font-sans text-slate-800 tracking-tight block">2,104</span>
          </div>
          <div className="flex flex-col items-end justify-between h-full">
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-mono">+5%</span>
            <div className="p-3 bg-brand-50 text-brand-700 rounded-xl mt-4">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts & Side AI panel split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Platform Usage Trend Bar Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-base font-bold text-slate-800">Platform Usage Trends</h4>
              <select className="bg-slate-50 text-slate-500 font-bold border border-slate-200/50 text-[11px] px-2.5 py-1.5 rounded-lg cursor-pointer focus:outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <p className="text-xs text-slate-400 font-medium mb-6">Weekly analytics comparison</p>
          </div>

          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} barGap={4} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                  contentStyle={{ background: '#1b1c1c', color: 'white', borderRadius: '12px', border: 'none', fontSize: '11px' }} 
                />
                <Bar dataKey="value" fill="#9bc4a5" radius={[6, 6, 0, 0]}>
                  {trendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? '#0d631b' : '#a3c9a8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Panel (Moss Green Sidebar card) */}
        <div className="lg:col-span-4 bg-brand-700 text-white p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
              <h4 className="text-base font-bold tracking-tight">AI Insights</h4>
            </div>
            <p className="text-xs text-emerald-150 leading-relaxed font-sans opacity-95">
              Live automated pathology intelligence and climate prediction synthesis based on regional sensor inputs.
            </p>

            <div className="space-y-3 pt-2">
              {/* Box 1 */}
              <div className="p-4 bg-brand-650/30 rounded-xl border border-white/10">
                <span className="text-[9px] font-mono tracking-wider font-bold text-emerald-250 uppercase block">Most Common Disease</span>
                <span className="font-bold text-sm text-white block mt-1 font-sans">Rice Blast (Pyricularia oryzae)</span>
              </div>

              {/* Box 2 */}
              <div className="p-4 bg-brand-650/30 rounded-xl border border-white/10">
                <span className="text-[9px] font-mono tracking-wider font-bold text-emerald-250 uppercase block">Recommended Crop</span>
                <span className="font-bold text-sm text-white block mt-1 font-sans">Sorghum (Climate Adaptive)</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 py-3 bg-white text-brand-700 hover:bg-brand-50 hover:text-brand-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer">
            View Full Report <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Recent User Activity database table list */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h4 className="text-base font-bold text-slate-800">Recent User Activity</h4>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="p-2.5 bg-slate-50 border border-slate-200/50 hover:bg-slate-100 text-slate-700 rounded-lg shrink-0 cursor-pointer transition">
              <Filter className="w-4 h-4 text-slate-550" />
            </button>
            <button className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition ml-auto cursor-pointer">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-50">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="p-4 text-slate-400 font-bold uppercase tracking-wider">Name</th>
                <th className="p-4 text-slate-400 font-bold uppercase tracking-wider">Email</th>
                <th className="p-4 text-slate-400 font-bold uppercase tracking-wider">Role</th>
                <th className="p-4 text-slate-400 font-bold uppercase tracking-wider">Status</th>
                <th className="p-4 text-slate-400 font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Dummy rows exactly mirroring screenshot 2 */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-[11px]">
                      RJ
                    </div>
                    <span className="font-bold text-slate-800">Rajesh J.</span>
                  </div>
                </td>
                <td className="p-4 text-slate-500 font-medium">rajesh.j@farmcorp.com</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-650 rounded-md text-[10px] font-bold">Agronomist</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span className="font-bold text-slate-700 text-[11px]">Active</span>
                  </div>
                </td>
                <td className="p-4">
                  <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px]">
                      AK
                    </div>
                    <span className="font-bold text-slate-800">Ananya K.</span>
                  </div>
                </td>
                <td className="p-4 text-slate-500 font-medium">a.kumar@agrilabs.io</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-650 rounded-md text-[10px] font-bold">Admin</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span className="font-bold text-slate-700 text-[11px]">Active</span>
                  </div>
                </td>
                <td className="p-4">
                  <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[11px]">
                      SM
                    </div>
                    <span className="font-bold text-slate-800">Samuel M.</span>
                  </div>
                </td>
                <td className="p-4 text-slate-500 font-medium font-sans">samuel_m@fieldview.net</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-650 rounded-md text-[10px] font-bold">Farmer</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                    <span className="font-bold text-slate-400 text-[11px]">Offline</span>
                  </div>
                </td>
                <td className="p-4">
                  <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <button className="w-full py-2.5 text-center text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer transition">
          View All Users
        </button>
      </div>

    </div>
  );
}
