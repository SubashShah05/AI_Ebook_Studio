import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { triggerToast } from '../../utils/helpers';
import { Activity, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const TYPE_STYLE = {
  ai_usage: 'bg-amber-500/20 text-amber-400',
  writing_activity: 'bg-indigo-500/20 text-indigo-400',
  export_created: 'bg-cyan-500/20 text-cyan-400',
};

export default function AdminActivity() {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 30 });
      if (typeFilter) params.set('type', typeFilter);
      const res = await API.get(`/admin/activity?${params}`);
      setActivities(res.data.activities);
      setPagination(res.data.pagination);
    } catch {
      triggerToast('Failed to load activity', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Activity</h1>
        <p className="text-sm text-slate-500 mt-1">{pagination.total} total events</p>
      </div>

      <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-4">
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="bg-[#080D1A] border border-[#1E2535] text-sm text-slate-300 px-3 py-2 rounded-lg focus:outline-none">
          <option value="">All Types</option>
          <option value="ai_usage">AI Usage</option>
          <option value="writing_activity">Writing Activity</option>
          <option value="export_created">Export</option>
        </select>
      </div>

      <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-indigo-500 animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-20">
            <Activity size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No activity found.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1E2535]">
            {activities.map(a => (
              <div key={a._id} className="flex items-center gap-4 px-4 py-3 hover:bg-[#1E2535]/30 transition">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${TYPE_STYLE[a.type] || 'bg-slate-700 text-slate-400'}`}>
                  {a.type?.replace('_', ' ').toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {a.userId?.name || 'Unknown User'}
                    <span className="text-slate-500 text-xs ml-2">{a.userId?.email}</span>
                  </p>
                  {a.bookId?.title && (
                    <p className="text-xs text-slate-500 truncate">Book: {a.bookId.title}</p>
                  )}
                  {a.metadata?.action && (
                    <p className="text-xs text-slate-600">Action: {a.metadata.action}</p>
                  )}
                </div>
                <span className="text-xs text-slate-600 shrink-0">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
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
