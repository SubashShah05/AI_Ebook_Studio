import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../services/api';
import { triggerToast } from '../utils/helpers';
import { 
  Book, Layers, FileText, CheckCircle2, Cpu, FileDown, 
  TrendingUp, Calendar, Clock, BarChart3, AlertCircle, Loader2, Sparkles
} from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [writingData, setWritingData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const [overviewRes, writingRes, activityRes] = await Promise.all([
        API.get('/analytics/overview'),
        API.get(`/analytics/writing?days=${days}`),
        API.get('/analytics/activity')
      ]);
      setData(overviewRes.data);
      setWritingData(writingRes.data);
      setActivities(activityRes.data);
    } catch (err) {
      setError('Unable to load analytics');
      triggerToast('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f1523]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-[#0f1523]">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{error}</h2>
        <button onClick={() => { setLoading(true); fetchAnalytics(); }} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow">
          Try Again
        </button>
      </div>
    );
  }

  // Derived KPI Cards configuration
  const kpis = [
    { label: 'Total Books', value: data?.totalBooks || 0, icon: Book, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Total Chapters', value: data?.totalChapters || 0, icon: Layers, color: 'text-sky-600 bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Total Words', value: data?.totalWords?.toLocaleString() || 0, icon: FileText, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Completed Books', value: data?.completedBooks || 0, icon: CheckCircle2, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
    { label: 'AI Generations', value: data?.aiUsed || 0, icon: Cpu, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Exports Created', value: data?.totalExports || 0, icon: FileDown, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' }
  ];

  // SVG Chart Calculation Helpers
  const maxWords = Math.max(...writingData.map(d => d.words), 100);
  const chartHeight = 160;
  const chartWidth = 500;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1523] pb-16">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Understand your writing activity and AI usage.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{kpi.label}</span>
                  <div className={`p-2 rounded-xl shrink-0 ${kpi.color}`}>
                    <Icon size={16} />
                  </div>
                </div>
                <span className="text-2xl font-black text-slate-955 dark:text-white leading-tight">
                  {kpi.value}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Core Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Writing Activity Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Writing Activity</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Words saved over time</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-700 p-0.5 rounded-lg">
                {[
                  { value: 7, label: '7D' },
                  { value: 30, label: '30D' },
                  { value: 90, label: '90D' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDays(opt.value)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      days === opt.value
                        ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {writingData.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-sm">
                <BarChart3 size={32} className="mb-2 text-slate-300" />
                No writing activity yet in this period.
              </div>
            ) : (
              <div className="relative">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
                    <line
                      key={idx}
                      x1="0"
                      y1={chartHeight * (1 - ratio)}
                      x2={chartWidth}
                      y2={chartHeight * (1 - ratio)}
                      stroke="#e2e8f0"
                      strokeDasharray="4"
                      className="dark:stroke-slate-700"
                    />
                  ))}
                  {/* Bar columns */}
                  {writingData.map((d, i) => {
                    const colWidth = (chartWidth / writingData.length) * 0.7;
                    const spacing = (chartWidth / writingData.length) * 0.3;
                    const barHeight = (d.words / maxWords) * chartHeight;
                    const x = i * (colWidth + spacing) + spacing / 2;
                    const y = chartHeight - barHeight;

                    return (
                      <g key={d._id} className="group cursor-pointer">
                        <rect
                          x={x}
                          y={y}
                          width={colWidth}
                          height={Math.max(barHeight, 4)}
                          rx="3"
                          fill="#6366f1"
                          opacity="0.85"
                          className="hover:opacity-100 transition-opacity"
                        />
                        <title>{`${d._id}: ${d.words} words`}</title>
                      </g>
                    );
                  })}
                </svg>
                {/* Labels */}
                <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-bold px-1">
                  <span>{writingData[0]?._id}</span>
                  <span>{writingData[writingData.length - 1]?._id}</span>
                </div>
              </div>
            )}
          </div>

          {/* AI Usage Limits Enforcement Visualizer */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-[#1e293b] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">AI Usage Limits</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Current period AI operations quota</p>
              
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Usage</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{data?.aiUsed} / {data?.aiLimit}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((data?.aiUsed || 0) / (data?.aiLimit || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Current Plan</p>
                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 capitalize">{data?.plan || 'free'}</p>
                  </div>
                  <button className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition">
                    Upgrade
                  </button>
                </div>
              </div>
            </div>

            {/* Productivity Insights */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Productivity Insights</h4>
              {data?.totalWords > 0 ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span>Average chapter contains <strong>{data.avgWordsPerChapter}</strong> words.</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Calendar size={14} className="text-indigo-500" />
                    <span>Created <strong>{data.totalBooks}</strong> ebook projects.</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Keep writing to unlock productivity insights.</p>
              )}
            </div>
          </div>
        </div>

        {/* Books Table & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Books Analytics Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">Book Breakdown</h3>
            {(!data?.books || data.books.length === 0) ? (
              <p className="text-sm text-slate-500 italic">No book projects available yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 text-xs font-bold uppercase">
                      <th className="pb-3">Title</th>
                      <th className="pb-3">Completed</th>
                      <th className="pb-3">Words</th>
                      <th className="pb-3">Read Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.books.map(bk => (
                      <tr key={bk._id} className="border-b border-slate-100 dark:border-slate-700/60 last:border-0 text-slate-700 dark:text-slate-300">
                        <td className="py-3 font-semibold truncate max-w-[150px]">{bk.title}</td>
                        <td className="py-3">
                          {bk.completedChapters} / {bk.chapterCount} ch
                        </td>
                        <td className="py-3 font-medium">{bk.totalWords?.toLocaleString()}</td>
                        <td className="py-3 font-medium">{bk.readingTime} min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">Recent Activity</h3>
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No actions recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {activities.map((act, i) => (
                  <div key={act._id} className="flex gap-3 text-sm items-start">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {act.type === 'ai_usage' && `AI ${act.metadata?.action || 'operation'} triggered`}
                        {act.type === 'writing_activity' && `Saved ${act.metadata?.wordCount || 0} words`}
                        {act.type === 'export_created' && `Exported ${act.metadata?.format?.toUpperCase() || ''}`}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(act.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
