import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { triggerToast } from '../utils/helpers';
import { ShieldAlert, Loader2, Sparkles, CheckCircle2, AlertTriangle, CreditCard } from 'lucide-react';

export default function Billing() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  const fetchBilling = async () => {
    try {
      const res = await API.get('/billing/status');
      setBilling(res.data);
    } catch {
      triggerToast('Failed to load billing status', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will retain access until the end of the current billing cycle.')) return;
    setCanceling(true);
    try {
      const res = await API.post('/billing/cancel');
      triggerToast(res.data.message);
      fetchBilling();
    } catch {
      triggerToast('Failed to cancel subscription', 'error');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f1523]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  const hasSubscription = billing?.plan !== 'free';
  const isCanceled = billing?.subscriptionStatus === 'canceled';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1523] pb-16">
      {/* Dev Mode Notification */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center justify-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
        <ShieldAlert size={14} className="shrink-0" />
        <span>Development Mode: Subscriptions are simulated.</span>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-8 mb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Billing & Subscription</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage your plans, subscription status, and usage quotas.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Plan Info Card */}
          <div className="md:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Plan</span>
                <h2 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 capitalize mt-1">
                  {billing?.plan} Plan
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    hasSubscription 
                      ? isCanceled 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {hasSubscription ? isCanceled ? 'Canceling' : 'Active' : 'Free Trial'}
                  </span>
                  {billing?.subscriptionPeriodEnd && (
                    <span className="text-xs text-slate-400 font-medium">
                      {isCanceled ? 'Access ends: ' : 'Renews: '} {new Date(billing.subscriptionPeriodEnd).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <Link to="/pricing" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition">
                Change Plan
              </Link>
            </div>

            {hasSubscription && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                {!isCanceled && (
                  <button
                    disabled={canceling}
                    onClick={handleCancel}
                    className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl transition disabled:opacity-50"
                  >
                    {canceling ? 'Processing...' : 'Cancel Subscription'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Usage Quotas Widget */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">Usage Quotas</h3>
            {billing?.usage && Object.entries(billing.usage).map(([key, value]) => {
              const percent = Math.min(100, Math.round((value.used / value.limit) * 100)) || 0;
              const formattedName = key.replace(/([A-Z])/g, ' $1');
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400 capitalize">{formattedName}</span>
                    <span className="text-slate-700 dark:text-slate-300">{value.used} / {value.limit}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice History List */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <h2 className="font-bold text-slate-900 dark:text-white text-base mb-4">Billing History</h2>
          {hasSubscription && !isCanceled ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0 text-sm">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">AI Ebook Studio - Pro Plan (Recurring)</p>
                  <p className="text-xs text-slate-400">Paid today</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 dark:text-slate-200">$19.00</p>
                  <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 font-semibold"><CheckCircle2 size={12} /> Paid</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Billing history will appear here.</p>
          )}
        </div>

      </div>
    </div>
  );
}
