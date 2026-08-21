import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { triggerToast } from '../utils/helpers';
import { X, RefreshCw, Calendar, Check, ArrowLeft, Eye, SplitSquareHorizontal, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VersionHistoryPanel({ chapterId, currentContent, onRestoreComplete, onClose }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionContent, setVersionContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [diffMode, setDiffMode] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/chapters/${chapterId}/versions`);
      setVersions(res.data);
    } catch {
      triggerToast('Failed to load version history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [chapterId]);

  const handleSelectVersion = async (version) => {
    setLoadingContent(true);
    setSelectedVersion(version);
    setDiffMode(false);
    try {
      const res = await API.get(`/chapters/versions/${version._id}`);
      setVersionContent(res.data.content);
    } catch {
      triggerToast('Failed to load version content.', 'error');
      setSelectedVersion(null);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedVersion) return;
    if (!window.confirm(`Restore Version ${selectedVersion.versionNumber}? This will save your current editor state as a new version checkpoint.`)) return;

    setRestoring(true);
    try {
      const res = await API.post(`/chapters/versions/${selectedVersion._id}/restore`);
      triggerToast(res.data.message);
      onRestoreComplete(res.data.chapter.markdownContent);
      onClose();
    } catch {
      triggerToast('Failed to restore version.', 'error');
    } finally {
      setRestoring(false);
    }
  };

  // Safe visual line diff algorithm
  const getDiffLines = () => {
    const oldLines = (versionContent || '').split('\n');
    const newLines = (currentContent || '').split('\n');
    const result = [];
    let i = 0, j = 0;

    while (i < oldLines.length || j < newLines.length) {
      if (i < oldLines.length && j < newLines.length) {
        if (oldLines[i] === newLines[j]) {
          result.push({ type: 'unchanged', text: oldLines[i] });
          i++;
          j++;
        } else {
          if (newLines.includes(oldLines[i])) {
            result.push({ type: 'added', text: newLines[j] });
            j++;
          } else if (oldLines.includes(newLines[j])) {
            result.push({ type: 'removed', text: oldLines[i] });
            i++;
          } else {
            result.push({ type: 'removed', text: oldLines[i] });
            result.push({ type: 'added', text: newLines[j] });
            i++;
            j++;
          }
        }
      } else if (i < oldLines.length) {
        result.push({ type: 'removed', text: oldLines[i] });
        i++;
      } else if (j < newLines.length) {
        result.push({ type: 'added', text: newLines[j] });
        j++;
      }
    }
    return result;
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 220 }}
      className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedVersion && (
            <button 
              onClick={() => setSelectedVersion(null)} 
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
              aria-label="Back to timeline list"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <h2 className="font-bold text-slate-900 dark:text-white">
            {selectedVersion ? `Version ${selectedVersion.versionNumber}` : 'Version History'}
          </h2>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500" aria-label="Close history panel">
          <X size={18} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : !selectedVersion ? (
          /* Timeline view */
          versions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No checkpoints recorded yet. Save changes to begin tracking.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 pl-6 space-y-8">
              {versions.map((ver) => (
                <div key={ver._id} className="relative group">
                  {/* Timeline point */}
                  <span className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-500" />
                  
                  <button
                    onClick={() => handleSelectVersion(ver)}
                    className="w-full text-left bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/30 transition"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 dark:text-white text-sm">Version {ver.versionNumber}</span>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">
                        {ver.source}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(ver.createdAt).toLocaleTimeString()}</span>
                      <span>{ver.wordCount || 0} words</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Detailed Version Preview / Diff view */
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="text-xs text-slate-400 font-medium">
                Created: {new Date(selectedVersion.createdAt).toLocaleString()}<br />
                Words: {selectedVersion.wordCount || 0} ({selectedVersion.source})
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDiffMode(!diffMode)}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition ${
                    diffMode 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <SplitSquareHorizontal size={14} /> Compare Diff
                </button>
                <button
                  disabled={restoring}
                  onClick={handleRestore}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1 disabled:opacity-50"
                >
                  <Check size={14} /> Restore
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200/50 dark:border-slate-800/80 overflow-y-auto text-sm font-mono whitespace-pre-wrap select-text">
              {loadingContent ? (
                <div className="h-full flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : diffMode ? (
                /* Colored Diff Markup */
                <div className="space-y-1">
                  {getDiffLines().map((line, idx) => (
                    <div 
                      key={idx} 
                      className={`px-1.5 py-0.5 rounded ${
                        line.type === 'added' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-l-2 border-emerald-500' 
                          : line.type === 'removed' 
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 line-through border-l-2 border-rose-500' 
                            : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="select-none mr-2 font-bold opacity-40">
                        {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                      </span>
                      {line.text || ' '}
                    </div>
                  ))}
                </div>
              ) : (
                /* Simple raw text markdown content */
                versionContent || <span className="text-slate-400 italic">Empty checkpoint content.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
