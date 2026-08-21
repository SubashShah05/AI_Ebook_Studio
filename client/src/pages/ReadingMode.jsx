import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import BookCover from '../components/BookCover';
import {
  X, ChevronLeft, ChevronRight, Moon, Sun, BookOpen,
  AlignJustify, List, Loader2, AlertTriangle, ArrowLeft
} from 'lucide-react';

// ─── Custom Markdown Components (sanitized, no XSS) ─────────────────────────
const mdComponents = {
  // Strip any dangerous elements; only render safe HTML
  script: () => null,
  iframe: () => null,
  object: () => null,
  h1: ({ children }) => <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-10 mb-4 leading-tight">{children}</h1>,
  h2: ({ children }) => <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-3">{children}</h2>,
  h3: ({ children }) => <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mt-6 mb-2">{children}</h3>,
  p: ({ children }) => <p className="text-slate-700 dark:text-slate-300 leading-[1.85] mb-5 text-[16px]">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-outside pl-6 mb-5 space-y-1 text-slate-700 dark:text-slate-300">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-outside pl-6 mb-5 space-y-1 text-slate-700 dark:text-slate-300">{children}</ol>,
  li: ({ children }) => <li className="leading-[1.75] text-[15px]">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-indigo-400 pl-5 py-1 my-5 italic text-slate-600 dark:text-slate-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-r-lg">{children}</blockquote>
  ),
  code: ({ inline, children }) => inline
    ? <code className="bg-slate-100 dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded text-[13px] font-mono">{children}</code>
    : <pre className="bg-slate-900 text-slate-100 rounded-xl p-5 overflow-x-auto my-5 text-sm font-mono"><code>{children}</code></pre>,
  hr: () => <hr className="border-slate-200 dark:border-slate-700 my-8" />,
  strong: ({ children }) => <strong className="font-bold text-slate-800 dark:text-slate-100">{children}</strong>,
  em: ({ children }) => <em className="italic text-slate-700 dark:text-slate-300">{children}</em>,
  a: ({ href, children }) => (
    <a href={href} rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline" target="_blank">{children}</a>
  ),
};

