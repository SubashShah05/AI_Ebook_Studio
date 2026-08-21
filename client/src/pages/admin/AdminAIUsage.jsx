import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { triggerToast } from '../../utils/helpers';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

export default function AdminAIUsage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/ai-usage?days=${days}`);
      setData(res.data);
    } catch {
      triggerToast('Failed to load AI usage', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [days]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Usage</h1>
          <p className="text-sm text-slate-500 mt-1">Platform-wide AI generation analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={days} onChange={e => setDays(Number(e.target.value))}
            className="bg-[#0B1220] border border-[#1E2535] text-sm text-slate-300 px-3 py-2 rounded-lg focus:outline-none">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={load} className="p-2 text-slate-400 hover:text-white border border-[#1E2535] rounded-lg transition">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="text-amber-500 animate-spin" />
        </div>
      ) : data && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Generations', value: data.totalGenerations?.toLocaleString() },
              { label: 'This Month', value: data.thisMonthGenerations?.toLocaleString() },
              { label: 'Failures (logged)', value: data.failures?.toLocaleString() },
            ].map(k => (
              <div key={k.label} className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">{k.label}</p>
                <p className="text-3xl font-bold text-white">{k.value ?? '—'}</p>
              </div>
            ))}
          </div>

          {/* By Day Chart */}
          <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-5">
            <h2 className="text-sm font-bold text-white mb-4">AI Generations by Day</h2>
            {data.byDay?.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-12">No data for selected period.</p>
            ) : (
              <div className="flex items-end gap-1 h-40">
                {data.byDay.map(d => {
                  const max = Math.max(...data.byDay.map(x => x.count), 1);
                  const pct = (d.count / max) * 100;
                  return (
                    <div key={d._id} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <span className="absolute -top-6 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition whitespace-nowrap left-1/2 -translate-x-1/2">
                        {d._id}: {d.count}
                      </span>
                      <div
                        className="w-full bg-amber-500/60 hover:bg-amber-500 rounded-sm transition cursor-default"
                        style={{ height: `${pct}%`, minHeight: 2 }}
                      />
                      <span className="text-[7px] text-slate-600">{d._id.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Action */}
            <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-5">
              <h2 className="text-sm font-bold text-white mb-4">By Action Type</h2>
              {data.byAction?.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No data.</p>
              ) : (
                <div className="space-y-2">
                  {data.byAction.map(a => {
                    const max = Math.max(...data.byAction.map(x => x.count), 1);
                    const pct = (a.count / max) * 100;
                    return (
                      <div key={a._id} className="space-y-0.5">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>{a._id || 'unknown'}</span>
                          <span>{a.count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#1E2535] rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500/70 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Users */}
            <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-5">
              <h2 className="text-sm font-bold text-white mb-4">Top AI Users</h2>
              {data.topUsers?.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No data.</p>
              ) : (
                <div className="space-y-2">
                  {data.topUsers.map((u, i) => (
                    <div key={u._id} className="flex items-center gap-3 p-2 hover:bg-[#1E2535]/30 rounded-lg transition">
                      <span className="text-xs font-bold text-slate-600 w-4">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{u.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500 truncate">{u.user?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-amber-400">{u.count}</p>
                        <p className="text-[10px] text-slate-600">{u.user?.plan}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
