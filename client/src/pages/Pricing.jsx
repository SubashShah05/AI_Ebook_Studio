import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { triggerToast } from '../utils/helpers';
import { PLANS } from '../utils/plans';
import { Check, X, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.35 } }),
};

export default function Pricing() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await API.get('/billing/status');
        setCurrentPlan(res.data.plan);
      } catch {
        // Fallback default
      }
    };
    fetchStatus();
  }, []);

  const handleUpgrade = async (planId) => {
    if (planId === currentPlan) {
      triggerToast('You are already on this plan.', 'info');
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/billing/checkout', { plan: planId });
      triggerToast(res.data.message);
      setCurrentPlan(planId);
      navigate('/billing');
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Checkout failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const planKeys = ['free', 'pro', 'business'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1523] pb-16">
      {/* Dev Mode Notification */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center justify-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
        <ShieldAlert size={14} className="shrink-0" />
        <span>Development Mode: Upgrading simulates plan changes instantly without real payments.</span>
      </div>

      {/* Header */}
      <div className="text-center py-16 px-6">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3">Pricing Plans</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">
          Start with a structure designed for your kind of book and upgrade as you grow.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-12">
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planKeys.map((key, i) => {
            const plan = PLANS[key];
            const isCurrent = currentPlan === key;
            return (
              <motion.div
                key={key}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className={`bg-white dark:bg-slate-800 border rounded-2xl p-6 flex flex-col justify-between relative shadow-sm hover:shadow-md transition-shadow ${
                  isCurrent 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/10' 
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {key === 'pro' && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Sparkles size={10} /> Popular
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{plan.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 h-10">{plan.description}</p>
                  
                  <div className="my-6">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400 font-semibold ml-1">/ {plan.period}</span>
                  </div>

                  {/* Bullet points */}
                  <ul className="space-y-3 mb-6" aria-label={`Features of ${plan.name} plan`}>
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                        <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleUpgrade(key)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : plan.cta}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Compare Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" aria-label="Subscription plan comparison">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-bold uppercase text-xs">
                  <th className="pb-3 w-1/2">Feature</th>
                  <th className="pb-3 text-center">Free</th>
                  <th className="pb-3 text-center">Pro</th>
                  <th className="pb-3 text-center">Business</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'AI Outline Generation', free: true, pro: true, bus: true },
                  { name: 'Standard Editor & Preview', free: true, pro: true, bus: true },
                  { name: 'PDF Export', free: true, pro: true, bus: true },
                  { name: 'AI Assistant Content Creation', free: false, pro: true, bus: true },
                  { name: 'DOCX & Markdown Export', free: false, pro: true, bus: true },
                  { name: 'Writing Productivity Analytics', free: false, pro: true, bus: true },
                  { name: 'Team Collaboration Features', free: false, pro: 'Coming Soon', bus: 'Coming Soon' },
                  { name: 'Enterprise API Access', free: false, pro: false, bus: 'Coming Soon' }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-700/60 last:border-0 text-slate-700 dark:text-slate-300">
                    <td className="py-3.5 font-medium">{row.name}</td>
                    {[row.free, row.pro, row.bus].map((val, cellIdx) => (
                      <td key={cellIdx} className="py-3.5 text-center font-bold">
                        {val === true && <Check size={16} className="text-emerald-500 mx-auto" />}
                        {val === false && <X size={16} className="text-slate-300 dark:text-slate-600 mx-auto" />}
                        {typeof val === 'string' && <span className="text-xs font-semibold text-amber-500">{val}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
