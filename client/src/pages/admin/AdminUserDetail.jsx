import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { triggerToast } from '../../utils/helpers';
import { ArrowLeft, Loader2, User, BookOpen, Sparkles, Activity } from 'lucide-react';

const PLAN_BADGE = {
  free: 'bg-slate-700 text-slate-400',
  pro: 'bg-indigo-500/20 text-indigo-400',
  business: 'bg-violet-500/20 text-violet-400',
};

const typeLabel = (type) => {
  const map = { ai_usage: 'AI Generation', writing_activity: 'Writing', export_created: 'Export' };
  return map[type] || type;
};

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/users/${id}`);
      setUser(res.data);
    } catch {
      triggerToast('Failed to load user', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleSuspend = async () => {
    const action = user.status === 'suspended' ? 'restore' : 'suspend';
    const msg = action === 'suspend'
      ? `Suspend ${user.name}'s account? They will lose access immediately.`
      : `Restore ${user.name}'s account?`;
    if (!window.confirm(msg)) return;
    setActionLoading(true);
    try {
      await API.put(`/admin/users/${id}/${action}`);
      triggerToast(action === 'suspend' ? 'User suspended.' : 'User restored.');
      load();
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-slate-500">
        <p>User not found.</p>
        <Link to="/admin/users" className="text-indigo-400 hover:underline text-sm mt-2 inline-block">Back to Users</Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/users')} className="p-2 text-slate-400 hover:text-white hover:bg-[#1E2535] rounded-lg transition">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user.name}</h1>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded ${PLAN_BADGE[user.plan]}`}>{user.plan?.toUpperCase()}</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded ${
            user.status === 'suspended' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>{user.status?.toUpperCase()}</span>
          {user.role === 'admin' && (
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-orange-500/20 text-orange-400">ADMIN</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Usage Stats */}
        {[
          { label: 'Books', value: user.stats?.bookCount ?? 0, icon: BookOpen, color: 'text-violet-400' },
          { label: 'AI This Month', value: user.stats?.aiUsed ?? 0, icon: Sparkles, color: 'text-amber-400' },
          { label: 'Total Exports', value: user.stats?.totalExports ?? 0, icon: Activity, color: 'text-cyan-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-4 flex items-center gap-4">
            <s.icon size={20} className={s.color} />
            <div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Account Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-white mb-3">Account Details</h2>
          {[
            ['Name', user.name],
            ['Email', user.email],
            ['Role', user.role],
            ['Plan', user.plan],
            ['Subscription', user.subscriptionStatus || 'none'],
            ['Onboarding', user.onboardingCompleted ? 'Complete' : 'Incomplete'],
            ['Joined', new Date(user.createdAt).toLocaleDateString()],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm border-b border-[#1E2535] pb-2 last:border-0">
              <span className="text-slate-500">{k}</span>
              <span className="text-white font-medium">{v}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-white mb-3">Admin Actions</h2>
          <button
            onClick={handleSuspend}
            disabled={actionLoading || user.role === 'admin'}
            className={`w-full px-4 py-2.5 text-sm font-semibold rounded-lg border transition disabled:opacity-40 disabled:cursor-not-allowed ${
              user.status === 'suspended'
                ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                : 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            {actionLoading ? <Loader2 size={14} className="animate-spin mx-auto" />
              : user.status === 'suspended' ? 'Restore Account' : 'Suspend Account'}
          </button>
          {user.role === 'admin' && (
            <p className="text-xs text-slate-600 text-center">Cannot suspend another admin account.</p>
          )}
          <p className="text-xs text-slate-600 text-center mt-4">
            Suspension blocks all authenticated access.<br />User data is preserved.
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-5">
        <h2 className="text-sm font-bold text-white mb-4">Recent Activity</h2>
        {!user.recentActivity?.length ? (
          <p className="text-sm text-slate-500 text-center py-6">No activity recorded.</p>
        ) : (
          <div className="space-y-2">
            {user.recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 hover:bg-[#1E2535]/30 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    a.type === 'ai_usage' ? 'bg-amber-500'
                    : a.type === 'export_created' ? 'bg-cyan-500'
                    : 'bg-indigo-500'
                  }`} />
                  <span className="text-sm text-slate-300">{typeLabel(a.type)}</span>
                  {a.metadata?.action && (
                    <span className="text-xs text-slate-500">({a.metadata.action})</span>
                  )}
                </div>
                <span className="text-xs text-slate-600">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
