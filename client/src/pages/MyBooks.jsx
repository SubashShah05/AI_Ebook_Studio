import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import { triggerToast } from '../utils/helpers';
import BookCover from '../components/BookCover';
import { 
  Search, LayoutGrid, List, Plus, MoreVertical, Copy, Archive, 
  RotateCcw, Trash2, Edit3, Loader2, BookOpen, Filter, SortAsc, 
  ChevronDown, CheckCircle2, AlertTriangle, AlertCircle, Clock, Star
} from 'lucide-react';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-700', icon: Edit3 },
  generating: { label: 'Generating', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Loader2 },
  ready: { label: 'Ready', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30', icon: AlertTriangle },
};

function BookMenu({ book, onDuplicate, onArchive, onRestore, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Book options">
        <MoreVertical size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 top-8 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 py-1 overflow-hidden"
          >
            <Link to={`/books/${book._id}`} className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 w-full" onClick={() => setOpen(false)}>
              <BookOpen size={14} /> Open Workspace
            </Link>
            <button onClick={() => { onDuplicate(book._id); setOpen(false); }} className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 w-full text-left">
              <Copy size={14} /> Duplicate
            </button>
            <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
            {book.isArchived ? (
              <button onClick={() => { onRestore(book._id); setOpen(false); }} className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 w-full text-left">
                <RotateCcw size={14} /> Restore
              </button>
            ) : (
              <button onClick={() => { onArchive(book._id); setOpen(false); }} className="flex items-center gap-2.5 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 w-full text-left">
                <Archive size={14} /> Archive
              </button>
            )}
            <button onClick={() => { onDelete(book._id); setOpen(false); }} className="flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 w-full text-left">
              <Trash2 size={14} /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BookGridCard({ book, onDuplicate, onArchive, onRestore, onDelete }) {
  const navigate = useNavigate();
  const cfg = STATUS_CONFIG[book.status] || STATUS_CONFIG.draft;
  const IconComp = cfg.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all duration-200 group flex flex-col cursor-pointer"
      onClick={() => navigate(`/books/${book._id}`)}
    >
      <div className="h-40 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden" onClick={e => e.stopPropagation()}>
        <BookCover
          title={book.title}
          subtitle={book.subtitle}
          author={book.coverAuthor || book.author}
          genre={book.genre}
          coverStyle={book.coverStyle || 'modern'}
          size="md"
        />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight line-clamp-2">{book.title}</h3>
          <div onClick={e => e.stopPropagation()}>
            <BookMenu book={book} onDuplicate={onDuplicate} onArchive={onArchive} onRestore={onRestore} onDelete={onDelete} />
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 flex-1">{book.description || 'No description'}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
            <IconComp size={10} className={book.status === 'generating' ? 'animate-spin' : ''} />
            {cfg.label}
          </span>
          <span className="text-[10px] text-slate-400">{book.chapterCount || 0} ch</span>
        </div>
      </div>
    </motion.div>
  );
}

function BookListRow({ book, onDuplicate, onArchive, onRestore, onDelete }) {
  const navigate = useNavigate();
  const cfg = STATUS_CONFIG[book.status] || STATUS_CONFIG.draft;
  const IconComp = cfg.icon;
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-4 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all cursor-pointer"
      onClick={() => navigate(`/books/${book._id}`)}
    >
      <div onClick={e => e.stopPropagation()} className="shrink-0">
        <BookCover title={book.title} coverStyle={book.coverStyle || 'modern'} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{book.title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{book.genre || 'No genre'} • {book.chapterCount || 0} chapters</p>
      </div>
      <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${cfg.bg} ${cfg.color}`}>
        <IconComp size={10} className={book.status === 'generating' ? 'animate-spin' : ''} />
        {cfg.label}
      </span>
      <span className="hidden md:block text-xs text-slate-400 shrink-0 w-28 text-right">
        {new Date(book.updatedAt).toLocaleDateString()}
      </span>
      <div onClick={e => e.stopPropagation()} className="shrink-0">
        <BookMenu book={book} onDuplicate={onDuplicate} onArchive={onArchive} onRestore={onRestore} onDelete={onDelete} />
      </div>
    </motion.div>
  );
}

export default function MyBooks() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('booksViewMode') || 'grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [showArchived, setShowArchived] = useState(false);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (showArchived) params.set('archived', 'true');
      if (sort !== 'recent') params.set('sort', sort);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await API.get(`/books/manage/list?${params.toString()}`);
      setBooks(res.data);
    } catch (err) {
      triggerToast('Failed to load books', 'error');
    } finally {
      setLoading(false);
    }
  }, [showArchived, sort, statusFilter]);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('booksViewMode', mode);
  };

  const filteredBooks = books.filter(b => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return b.title.toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q) || (b.genre || '').toLowerCase().includes(q);
  });

  const handleDuplicate = async (bookId) => {
    try {
      const res = await API.post(`/books/${bookId}/duplicate`);
      triggerToast(`"${res.data.title}" created`);
      loadBooks();
    } catch { triggerToast('Duplication failed', 'error'); }
  };

  const handleArchive = async (bookId) => {
    try {
      await API.put(`/books/${bookId}/archive`);
      triggerToast('Book archived');
      loadBooks();
    } catch { triggerToast('Archive failed', 'error'); }
  };

  const handleRestore = async (bookId) => {
    try {
      await API.put(`/books/${bookId}/restore`);
      triggerToast('Book restored');
      loadBooks();
    } catch { triggerToast('Restore failed', 'error'); }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Permanently delete this book and all its chapters? This cannot be undone.')) return;
    try {
      await API.delete(`/books/${bookId}`);
      triggerToast('Book deleted');
      setBooks(prev => prev.filter(b => b._id !== bookId));
    } catch { triggerToast('Delete failed', 'error'); }
  };

  const bookProps = { onDuplicate: handleDuplicate, onArchive: handleArchive, onRestore: handleRestore, onDelete: handleDelete };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1523] pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{showArchived ? 'Archived Books' : 'My Books'}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowArchived(a => !a)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl border transition ${showArchived ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300'}`}
            >
              <Archive size={14} className="inline mr-1.5" />{showArchived ? 'View Active' : 'View Archived'}
            </button>
            <button onClick={() => navigate('/create')} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 shadow-sm">
              <Plus size={16} /> New Book
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search books..."
              className="w-full pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          {!showArchived && (
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="generating">Generating</option>
              <option value="ready">Ready</option>
              <option value="failed">Failed</option>
            </select>
          )}

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="recent">Recently Updated</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="alphabetical">A–Z</option>
          </select>

          {/* View Mode */}
          <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
            <button onClick={() => handleViewModeChange('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`} aria-label="Grid view">
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => handleViewModeChange('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`} aria-label="List view">
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Book List/Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
              {showArchived ? 'No archived books' : search ? `No results for "${search}"` : 'No books yet'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              {!showArchived && !search && 'Create your first AI-powered ebook to get started.'}
            </p>
            {!showArchived && !search && (
              <button onClick={() => navigate('/create')} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-sm">
                Create Book
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredBooks.map(book => (
              <BookGridCard key={book._id} book={book} {...bookProps} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBooks.map(book => (
              <BookListRow key={book._id} book={book} {...bookProps} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
