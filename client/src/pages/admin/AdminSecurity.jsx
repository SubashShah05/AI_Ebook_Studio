import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { triggerToast } from '../../utils/helpers';
import { ShieldAlert, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const SEVERITY_STYLE = {
  low: 'bg-slate-700 text-slate-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-rose-500/20 text-rose-400',
};

const TYPE_STYLE = {
  failed_login: 'bg-amber-500/10 text-amber-400',
  account_locked: 'bg-rose-500/10 text-rose-400',
  role_change: 'bg-violet-500/10 text-violet-400',
  account_suspended: 'bg-rose-500/10 text-rose-400',
  account_restored: 'bg-emerald-500/10 text-emerald-400',
  admin_access_denied: 'bg-orange-500/10 text-orange-400',
};

export default function AdminSecurity() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 30 });
      if (typeFilter) params.set('type', typeFilter);
      if (severityFilter) params.set('severity', severityFilter);
      const res = await API.get(`/admin/security?${params}`);
      setEvents(res.data.events);
      setPagination(res.data.pagination);
    } catch {
      triggerToast('Failed to load security events', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, severityFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Security Events</h1>
        <p className="text-sm text-slate-500 mt-1">{pagination.total} events recorded</p>
      </div>

      <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-4 flex flex-wrap gap-3">
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="bg-[#080D1A] border border-[#1E2535] text-sm text-slate-300 px-3 py-2 rounded-lg focus:outline-none">
          <option value="">All Types</option>
          {['failed_login','account_locked','account_unlocked','role_change','account_suspended','account_restored','admin_access_denied','invalid_token'].map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select value={severityFilter} onChange={e => { setSeverityFilter(e.target.value); setPage(1); }}
          className="bg-[#080D1A] border border-[#1E2535] text-sm text-slate-300 px-3 py-2 rounded-lg focus:outline-none">
          <option value="">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-rose-500 animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <ShieldAlert size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No security events.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1E2535]">
            {events.map(e => (
              <div key={e._id} className="flex items-start gap-4 px-4 py-3 hover:bg-[#1E2535]/30 transition">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 shrink-0 ${TYPE_STYLE[e.type] || 'bg-slate-700 text-slate-400'}`}>
                  {e.type?.replace(/_/g, ' ').toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    {e.userId?.name || e.email || 'Unknown'}
                    <span className="text-slate-500 text-xs ml-2">{e.userId?.email || e.email}</span>
                  </p>
                  {e.ip && <p className="text-xs text-slate-600">IP: {e.ip}</p>}
                  {e.metadata && Object.keys(e.metadata).length > 0 && (
                    <p className="text-xs text-slate-600 truncate">
                      {JSON.stringify(e.metadata).substring(0, 100)}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${SEVERITY_STYLE[e.severity]}`}>
                    {e.severity?.toUpperCase()}
                  </span>
                  <p className="text-xs text-slate-600 mt-1">{new Date(e.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E2535]">
            <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
