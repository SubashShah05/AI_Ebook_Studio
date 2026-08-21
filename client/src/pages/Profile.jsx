import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield, BookOpen } from 'lucide-react';

export default function Profile() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <User className="text-indigo-500" /> My Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account information and preferences.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-4xl font-bold uppercase shrink-0">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="pt-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name || 'User'}</h2>
              <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-2 mt-2">
                <Mail size={16} /> {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Account Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 mb-2">
                <Shield size={18} className="text-emerald-500" />
                <span className="font-medium">Role</span>
              </div>
              <p className="text-slate-900 dark:text-white capitalize font-semibold ml-8">
                {user.role || 'User'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 mb-2">
                <BookOpen size={18} className="text-blue-500" />
                <span className="font-medium">Subscription</span>
              </div>
              <p className="text-slate-900 dark:text-white capitalize font-semibold ml-8">
                {user.subscriptionPlan || 'Free'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
