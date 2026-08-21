import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import { triggerToast } from '../utils/helpers';
import BookCover from '../components/BookCover';
import {
  FileText, Download, Loader2, CheckCircle2, AlertTriangle,
  ArrowLeft, BookOpen, FileDown, AlignLeft, Hash, User,
  BookMarked, Layers, Eye, ChevronDown, ChevronRight, X
} from 'lucide-react';

// ─── PDF export via html2pdf.js ─────────────────────────────────────────────
const generatePDFHTML = (book, chapters, opts) => {
  const chapterHtml = chapters.map((ch, i) => `
    <div class="chapter" style="page-break-before:always;padding:60px 72px;">
      <p style="font-size:12px;color:#6366f1;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">
        Chapter ${i + 1}
      </p>
      <h2 style="font-size:28px;font-weight:900;color:#0f172a;margin:0 0 32px 0;line-height:1.2;">${ch.title}</h2>
      <div class="chapter-content">${markdownToHtml(ch.markdownContent)}</div>
    </div>
  `).join('');

  const tocHtml = opts.includeToc ? `
    <div style="page-break-before:always;padding:60px 72px;">
      <h2 style="font-size:24px;font-weight:900;color:#0f172a;margin-bottom:32px;border-bottom:2px solid #e2e8f0;padding-bottom:16px;">
        Table of Contents
      </h2>
      ${chapters.map((ch, i) => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f1f5f9;">
          <span style="font-size:14px;font-weight:700;color:#6366f1;min-width:32px;">${String(i + 1).padStart(2, '0')}</span>
          <span style="font-size:15px;color:#334155;flex:1;">${ch.title}</span>
        </div>
      `).join('')}
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Georgia', serif; color: #1e293b; background: #fff; }
        h1,h2,h3,h4 { font-family: 'Arial', sans-serif; }
        .chapter-content h1 { font-size:22px; font-weight:700; color:#0f172a; margin:24px 0 12px; }
        .chapter-content h2 { font-size:19px; font-weight:700; color:#1e293b; margin:20px 0 10px; }
        .chapter-content h3 { font-size:16px; font-weight:600; color:#334155; margin:16px 0 8px; }
        .chapter-content p { font-size:14px; line-height:1.8; color:#334155; margin-bottom:16px; }
        .chapter-content ul, .chapter-content ol { padding-left:24px; margin-bottom:16px; }
        .chapter-content li { font-size:14px; line-height:1.7; margin-bottom:6px; color:#334155; }
        .chapter-content code { font-family:monospace; background:#f1f5f9; padding:2px 6px; border-radius:3px; font-size:12px; color:#7c3aed; }
        .chapter-content pre { background:#f8fafc; border:1px solid #e2e8f0; padding:16px; border-radius:6px; margin:16px 0; overflow:hidden; }
        .chapter-content pre code { background:none; padding:0; color:#334155; font-size:12px; }
        .chapter-content blockquote { border-left:4px solid #6366f1; padding-left:16px; color:#64748b; font-style:italic; margin:16px 0; }
        .chapter-content strong { font-weight:700; color:#0f172a; }
        .chapter-content em { font-style:italic; }
        .chapter-content hr { border:none; border-top:1px solid #e2e8f0; margin:24px 0; }
        @page { margin: 0; size: ${opts.pageSize || 'A4'}; }
      </style>
    </head>
    <body>
      <!-- Cover page -->
      <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:80px 60px;text-align:center;">
        <div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:60px 48px;max-width:480px;width:100%;">
          ${book.genre ? `<p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c4b5fd;font-weight:700;margin-bottom:20px;">${book.genre}</p>` : ''}
          <h1 style="font-size:38px;font-weight:900;color:#fff;line-height:1.15;margin-bottom:16px;">${book.title}</h1>
          ${book.subtitle ? `<p style="font-size:16px;color:#c4b5fd;font-style:italic;margin-bottom:32px;">${book.subtitle}</p>` : `<div style="margin-bottom:32px;"></div>`}
          <p style="font-size:14px;color:#a5b4fc;font-weight:600;">${book.author || ''}</p>
        </div>
      </div>
      ${tocHtml}
      ${chapterHtml}
    </body>
    </html>
  `;
};

// Simple markdown → HTML converter (no dependencies needed)
const markdownToHtml = (md) => {
  if (!md) return '';
  let html = md
    // Code blocks
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Headings
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    // Unordered lists
    .replace(/^[-*] (.+)/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)/gm, '<li>$1</li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p>')
    // Single newline
    .replace(/\n/g, '<br>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*?<\/li>(\s*<br>)*)+/gs, match =>
    `<ul>${match.replace(/<br>/g, '')}</ul>`
  );

  return `<p>${html}</p>`;
};

// ─── Format Cards ────────────────────────────────────────────────────────────
const FORMATS = [
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Print-ready document with cover, table of contents, and styled chapters.',
    icon: FileDown,
    ext: 'pdf',
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-200 dark:border-rose-800',
    accent: '#e11d48',
  },
  {
    id: 'markdown',
    label: 'Markdown',
    description: 'Portable .md source file preserving all original markup.',
    icon: AlignLeft,
    ext: 'md',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    accent: '#4f46e5',
  },
  {
    id: 'docx',
    label: 'DOCX',
    description: 'Editable Microsoft Word document with headings and chapter structure.',
    icon: FileText,
    ext: 'docx',
    color: 'text-sky-600',
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    border: 'border-sky-200 dark:border-sky-800',
    accent: '#0284c7',
  },
];

const EXPORT_STEPS = [
  'Collecting chapters...',
  'Formatting document...',
  'Generating file...',
  'Finalizing...',
  'Almost ready...',
];

export default function ExportStudio() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [exportData, setExportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [exporting, setExporting] = useState(false);
  const [exportStep, setExportStep] = useState(0);
  const [exportDone, setExportDone] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [sessionExports, setSessionExports] = useState([]);
  const exportingRef = useRef(false);

  // Options
  const [opts, setOpts] = useState({
    includeCover: true,
    includeToc: true,
    includeChapterNumbers: true,
    includeAuthor: true,
    pageSize: 'A4',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/export/${bookId}`);
        setExportData(res.data);
      } catch (err) {
        triggerToast('Failed to load book data', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookId]);

  const simulateProgress = useCallback(() => {
    let step = 0;
    setExportStep(0);
    const interval = setInterval(() => {
      step++;
      if (step < EXPORT_STEPS.length) setExportStep(step);
      else clearInterval(interval);
    }, 600);
    return interval;
  }, []);

  const handleExport = useCallback(async () => {
    if (exportingRef.current) return;
    if (!exportData || exportData.completedChapters === 0) {
      triggerToast('No completed chapters to export. Generate chapters first.', 'error');
      return;
    }

    exportingRef.current = true;
    setExporting(true);
    setExportDone(false);
    setExportError(null);
    const progressInterval = simulateProgress();

    try {
      const token = JSON.parse(localStorage.getItem('ebook_user') || '{}').token;

      if (selectedFormat === 'markdown') {
        // Server-side markdown download
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/export/${bookId}/markdown`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error('Markdown export failed');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-ebook-studio-${exportData.book.title.toLowerCase().replace(/\s+/g, '-')}.md`;
        a.click();
        URL.revokeObjectURL(url);

      } else if (selectedFormat === 'docx') {
        // Server-side DOCX download
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/export/${bookId}/docx`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'DOCX export failed');
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-ebook-studio-${exportData.book.title.toLowerCase().replace(/\s+/g, '-')}.docx`;
        a.click();
        URL.revokeObjectURL(url);

      } else {
        // Client-side PDF using html2pdf.js
        const html2pdf = (await import('html2pdf.js')).default;
        const htmlContent = generatePDFHTML(exportData.book, exportData.chapters, opts);

        // Log PDF export activity to server
        await API.post(`/export/${bookId}/log`, { format: 'pdf' }).catch(err => console.error(err));

        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        document.body.appendChild(container);

        const filename = `ai-ebook-studio-${exportData.book.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;

        await html2pdf()
          .set({
            margin: 0,
            filename,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: opts.pageSize.toLowerCase(), orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] },
          })
          .from(container)
          .save();

        document.body.removeChild(container);
      }

      clearInterval(progressInterval);
      setExportStep(EXPORT_STEPS.length - 1);
      setExportDone(true);

      const newExport = { format: selectedFormat.toUpperCase(), time: new Date().toLocaleTimeString(), status: 'Ready' };
      setSessionExports(prev => [newExport, ...prev].slice(0, 5));
      triggerToast(`${selectedFormat.toUpperCase()} exported successfully!`);

    } catch (err) {
      clearInterval(progressInterval);
      console.error('Export error:', err);
      setExportError(err.message || 'Export failed');
      triggerToast('Export failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setExporting(false);
      exportingRef.current = false;
    }
  }, [exportData, selectedFormat, opts, bookId, simulateProgress]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f1523]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  if (!exportData) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <AlertTriangle className="w-10 h-10 text-rose-500" />
      <p className="text-slate-600">Failed to load book data.</p>
      <Link to="/books" className="text-indigo-600 hover:underline text-sm">← Back to My Books</Link>
    </div>
  );

  const { book, chapters, totalWordCount, completedChapters } = exportData;
  const estimatedPages = Math.max(1, Math.round(totalWordCount / 250));
  const selectedFmt = FORMATS.find(f => f.id === selectedFormat);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1523] pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <Link to={`/books/${bookId}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition mb-4">
            <ArrowLeft size={16} /> Back to Workspace
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Export Your Ebook</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Choose a format and prepare your book for download.</p>
            </div>
            <Link
              to={`/books/${bookId}/read`}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
            >
              <Eye size={16} /> Reading Mode
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: Format selection + Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format Cards */}
            <div>
              <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Choose Format</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FORMATS.map((fmt) => {
                  const IconComp = fmt.icon;
                  const isActive = selectedFormat === fmt.id;
                  return (
                    <motion.button
                      key={fmt.id}
                      whileHover={{ y: -2 }}
                      onClick={() => { setSelectedFormat(fmt.id); setExportDone(false); setExportError(null); }}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isActive
                          ? `${fmt.bg} ${fmt.border} shadow-sm`
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700'
                      }`}
                      aria-pressed={isActive}
                    >
                      {isActive && <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ backgroundColor: fmt.accent }} />}
                      <IconComp size={22} className={`mb-3 ${isActive ? fmt.color : 'text-slate-400'}`} />
                      <p className={`font-bold text-base mb-1 ${isActive ? fmt.color : 'text-slate-700 dark:text-slate-200'}`}>{fmt.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{fmt.description}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Options */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Export Options</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'includeCover', label: 'Include Cover Page', desc: 'Title, author, genre' },
                  { key: 'includeToc', label: 'Table of Contents', desc: 'Chapter list with numbers', disabled: selectedFormat === 'markdown' },
                  { key: 'includeChapterNumbers', label: 'Chapter Numbers', desc: 'Show "Chapter 1", "Chapter 2"...' },
                  { key: 'includeAuthor', label: 'Author Name', desc: 'Display author on cover' },
                ].map(({ key, label, desc, disabled }) => (
                  <label
                    key={key}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition ${
                      disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={opts[key]}
                      disabled={disabled}
                      onChange={e => setOpts(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="w-4 h-4 mt-0.5 accent-indigo-600 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {selectedFormat === 'pdf' && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 block mb-2">Page Size</label>
                  <div className="flex gap-2">
                    {['A4', 'Letter'].map(size => (
                      <button
                        key={size}
                        onClick={() => setOpts(prev => ({ ...prev, pageSize: size }))}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-lg border transition ${
                          opts.pageSize === size
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Export Button + Progress */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
              {exportError && (
                <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl mb-4 text-sm text-rose-700 dark:text-rose-400">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{exportError}</span>
                </div>
              )}

              {completedChapters === 0 && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-4 text-sm text-amber-700 dark:text-amber-400">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>Complete at least one chapter before exporting.</span>
                </div>
              )}

              <AnimatePresence mode="wait">
                {exporting ? (
                  <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <Loader2 size={18} className="animate-spin text-indigo-600 shrink-0" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {EXPORT_STEPS[exportStep]}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-indigo-600 rounded-full"
                        animate={{ width: `${((exportStep + 1) / EXPORT_STEPS.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                ) : exportDone ? (
                  <motion.div key="done" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">Your ebook is ready!</p>
                        <p className="text-xs text-slate-500">File downloaded to your device</p>
                      </div>
                    </div>
                    <button
                      onClick={handleExport}
                      className="px-4 py-2 text-sm font-bold text-indigo-600 border border-indigo-200 dark:border-indigo-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
                    >
                      Export Again
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="export-btn"
                    onClick={handleExport}
                    disabled={completedChapters === 0}
                    className="w-full py-3 font-bold text-white rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: selectedFmt?.accent || '#4f46e5' }}
                    whileHover={{ scale: completedChapters > 0 ? 1.01 : 1 }}
                    whileTap={{ scale: completedChapters > 0 ? 0.99 : 1 }}
                  >
                    <Download size={18} />
                    Export as {selectedFormat.toUpperCase()}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Session Export History */}
            {sessionExports.length > 0 && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Recent Exports</h2>
                <div className="space-y-2">
                  {sessionExports.map((exp, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 px-2 py-0.5 rounded">{exp.format}</span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">Today, {exp.time}</span>
                      </div>
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={12} /> {exp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Book Preview */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Book Preview</h2>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col items-center">
              <BookCover
                title={book.title}
                subtitle={book.subtitle}
                author={book.author}
                genre={book.genre}
                coverStyle={book.coverStyle || 'modern'}
                size="lg"
              />
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Title</p>
                <p className="font-bold text-slate-800 dark:text-white text-sm">{book.title}</p>
              </div>
              {book.subtitle && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Subtitle</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 italic">{book.subtitle}</p>
                </div>
              )}
              {[
                { label: 'Chapters', value: `${completedChapters} completed` },
                { label: 'Word Count', value: totalWordCount.toLocaleString() },
                { label: 'Est. Pages', value: `~${estimatedPages} pages` },
                { label: 'Format', value: selectedFormat.toUpperCase() },
                { label: 'Page Size', value: selectedFormat === 'pdf' ? opts.pageSize : 'N/A' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
