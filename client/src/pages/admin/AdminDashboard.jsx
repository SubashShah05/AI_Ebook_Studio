import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { triggerToast } from '../../utils/helpers';
import {
  Users, BookOpen, Sparkles, CreditCard, TrendingUp, ArrowUpRight,
  ShieldAlert, Activity, Loader2, RefreshCw
} from 'lucide-react';

const KPI = ({ label, value, sub, icon: Icon, color, to }) => (
  <Link
    to={to || '#'}
    className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-5 flex items-start justify-between hover:border-[#2E3A55] transition group"
  >
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">{label}</p>
      <p className="text-3xl font-bold text-white mb-1">{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} shrink-0`}>
      <Icon size={18} className="text-white" />
    </div>
  </Link>
);

const Skeleton = ({ className }) => (
  <div className={`bg-[#0B1220] border border-[#1E2535] rounded-xl animate-pulse ${className}`} />
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/admin/dashboard');
      setStats(res.data);
    } catch {
      setError('Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time SaaS metrics</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white border border-[#1E2535] rounded-lg hover:border-slate-500 transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl p-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={load} className="text-rose-400 hover:text-rose-300 font-semibold text-sm">Try Again</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : stats && (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KPI label="Total Users" value={stats.users.total.toLocaleString()}
              sub={`+${stats.users.newThisMonth} this month`}
              icon={Users} color="bg-indigo-600" to="/admin/users" />
            <KPI label="Active Users" value={stats.users.active.toLocaleString()}
              sub={`${stats.users.suspended} suspended`}
              icon={TrendingUp} color="bg-emerald-600" to="/admin/users" />
            <KPI label="Total Books" value={stats.content.books.toLocaleString()}
              sub={`${stats.content.chapters.toLocaleString()} chapters`}
              icon={BookOpen} color="bg-violet-600" to="/admin/books" />
            <KPI label="AI Generations" value={stats.ai.total.toLocaleString()}
              sub={`${stats.ai.thisMonth} this month`}
              icon={Sparkles} color="bg-amber-600" to="/admin/ai-usage" />
            <KPI label="Active Subscriptions" value={stats.plans.activeSubscriptions}
              sub={`${stats.plans.pro} Pro · ${stats.plans.business} Business`}
              icon={CreditCard} color="bg-rose-600" to="/admin/subscriptions" />
            <KPI label="Free Users" value={stats.plans.free}
              icon={Users} color="bg-slate-600" to="/admin/users?plan=free" />
            <KPI label="Total Exports" value={stats.exports.total.toLocaleString()}
              icon={ArrowUpRight} color="bg-cyan-600" to="/admin/activity" />
            <KPI label="Admin Users" value={stats.users.admins}
              icon={ShieldAlert} color="bg-orange-600" to="/admin/users?role=admin" />
          </div>

          {/* AI by Day Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-5">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" /> AI Usage — Last 14 Days
              </h2>
              {stats.ai.byDay.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No AI usage data yet.</p>
              ) : (
                <div className="flex items-end gap-1 h-32">
                  {stats.ai.byDay.map(d => {
                    const max = Math.max(...stats.ai.byDay.map(x => x.count), 1);
                    const pct = (d.count / max) * 100;
                    return (
                      <div key={d._id} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                          {d._id}: {d.count}
                        </div>
                        <div
                          className="w-full bg-amber-500/70 hover:bg-amber-500 rounded-sm transition"
                          style={{ height: `${pct}%`, minHeight: 2 }}
                        />
                        <span className="text-[8px] text-slate-600 rotate-45 origin-left">{d._id.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Users */}
            <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users size={14} className="text-indigo-400" /> Recent Signups
                </h2>
                <Link to="/admin/users" className="text-xs text-indigo-400 hover:underline">View all</Link>
              </div>
              {stats.recentUsers?.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No users yet.</p>
              ) : (
                <div className="space-y-2">
                  {stats.recentUsers.map(u => (
                    <Link
                      key={u._id}
                      to={`/admin/users/${u._id}`}
                      className="flex items-center gap-3 p-2.5 hover:bg-[#1E2535]/50 rounded-lg transition group"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-indigo-400 transition">{u.name}</p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        u.plan === 'business' ? 'bg-violet-500/20 text-violet-400'
                        : u.plan === 'pro' ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-700 text-slate-400'
                      }`}>{u.plan?.toUpperCase()}</span>
                    </Link>
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
