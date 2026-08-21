import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { triggerToast } from '../../utils/helpers';
import { Search, BookOpen, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';

function useDebounce(value, delay) {
  const [d, setD] = useState(value);
  useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return d;
}

const STATUS_BADGE = {
  draft: 'bg-slate-700 text-slate-400',
  generating: 'bg-amber-500/20 text-amber-400',
  ready: 'bg-emerald-500/20 text-emerald-400',
  failed: 'bg-rose-500/20 text-rose-400',
  archived: 'bg-slate-600 text-slate-500',
};

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [actionId, setActionId] = useState(null);

  const debouncedSearch = useDebounce(search, 350);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter) params.set('status', statusFilter);
      const res = await API.get(`/admin/books?${params}`);
      setBooks(res.data.books);
      setPagination(res.data.pagination);
    } catch {
      triggerToast('Failed to load books', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleArchive = async (bookId, title) => {
    if (!window.confirm(`Archive "${title}"? The owner will lose access.`)) return;
    setActionId(bookId);
    try {
      await API.put(`/admin/books/${bookId}/archive`);
      triggerToast(`"${title}" archived.`);
      load();
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Archive failed', 'error');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Book Management</h1>
          <p className="text-sm text-slate-500 mt-1">{pagination.total} total books</p>
        </div>
        <button onClick={load} className="p-2 text-slate-400 hover:text-white border border-[#1E2535] rounded-lg hover:border-slate-500 transition">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search book title…"
            className="w-full pl-9 pr-3 py-2 bg-[#080D1A] border border-[#1E2535] rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-[#080D1A] border border-[#1E2535] text-sm text-slate-300 px-3 py-2 rounded-lg focus:outline-none">
          <option value="">All Statuses</option>
          {['draft','generating','ready','failed','archived'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-indigo-500 animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No books found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E2535]">
                  {['Title', 'Owner', 'Status', 'Chapters', 'Words', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2535]">
                {books.map(b => (
                  <tr key={b._id} className="hover:bg-[#1E2535]/30 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                          <BookOpen size={13} className="text-violet-400" />
                        </div>
                        <span className="text-sm font-medium text-white truncate max-w-[180px]">{b.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-slate-300 truncate max-w-[120px]">{b.owner?.name}</p>
                        <p className="text-xs text-slate-600 truncate max-w-[120px]">{b.owner?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_BADGE[b.status] || STATUS_BADGE.draft}`}>
                        {b.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{b.chapterCount}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{(b.wordCount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {actionId === b._id ? (
                        <Loader2 size={14} className="text-indigo-400 animate-spin" />
                      ) : (
                        <button
                          onClick={() => handleArchive(b._id, b.title)}
                          disabled={b.status === 'archived'}
                          className="text-xs px-2 py-1 rounded border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Archive
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E2535]">
            <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.pages} · {pagination.total} books</p>
            <div className="flex items-center gap-2">
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
