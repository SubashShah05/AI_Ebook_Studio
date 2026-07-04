
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import BookCard from '../components/BookCard';
import { useDebounce } from '../hooks/useDebounce';
import { triggerToast } from '../utils/helpers';
import { Plus, Search, Loader2, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 300);

  const fetchBooks = async () => {
    try {
      const res = await API.get('/books');
      setBooks(res.data);
    } catch (err) {
      triggerToast('Error updating book inventory view data status', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this book completely? This actions clears out all nested chapter files.')) return;
    try {
      await API.delete(`/books/${id}`);
      triggerToast('Book completely archived and deleted.');
      setBooks(books.filter(b => b._id !== id));
    } catch (err) {
      triggerToast('Failed to handle entity purge', 'error');
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    (book.subtitle && book.subtitle.toLowerCase().includes(debouncedSearch.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Your Digital Bookshelf</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Generate, edit, and organize your AI structural literature compilation pipeline.</p>
        </div>
        <Link to="/create" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition self-start sm:self-center">
          <Plus className="w-5 h-5" /> Generate eBook
        </Link>
      </div>

      {/* Modern Search Bar */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search by book title or subtitle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition shadow-sm"
        />
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Scanning shelf inventory data...</p>
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <BookCard key={book._id} book={book} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        /* Empty State Placeholder */
        <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center max-w-xl mx-auto mt-12 shadow-sm transition-colors duration-200">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No eBooks Found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6">You haven't generated any items matching your shelf filters yet.</p>
          <Link to="/create" className="inline-block bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-semibold px-4 py-2 rounded-lg transition">
            Create Your First Book
          </Link>
        </div>
      )}
    </div>
  );
}