import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { triggerToast } from '../../utils/helpers';
import { CreditCard, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const STATUS_BADGE = {
  active: 'bg-emerald-500/20 text-emerald-400',
  trialing: 'bg-cyan-500/20 text-cyan-400',
  past_due: 'bg-amber-500/20 text-amber-400',
  canceled: 'bg-rose-500/20 text-rose-400',
  none: 'bg-slate-700 text-slate-500',
};
const PLAN_BADGE = {
  free: 'bg-slate-700 text-slate-400',
  pro: 'bg-indigo-500/20 text-indigo-400',
  business: 'bg-violet-500/20 text-violet-400',
};

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set('status', statusFilter);
      if (planFilter) params.set('plan', planFilter);
      const res = await API.get(`/admin/subscriptions?${params}`);
      setSubs(res.data.subscriptions);
      setPagination(res.data.pagination);
    } catch {
      triggerToast('Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, planFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <p className="text-sm text-slate-500 mt-1">{pagination.total} users</p>
      </div>

      <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-4 flex flex-wrap gap-3">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-[#080D1A] border border-[#1E2535] text-sm text-slate-300 px-3 py-2 rounded-lg focus:outline-none">
          <option value="">All Statuses</option>
          {['active','trialing','past_due','canceled','none'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
          ))}
        </select>
        <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
          className="bg-[#080D1A] border border-[#1E2535] text-sm text-slate-300 px-3 py-2 rounded-lg focus:outline-none">
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="business">Business</option>
        </select>
      </div>

      <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-indigo-500 animate-spin" />
          </div>
        ) : subs.length === 0 ? (
          <div className="text-center py-20">
            <CreditCard size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No subscriptions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E2535]">
                  {['User', 'Plan', 'Status', 'Subscription ID', 'Renewal Date', 'Joined'].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2535]">
                {subs.map(s => (
                  <tr key={s._id} className="hover:bg-[#1E2535]/30 transition">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${PLAN_BADGE[s.plan]}`}>
                        {s.plan?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_BADGE[s.subscriptionStatus] || STATUS_BADGE.none}`}>
                        {s.subscriptionStatus?.replace('_', ' ').toUpperCase() || 'NONE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                      {s.subscriptionId ? s.subscriptionId.substring(0, 20) + '…' : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {s.subscriptionPeriodEnd ? new Date(s.subscriptionPeriodEnd).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E2535]">
            <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
