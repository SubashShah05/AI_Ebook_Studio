import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { triggerToast } from '../utils/helpers';
import BookCover from '../components/BookCover';
import { ArrowLeft, BookOpen, Plus, FolderOpen, Loader2, ExternalLink, Copy } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingBook, setAddingBook] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, booksRes] = await Promise.all([
          API.get(`/projects/${id}`),
          API.get('/books')
        ]);
        setProject(projRes.data);
        setAllBooks(booksRes.data);
      } catch { triggerToast('Failed to load project', 'error'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleAddBook = async (bookId) => {
    try {
      await API.put(`/books/${bookId}/assign-project`, { projectId: id });
      triggerToast('Book added to project');
      // Re-fetch project to get updated books list
      const res = await API.get(`/projects/${id}`);
      setProject(res.data);
    } catch { triggerToast('Failed to add book', 'error'); }
  };

  const handleRemoveBook = async (bookId) => {
    try {
      await API.put(`/books/${bookId}/assign-project`, { projectId: null });
      triggerToast('Book removed from project');
      setProject(prev => ({ ...prev, books: prev.books.filter(b => b._id !== bookId) }));
    } catch { triggerToast('Failed to remove book', 'error'); }
  };

  const booksNotInProject = allBooks.filter(b => !b.projectId || b.projectId !== id);
  const projectBookIds = new Set((project?.books || []).map(b => b._id));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f1523]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center text-slate-500">Project not found.</div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1523] pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <Link to="/projects" className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition mb-4">
            <ArrowLeft size={16} /> Back to Projects
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${project.color || '#6366f1'}22` }}>
              <FolderOpen size={24} style={{ color: project.color || '#6366f1' }} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">{project.name}</h1>
              {project.description && <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{project.description}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Books', value: project.books?.length || 0 },
            { label: 'Ready', value: (project.books || []).filter(b => b.status === 'ready').length },
            { label: 'In Progress', value: (project.books || []).filter(b => ['draft', 'generating'].includes(b.status)).length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="text-2xl font-black" style={{ color: project.color || '#6366f1' }}>{value}</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Books in Project */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 dark:text-white">Books in this Project</h2>
            <button
              onClick={() => setAddingBook(a => !a)}
              className="px-3 py-1.5 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Book
            </button>
          </div>

          {(project.books || []).length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <BookOpen className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No books added to this project yet.</p>
              <button onClick={() => setAddingBook(true)} className="mt-3 text-indigo-600 text-sm font-semibold hover:underline">Add your first book</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(project.books || []).map((book, i) => (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-md transition"
                >
                  <div className="h-28 flex items-center justify-center bg-slate-50 dark:bg-slate-700">
                    <BookCover title={book.title} coverStyle={book.coverStyle || 'modern'} author={book.author} size="sm" />
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{book.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Link to={`/books/${book._id}`} className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:underline">
                        <ExternalLink size={11} /> Open
                      </Link>
                      <button onClick={() => handleRemoveBook(book._id)} className="text-xs text-rose-500 hover:underline">Remove</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Add existing books panel */}
        {addingBook && booksNotInProject.length > 0 && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Add Existing Books</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {booksNotInProject.filter(b => !projectBookIds.has(b._id)).map(book => (
                <div key={book._id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{book.title}</p>
                    <p className="text-xs text-slate-400">{book.genre || 'No genre'}</p>
                  </div>
                  <button onClick={() => handleAddBook(book._id)} className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
