
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { triggerToast } from '../utils/helpers';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js'; // Import html2pdf for client-side conversion
import { ArrowLeft, Wand2, Eye, Edit3, Loader2, Download, FileText, Code } from 'lucide-react';

export default function ChapterEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [markdown, setMarkdown] = useState('');
  const [mode, setMode] = useState('edit'); // edit | preview
  const [syncing, setSyncing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const timerRef = useRef(null);
  const exportRef = useRef(null); // Ref for catching hidden clean preview node for PDF capture

  // YAHAN PAR HAI AAPKA MODIFIED FIX BLOCK:
  useEffect(() => {
    const fetchChapterDetails = async () => {
      try {
        const res = await API.get(`/chapters/${id}`);
        
        if (res.data) {
          const targetChapter = Array.isArray(res.data) ? res.data[0] : res.data;
          setChapter(targetChapter);
          setMarkdown(targetChapter.markdownContent || '');
        } else {
          throw new Error("No data inside chapter payload response.");
        }
        
      } catch (err) {
        console.error("Fetch details error log trace:", err);
        triggerToast('Error reading node workspace content tracking state context', 'error');
      }
    };
    fetchChapterDetails();
  }, [id]);

  const saveWorkspaceProgress = async (updatedContent) => {
    setSyncing(true);
    try {
      await API.put(`/chapters/${id}`, { markdownContent: updatedContent });
    } catch (err) {
      console.error('Auto save runtime tracking synchronization warning parameters error logs.');
    } finally {
      setSyncing(false);
    }
  };

  const handleTextChange = (e) => {
    const value = e.target.value;
    setMarkdown(value);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveWorkspaceProgress(value);
    }, 1500);
  };

  const executeAiGeneration = async () => {
    if (!window.confirm("Trigger AI writing framework tool for this block? This overrides local content setup parameters.")) return;
    setGenerating(true);
    try {
      const res = await API.post('/ai/chapter-write', { chapterId: id });
      setMarkdown(res.data.markdownContent);
      triggerToast('Google Gemini synthesized and generated chapter draft successfully.');
    } catch (err) {
      triggerToast('AI dynamic drafting computation workflow malfunctioned', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // ================= EXPORT ENGINES =================
  
  // 1. Export as Standard Raw Markdown (.md)
  const exportAsMarkdown = () => {
    try {
      const element = document.createElement("a");
      const file = new Blob([markdown], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `${chapter.title.replace(/\s+/g, '_')}_Document.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      triggerToast('Markdown document compiled and downloaded successfully!');
    } catch (error) {
      triggerToast('Failed to compile Markdown asset', 'error');
    }
    setShowExportMenu(false);
  };

  // 2. Export as High-Quality Formatted PDF (.pdf)
  const exportAsPDF = () => {
    try {
      const element = exportRef.current;
      const options = {
        margin:       1,
        filename:     `${chapter.title.replace(/\s+/g, '_')}_Publication.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      triggerToast('Assembling document vectors, printing PDF...');
      html2pdf().set(options).from(element).save();
    } catch (error) {
      triggerToast('PDF printing execution pipeline failed', 'error');
    }
    setShowExportMenu(false);
  };

  if (!chapter) return <div className="p-20 text-center text-sm text-slate-500 dark:text-slate-400">Locating workspace parameters coordinate assets...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col h-[90vh] bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      
      {/* Hidden Div used solely to capture high-res formatted HTML for PDF compiling */}
      <div className="hidden">
        <div ref={exportRef} className="p-10 bg-white text-slate-900 font-sans leading-relaxed space-y-6">
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px' }}>{chapter.title}</h1>
          {chapter.description && <p style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic' }}>{chapter.description}</p>}
          <div style={{ marginTop: '20px' }}>
            <ReactMarkdown>{markdown || '*No core text contents compiled.*'}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Editor Sub-Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <Link to={`/books/${chapter.bookId}`} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{chapter.title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">{chapter.description || 'No focus goal description annotated.'}</p>
          </div>
        </div>

        {/* Workspace Toolbar Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center relative">
          <button 
            onClick={executeAiGeneration} 
            disabled={generating}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />} 
            {generating ? 'Drafting Content...' : 'Generate AI Draft'}
          </button>

          <div className="border-l border-slate-200 dark:border-slate-700 h-6 mx-1" />

          {/* Edit Mode Tab Button */}
          <button 
            onClick={() => setMode('edit')} 
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${mode === 'edit' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Markup Source
          </button>
          
          {/* Live Preview Tab Button */}
          <button 
            onClick={() => setMode('preview')} 
            className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${mode === 'preview' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <Eye className="w-3.5 h-3.5" /> Live Render View
          </button>

          <div className="border-l border-slate-200 dark:border-slate-700 h-6 mx-1" />

          {/* Export Dropdown Button Trigger */}
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Export Asset
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1.5 transition-all">
                <button 
                  onClick={exportAsPDF}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-500" /> Download Print PDF
                </button>
                <button 
                  onClick={exportAsMarkdown}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Code className="w-3.5 h-3.5 text-sky-500" /> Download Markdown
                </button>
              </div>
            )}
          </div>

          {/* Sync Indicators */}
          <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2 font-mono hidden md:inline">
            {syncing ? 'Saving changes...' : 'Cloud in sync'}
          </span>
        </div>
      </div>

      {/* Main Workspace Split-Containers */}
      <div className="flex-grow w-full overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-inner flex transition-colors duration-200">
        {mode === 'edit' ? (
          <textarea
            value={markdown}
            onChange={handleTextChange}
            placeholder="# Write your rich text markdown payload parameters here layout structure..."
            className="w-full h-full p-6 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800 resize-none focus:outline-none block"
          />
        ) : (
          <div className="w-full h-full overflow-y-auto p-8 prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 leading-relaxed space-y-4">
            <ReactMarkdown>{markdown || '*Empty layout preview panel space. Author text string components markup to engage rendering blocks here structure view workspace.*'}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}