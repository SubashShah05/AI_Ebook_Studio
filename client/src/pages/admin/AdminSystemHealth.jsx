import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { triggerToast } from '../../utils/helpers';
import { HeartPulse, CheckCircle, XCircle, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

const StatusIcon = ({ status }) => {
  if (status === 'connected' || status === 'ok' || status === 'configured') {
    return <CheckCircle size={16} className="text-emerald-400" />;
  }
  if (status === 'mock_mode' || status === 'not_configured') {
    return <AlertTriangle size={16} className="text-amber-400" />;
  }
  return <XCircle size={16} className="text-rose-400" />;
};

export default function AdminSystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/admin/system-health');
      setHealth(res.data);
    } catch {
      setError('Unable to load health data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Health</h1>
          <p className="text-sm text-slate-500 mt-1">Safe operational overview — no secrets exposed</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white border border-[#1E2535] rounded-lg hover:border-slate-500 transition">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 size={28} className="text-emerald-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl p-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={load} className="text-rose-400 hover:text-rose-300 font-semibold text-sm">Try Again</button>
        </div>
      ) : health && (
        <>
          {/* Overall Status */}
          <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <HeartPulse size={22} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Overall Status</p>
              <p className="text-xl font-bold text-emerald-400 uppercase">{health.status}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-500">Version</p>
              <p className="text-sm font-bold text-white">{health.version}</p>
              <p className="text-xs text-slate-600">{health.environment}</p>
            </div>
          </div>

          {/* Services */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(health.services || {}).map(([name, svc]) => (
              <div key={name} className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-white capitalize">{name}</p>
                  <StatusIcon status={svc.status} />
                </div>
                <div className="space-y-1">
                  {Object.entries(svc).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-slate-500 capitalize">{k}</span>
                      <span className={`font-medium ${
                        v === 'connected' || v === 'ok' || v === 'configured' ? 'text-emerald-400'
                        : v === 'mock_mode' || v === 'not_configured' ? 'text-amber-400'
                        : 'text-slate-300'
                      }`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Timestamp */}
          <div className="bg-[#0B1220] border border-[#1E2535] rounded-xl p-4">
            <p className="text-xs text-slate-500">
              Last checked: <span className="text-slate-300">{new Date(health.timestamp).toLocaleString()}</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">
              ⚠ No secrets, database credentials, or API keys are exposed in this view.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
