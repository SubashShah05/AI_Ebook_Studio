import React from 'react';
import { Download } from 'lucide-react';

export default function Exports() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Download className="text-indigo-500" /> My Exports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and download your exported eBooks.</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
        <Download size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No exports yet</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          When you export your books to PDF, EPUB, or Word, they will appear here for easy access and downloading.
        </p>
      </div>
    </div>
  );
}