export default function ReadingMode() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const contentRef = useRef(null);
  const chapterRefs = useRef([]);

  // Load book data
  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/export/${bookId}`);
        setBook(res.data.book);
        // Include all chapters with content (completed)
        setChapters(res.data.chapters || []);
      } catch {
        // fallback: try direct book endpoint
        try {
          const res = await API.get(`/books/${bookId}`);
          setBook(res.data);
          setChapters((res.data.chapters || []).filter(ch => ch.markdownContent).sort((a, b) => a.order - b.order));
        } catch {
          setBook(null);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookId]);

  // Scroll progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) setScrollProgress((scrollTop / docHeight) * 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top when chapter changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setScrollProgress(0);
  }, [currentChapterIndex]);

  const goToChapter = useCallback((index) => {
    setCurrentChapterIndex(index);
    setTocOpen(false);
  }, []);

  const currentChapter = chapters[currentChapterIndex];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  if (!book) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <AlertTriangle className="w-10 h-10 text-rose-500" />
      <p className="text-slate-600">Book not found.</p>
      <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline text-sm">← Go Back</button>
    </div>
  );

  if (chapters.length === 0) return (
    <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      <BookOpen className="w-12 h-12 text-slate-300" />
      <h2 className="text-lg font-bold">No chapters ready yet</h2>
      <p className="text-slate-500 text-sm">Generate and complete chapters before reading.</p>
      <Link to={`/books/${bookId}`} className="text-indigo-600 hover:underline text-sm">← Back to Workspace</Link>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-slate-900' : 'bg-[#fafafa]'}`}>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-slate-200 dark:bg-slate-800">
        <motion.div
          className="h-full bg-indigo-500"
          style={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className={`fixed top-0.5 left-0 right-0 z-40 border-b transition-colors duration-200 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={`/books/${bookId}`}
              className={`p-2 rounded-lg shrink-0 transition ${darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              aria-label="Exit reading mode"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <p className={`text-xs font-medium truncate ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Reading Mode</p>
              <p className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{book.title}</p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* TOC toggle */}
            <button
              onClick={() => setTocOpen(o => !o)}
              className={`p-2 rounded-lg transition ${darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              aria-label="Table of contents"
            >
              <List size={18} />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(d => !d)}
              className={`p-2 rounded-lg transition ${darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Exit Reading Mode */}
            <Link
              to={`/books/${bookId}`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
            >
              <X size={14} /> Exit
            </Link>
          </div>
        </div>
      </header>

      {/* TOC Drawer */}
      <AnimatePresence>
        {tocOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/30"
              onClick={() => setTocOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed left-0 top-0 bottom-0 z-40 w-80 max-w-[90vw] ${darkMode ? 'bg-slate-900 border-r border-slate-800' : 'bg-white border-r border-slate-200'} overflow-y-auto shadow-2xl`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>Contents</h2>
                  <button onClick={() => setTocOpen(false)} className={`p-2 rounded-lg ${darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`} aria-label="Close">
                    <X size={18} />
                  </button>
                </div>

                {/* Book Cover in TOC */}
                <div className="flex justify-center mb-6">
                  <BookCover title={book.title} subtitle={book.subtitle} author={book.author} genre={book.genre} coverStyle={book.coverStyle || 'modern'} size="md" />
                </div>

                {/* Chapter list */}
                <nav aria-label="Table of contents">
                  {chapters.map((ch, i) => (
                    <button
                      key={ch._id}
                      onClick={() => goToChapter(i)}
                      className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl transition mb-1 ${
                        i === currentChapterIndex
                          ? 'bg-indigo-600 text-white'
                          : darkMode
                          ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className={`text-xs font-black mt-0.5 shrink-0 ${i === currentChapterIndex ? 'text-indigo-200' : 'text-indigo-500'}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm font-semibold leading-snug">{ch.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Reading Content */}
      <main className="pt-16" ref={contentRef}>
        {/* Book Cover Section (shown only on first chapter) */}
        {currentChapterIndex === 0 && (
          <div className={`py-16 text-center border-b ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-white'}`}>
            <div className="max-w-4xl mx-auto px-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10">
                <div className="shrink-0">
                  <BookCover title={book.title} subtitle={book.subtitle} author={book.author} genre={book.genre} coverStyle={book.coverStyle || 'modern'} size="xl" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">{book.genre || 'Ebook'}</p>
                  <h1 className={`text-4xl font-black leading-tight mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{book.title}</h1>
                  {book.subtitle && <p className={`text-lg italic mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{book.subtitle}</p>}
                  <p className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>by {book.author}</p>
                  {book.description && (
                    <p className={`text-sm mt-4 leading-relaxed max-w-md ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{book.description}</p>
                  )}
                  <div className={`flex items-center gap-6 mt-5 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span>{chapters.length} chapters</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chapter Content */}
        {currentChapter && (
          <motion.div
            key={currentChapterIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-3xl mx-auto px-6 py-12"
          >
            {/* Chapter indicator */}
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-[0.15em] mb-3">
              Chapter {currentChapterIndex + 1} of {chapters.length}
            </p>

            {/* Chapter title */}
            <h2 className={`text-3xl sm:text-4xl font-black leading-tight mb-8 pb-6 border-b ${darkMode ? 'text-white border-slate-800' : 'text-slate-900 border-slate-200'}`}>
              {currentChapter.title}
            </h2>

            {/* Chapter body - safe ReactMarkdown rendering */}
            <article className={`leading-relaxed ${darkMode ? 'dark' : ''}`}>
              <ReactMarkdown components={mdComponents}>
                {currentChapter.markdownContent || '*No content available for this chapter.*'}
              </ReactMarkdown>
            </article>

            {/* Chapter navigation */}
            <div className={`flex items-center justify-between mt-16 pt-8 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={() => goToChapter(currentChapterIndex - 1)}
                disabled={currentChapterIndex === 0}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed ${
                  darkMode
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                aria-label="Previous chapter"
              >
                <ChevronLeft size={18} />
                <span className="hidden sm:inline">
                  {currentChapterIndex > 0 ? chapters[currentChapterIndex - 1].title : 'Previous'}
                </span>
                <span className="sm:hidden">Previous</span>
              </button>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Chapter progress">
                {chapters.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === currentChapterIndex}
                    onClick={() => goToChapter(i)}
                    className={`rounded-full transition-all ${
                      i === currentChapterIndex
                        ? 'w-6 h-2 bg-indigo-500'
                        : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-indigo-300'
                    }`}
                    aria-label={`Go to chapter ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => goToChapter(currentChapterIndex + 1)}
                disabled={currentChapterIndex === chapters.length - 1}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed ${
                  darkMode
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                aria-label="Next chapter"
              >
                <span className="hidden sm:inline">
                  {currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1].title : 'Next'}
                </span>
                <span className="sm:hidden">Next</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
