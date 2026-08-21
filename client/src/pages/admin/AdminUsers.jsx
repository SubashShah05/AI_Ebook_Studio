import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { triggerToast } from '../../utils/helpers';
import { Search, ChevronLeft, ChevronRight, User, Filter, Loader2, RefreshCw } from 'lucide-react';

const STATUS_BADGE = {
  active: 'bg-emerald-500/20 text-emerald-400',
  suspended: 'bg-rose-500/20 text-rose-400',
};
const PLAN_BADGE = {
  free: 'bg-slate-700 text-slate-400',
  pro: 'bg-indigo-500/20 text-indigo-400',
  business: 'bg-violet-500/20 text-violet-400',
};
const ROLE_BADGE = {
  admin: 'bg-orange-500/20 text-orange-400',
  user: 'bg-slate-700 text-slate-400',
};

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [plan, setPlan] = useState(searchParams.get('plan') || '');
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 350);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (status) params.set('status', status);
      if (plan) params.set('plan', plan);
      if (role) params.set('role', role);

      const res = await API.get(`/admin/users?${params}`);
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch {
      triggerToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, plan, role]);

  useEffect(() => { load(); }, [load]);

  const handleSuspend = async (userId, userName, currentStatus) => {
    const action = currentStatus === 'suspended' ? 'restore' : 'suspend';
    const msg = action === 'suspend'
      ? `Suspend ${userName}'s account? They will lose access immediately.`
      : `Restore ${userName}'s account?`;
    if (!window.confirm(msg)) return;

    setActionLoading(userId);
    try {
      await API.put(`/admin/users/${userId}/${action}`);
      triggerToast(action === 'suspend' ? `${userName} suspended.` : `${userName} restored.`);
      load();
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (userId, userName, newRole) => {
    if (!window.confirm(`Change ${userName}'s role to ${newRole}?`)) return;
    setActionLoading(userId);
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      triggerToast(`Role updated to ${newRole} for ${userName}`);
      load();
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Role change failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">{pagination.total} total users</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white border border-[#1E2535] rounded-lg hover:border-slate-500 transition">
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
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-3 py-2 bg-[#080D1A] border border-[#1E2535] rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="bg-[#080D1A] border border-[#1E2535] text-sm text-slate-300 px-3 py-2 rounded-lg focus:outline-none">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select value={plan} onChange={e => { setPlan(e.target.value); setPage(1); }}
          className="bg-[#080D1A] border border-[#1E2535] text-sm text-slate-300 px-3 py-2 rounded-lg focus:outline-none">
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="business">Business</option>
        </select>
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
          className="bg-[#080D1A] border border-[#1E2535] text-sm text-slate-300 px-3 py-2 rounded-lg focus:outline-none">
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-indigo-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <User size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E2535]">
                  {['User', 'Role', 'Plan', 'Status', 'Books', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2535]">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-[#1E2535]/30 transition">
                    <td className="px-4 py-3">
                      <Link to={`/admin/users/${u._id}`} className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition truncate max-w-[160px]">{u.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[160px]">{u.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ROLE_BADGE[u.role] || ROLE_BADGE.user}`}>
                        {u.role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${PLAN_BADGE[u.plan] || PLAN_BADGE.free}`}>
                        {u.plan?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_BADGE[u.status] || STATUS_BADGE.active}`}>
                        {u.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{u.bookCount}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {actionLoading === u._id ? (
                          <Loader2 size={14} className="text-indigo-400 animate-spin" />
                        ) : (
                          <>
                            <button
                              onClick={() => handleSuspend(u._id, u.name, u.status)}
                              disabled={u.role === 'admin'}
                              className={`text-xs px-2 py-1 rounded border transition ${
                                u.status === 'suspended'
                                  ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                  : 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
                              } disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                              {u.status === 'suspended' ? 'Restore' : 'Suspend'}
                            </button>
                            <select
                              value={u.role}
                              onChange={e => handleRoleChange(u._id, u.name, e.target.value)}
                              className="text-xs bg-[#080D1A] border border-[#1E2535] text-slate-400 px-2 py-1 rounded focus:outline-none"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E2535]">
            <p className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.pages} · {pagination.total} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
