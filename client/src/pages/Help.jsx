import React from 'react';
import { HelpCircle, Book, MessageCircle, Mail, ExternalLink } from 'lucide-react';

export default function Help() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <HelpCircle className="text-indigo-500" /> Help & Support
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Get assistance, read documentation, or contact our support team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Knowledge Base */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Book size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
            Knowledge Base <ExternalLink size={16} className="text-slate-400" />
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Browse our comprehensive guides and tutorials to learn how to make the most out of AI Ebook Studio.
          </p>
        </div>

        {/* Community Forum */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
            Community Forum <ExternalLink size={16} className="text-slate-400" />
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Connect with other authors, share your experiences, and get tips from the community.
          </p>
        </div>

      </div>

      {/* Contact Support */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-500/30 text-center">
        <Mail size={40} className="mx-auto text-indigo-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Still need help?</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-lg mx-auto">
          Our support team is always ready to help you with any technical issues or account questions you might have.
        </p>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-lg shadow-indigo-500/30">
          Contact Support
        </button>
      </div>

    </div>
  );
}
