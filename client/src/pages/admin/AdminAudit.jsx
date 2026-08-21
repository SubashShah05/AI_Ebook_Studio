import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { triggerToast } from '../../utils/helpers';
import { ClipboardList, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const ACTION_STYLE = {
  suspend_user: 'bg-rose-500/20 text-rose-400',
  restore_user: 'bg-emerald-500/20 text-emerald-400',
  change_role: 'bg-violet-500/20 text-violet-400',
  archive_book: 'bg-amber-500/20 text-amber-400',
  create_template: 'bg-indigo-500/20 text-indigo-400',
  update_template: 'bg-cyan-500/20 text-cyan-400',
  archive_template: 'bg-slate-600 text-slate-400',
};

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 30 });
      if (actionFilter) params.set('action', actionFilter);
      if (targetTypeFilter) params.set('targetType', targetTypeFilter);
      const res = await API.get(`/admin/audit?${params}`);
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch {
      triggerToast('Failed to load audit log', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, targetTypeFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <p className="text-sm text-slate-500 mt-1">{pagination.total} admin actions recorded</p>
      </div>

      <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-4 flex flex-wrap gap-3">
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="bg-[#080D1A] border border-[#1E2535] text-sm text-slate-300 px-3 py-2 rounded-lg focus:outline-none">
          <option value="">All Actions</option>
          {['suspend_user','restore_user','change_role','archive_book','create_template','update_template','archive_template'].map(a => (
            <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select value={targetTypeFilter} onChange={e => { setTargetTypeFilter(e.target.value); setPage(1); }}
          className="bg-[#080D1A] border border-[#1E2535] text-sm text-slate-300 px-3 py-2 rounded-lg focus:outline-none">
          <option value="">All Targets</option>
          <option value="User">User</option>
          <option value="Book">Book</option>
          <option value="Template">Template</option>
        </select>
      </div>

      <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-indigo-500 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20">
            <ClipboardList size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No audit log entries.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E2535]">
                  {['Admin', 'Action', 'Target Type', 'Target ID', 'Details', 'Date'].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2535]">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-[#1E2535]/30 transition">
                    <td className="px-4 py-3">
                      <p className="text-sm text-white">{log.adminId?.name || '—'}</p>
                      <p className="text-xs text-slate-500">{log.adminId?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ACTION_STYLE[log.action] || 'bg-slate-700 text-slate-400'}`}>
                        {log.action?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{log.targetType}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 font-mono">
                      {log.targetId?.toString().substring(0, 10)}…
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">
                      {log.metadata?.targetEmail || log.metadata?.bookTitle || log.metadata?.title || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
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
