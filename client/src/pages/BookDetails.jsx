import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import API from '../services/api';
import { triggerToast } from '../utils/helpers';

// DnD Kit Infrastructure
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Icons
import { Save, Plus, Loader2, GripVertical, FileText, Trash2, Edit3, ArrowLeft, MoreVertical, BookOpen, Clock, Activity, CheckCircle2, AlertTriangle, AlertCircle, FileDown, Eye, Users, X, Mail, Crown, Shield } from 'lucide-react';

function SortableChapterSidebarItem({ chapter, isActive, onClick, index }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: chapter._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const statusColors = {
    completed: 'text-emerald-500',
    generating: 'text-amber-500 animate-pulse',
    pending: 'text-slate-400',
    failed: 'text-rose-500'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group flex items-center gap-2 p-3 rounded-xl border ${isActive ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-transparent hover:border-slate-200'} transition cursor-pointer mb-2`}
      onClick={() => onClick(chapter)}
    >
      <button {...attributes} {...listeners} className={`p-1 cursor-grab active:cursor-grabbing ${isActive ? 'text-indigo-400' : 'text-slate-300 group-hover:text-slate-400'}`}>
        <GripVertical size={16} />
      </button>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${isActive ? 'text-indigo-700' : 'text-slate-500'}`}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <h4 className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>
            {chapter.title || 'Untitled'}
          </h4>
        </div>
      </div>
      <div title={chapter.status}>
        {chapter.status === 'completed' && <CheckCircle2 size={14} className={statusColors.completed} />}
        {chapter.status === 'generating' && <Loader2 size={14} className={statusColors.generating} />}
        {chapter.status === 'failed' && <AlertTriangle size={14} className={statusColors.failed} />}
        {(chapter.status === 'pending' || !chapter.status) && <div className={`w-3 h-3 rounded-full border-2 ${statusColors.pending}`}></div>}
      </div>
    </div>
  );
}

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [savingBook, setSavingBook] = useState(false);
  const [savingChapter, setSavingChapter] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState('details'); // details, cover, project
  const [projects, setProjects] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shares, setShares] = useState([]);

  const { register: registerBook, handleSubmit: handleBookSubmit, setValue: setBookValue, watch: watchBook } = useForm();
  const { register: registerChapter, handleSubmit: handleChapterSubmit, setValue: setChapterValue, reset: resetChapterForm } = useForm();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadData = async () => {
    try {
      const [bookRes, chaptersRes, projectsRes] = await Promise.all([
        API.get(`/books/${id}`),
        API.get(`/chapters/book/${id}`),
        API.get('/projects').catch(() => ({ data: [] }))
      ]);
      
      setBook(bookRes.data);
      setChapters(chaptersRes.data);
      setProjects(projectsRes.data || []);
      
      // Load share collaborators
      API.get(`/shares/${id}/shares`)
        .then(r => setShares(r.data || []))
        .catch(() => {}); // non-critical
      
      setBookValue('title', bookRes.data.title);
      setBookValue('subtitle', bookRes.data.subtitle);
      setBookValue('description', bookRes.data.description);
      setBookValue('genre', bookRes.data.genre);
      setBookValue('targetAudience', bookRes.data.targetAudience);
      setBookValue('writingTone', bookRes.data.writingTone);
      setBookValue('language', bookRes.data.language || 'English');
      setBookValue('coverStyle', bookRes.data.coverStyle || 'modern');
      setBookValue('coverAuthor', bookRes.data.coverAuthor || bookRes.data.author || '');
      
    } catch (err) {
      triggerToast('Unable to load this book.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (activeChapter) {
      setChapterValue('title', activeChapter.title);
      setChapterValue('description', activeChapter.description);
    }
  }, [activeChapter, setChapterValue]);

  // Derived Stats
  const stats = useMemo(() => {
    const totalChapters = chapters.length;
    const completedChapters = chapters.filter(c => c.status === 'completed').length;
    const progress = totalChapters === 0 ? 0 : Math.round((completedChapters / totalChapters) * 100);
    const totalWords = chapters.reduce((acc, curr) => acc + (curr.wordCount || 0), 0);
    const readingTimeMins = Math.ceil(totalWords / 200);
    const hours = Math.floor(readingTimeMins / 60);
    const mins = readingTimeMins % 60;
    const readingTimeStr = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;

    return { totalChapters, completedChapters, progress, totalWords, readingTimeStr };
  }, [chapters]);

  const handleUpdateBook = async (data) => {
    setSavingBook(true);
    try {
      await API.put(`/books/${id}`, data);
      triggerToast('Book details saved');
      setBook(prev => ({ ...prev, ...data }));
    } catch (err) {
      triggerToast('Failed to save book', 'error');
    } finally {
      setSavingBook(false);
    }
  };

  const handleUpdateChapter = async (data) => {
    if (!activeChapter) return;
    setSavingChapter(true);
    try {
      const res = await API.put(`/chapters/${activeChapter._id}`, data);
      triggerToast('Chapter saved');
      setChapters(chapters.map(c => c._id === activeChapter._id ? { ...c, ...data } : c));
      setActiveChapter({ ...activeChapter, ...data });
    } catch (err) {
      triggerToast('Failed to update chapter', 'error');
    } finally {
      setSavingChapter(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = chapters.findIndex((c) => c._id === active.id);
      const newIndex = chapters.findIndex((c) => c._id === over.id);
      
      const revised = arrayMove(chapters, oldIndex, newIndex).map((ch, idx) => ({
        ...ch,
        order: idx
      }));
      
      // Optimistic update
      setChapters(revised);

      try {
        await API.post('/chapters/reorder', {
          orders: revised.map(c => ({ id: c._id, order: c.order }))
        });
      } catch (err) {
        triggerToast('Failed to reorder chapters', 'error');
        // Reload to revert
        loadData();
      }
    }
  };

  const handleAddChapter = async () => {
    const title = prompt("Enter new chapter title:");
    if (!title) return;
    try {
      const res = await API.post('/chapters', { bookId: id, title, description: '' });
      setChapters([...chapters, res.data]);
      triggerToast('Chapter added');
    } catch (err) {
      triggerToast('Failed to add chapter', 'error');
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm("Delete this chapter? This action cannot be undone.")) return;
    try {
      await API.delete(`/chapters/${chapterId}`);
      setChapters(chapters.filter(c => c._id !== chapterId));
      if (activeChapter?._id === chapterId) {
        setActiveChapter(null);
      }
      triggerToast('Chapter deleted');
    } catch (err) {
      triggerToast('Failed to delete chapter', 'error');
    }
  };

  const handleDeleteBook = async () => {
    if (!window.confirm("Delete this book? All chapters belonging to this book will also be removed.")) return;
    try {
      await API.delete(`/books/${id}`);
      triggerToast('Book deleted');
      navigate('/dashboard');
    } catch (err) {
      triggerToast('Failed to delete book', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500">Loading workspace...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Book not found</h2>
        <p className="text-slate-500 mb-6">You don't have access to this book or it doesn't exist.</p>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Go to Dashboard</button>
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
      {/* 1. BOOK HEADER */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <Link to="/dashboard" className="hover:text-indigo-600 transition">Dashboard</Link>
              <span>/</span>
              <span>My Books</span>
              <span>/</span>
              <span className="font-semibold text-slate-700 truncate max-w-[150px] md:max-w-xs">{book.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 truncate max-w-[200px] md:max-w-md">{book.title}</h1>
              {book.status === 'draft' && <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Draft</span>}
              {book.status === 'generating' && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase animate-pulse">Generating</span>}
              {book.status === 'ready' && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Ready</span>}
              {book.status === 'failed' && <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Failed</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)} className="md:hidden p-2 text-slate-600 bg-slate-100 rounded-lg">
            <BookOpen size={20} />
          </button>
          <div className="hidden md:flex items-center gap-2">
            {/* Collaborator Avatars */}
            {shares.length > 0 && (
              <div className="flex items-center -space-x-2 mr-1">
                {shares.slice(0, 3).map((s, i) => (
                  <div
                    key={s._id}
                    title={`${s.userId?.name} (${s.role})`}
                    className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    style={{ zIndex: 10 - i }}
                  >
                    {s.userId?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                ))}
                {shares.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-600 text-xs font-bold">
                    +{shares.length - 3}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              <Users size={15} /> Share
            </button>
            <Link to={`/books/${id}/read`} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              <Eye size={15} /> Read
            </Link>
            <Link to={`/books/${id}/export`} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
              <FileDown size={15} /> Export
            </Link>
            <button onClick={handleDeleteBook} className="px-4 py-2 text-sm font-medium text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition">
              Delete Book
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* 3. CHAPTER SIDEBAR (Left) */}
        <aside className={`absolute md:relative z-20 inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ${isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Chapters</h2>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{chapters.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={chapters.map(c => c._id)} strategy={verticalListSortingStrategy}>
                {chapters.map((chapter, idx) => (
                  <SortableChapterSidebarItem 
                    key={chapter._id} 
                    chapter={chapter} 
                    index={idx}
                    isActive={activeChapter?._id === chapter._id} 
                    onClick={(ch) => {
                      setActiveChapter(ch);
                      setIsMobileDrawerOpen(false); // Close drawer on mobile
                    }} 
                  />
                ))}
              </SortableContext>
            </DndContext>
            
            {chapters.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500 mb-4">No chapters yet.</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <button onClick={handleAddChapter} className="w-full py-2.5 bg-white border border-slate-200 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition flex items-center justify-center gap-2">
              <Plus size={16} /> Add Chapter
            </button>
          </div>
        </aside>

        {/* Overlay for mobile drawer */}
        {isMobileDrawerOpen && (
          <div className="absolute inset-0 bg-slate-900/20 z-10 md:hidden" onClick={() => setIsMobileDrawerOpen(false)}></div>
        )}

        {/* MAIN WORKSPACE (Center) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {activeChapter ? (
              // Active Chapter View
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-lg">Edit Chapter Metadata</h2>
                      <p className="text-xs text-slate-500">Configure chapter details before writing content</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteChapter(activeChapter._id)} className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition" title="Delete Chapter">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <form onSubmit={handleChapterSubmit(handleUpdateChapter)} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Chapter Title</label>
                    <input type="text" {...registerChapter('title')} required className="w-full text-slate-900 p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description (Optional)</label>
                    <textarea {...registerChapter('description')} rows={3} className="w-full text-slate-900 p-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition resize-none placeholder:text-slate-400" placeholder="What is this chapter about?"></textarea>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div className="text-sm text-slate-500 flex items-center flex-wrap gap-2">
                      <span className="font-medium text-slate-700">Status:</span> 
                      <span className={`capitalize font-semibold ${activeChapter.status === 'completed' ? 'text-emerald-600' : 'text-slate-600'}`}>{activeChapter.status || 'Draft'}</span>
                      {activeChapter.wordCount > 0 && <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{activeChapter.wordCount} words</span>}
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button type="submit" disabled={savingChapter} className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition flex items-center gap-2 disabled:opacity-50 text-sm">
                        {savingChapter ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
                      </button>
                      <Link to={`/chapters/${activeChapter._id}`} className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition flex items-center gap-2 text-sm">
                        <Edit3 size={16} /> Open Editor
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              // Book Metadata View with Tabs (No chapter selected)
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Tabs Header */}
                <div className="flex border-b border-slate-200 bg-slate-50">
                  {[
                    { id: 'details', label: 'General Details' },
                    { id: 'cover', label: 'Cover Design' },
                    { id: 'project', label: 'Project Settings' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setWorkspaceTab(tab.id)}
                      className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${
                        workspaceTab === tab.id
                          ? 'border-indigo-600 text-indigo-600 bg-white'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {workspaceTab === 'details' && (
                  <form onSubmit={handleBookSubmit(handleUpdateBook)} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Book Title *</label>
                        <input type="text" {...registerBook('title')} required className="w-full text-slate-900 p-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subtitle</label>
                        <input type="text" {...registerBook('subtitle')} className="w-full text-slate-900 p-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Book Description</label>
                        <textarea {...registerBook('description')} rows={3} className="w-full text-slate-900 p-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none resize-none"></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Genre</label>
                        <input type="text" {...registerBook('genre')} className="w-full text-slate-900 p-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Audience</label>
                        <input type="text" {...registerBook('targetAudience')} className="w-full text-slate-900 p-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Writing Tone</label>
                        <select {...registerBook('writingTone')} className="w-full text-slate-900 p-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none bg-white">
                          <option value="">Select Tone</option>
                          <option value="Professional">Professional</option>
                          <option value="Conversational">Conversational</option>
                          <option value="Academic">Academic</option>
                          <option value="Humorous">Humorous</option>
                          <option value="Storytelling">Storytelling</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Language</label>
                        <select {...registerBook('language')} className="w-full text-slate-900 p-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none bg-white">
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="German">German</option>
                        </select>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button type="submit" disabled={savingBook} className="w-full px-5 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                        {savingBook ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Book Details
                      </button>
                    </div>
                  </form>
                )}

                {workspaceTab === 'cover' && (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Live Preview Column */}
                    <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800/40 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Live Cover Preview</span>
                      <BookCover
                        title={watchBook('title') || book?.title || 'Untitled Book'}
                        subtitle={watchBook('subtitle') || book?.subtitle || ''}
                        author={watchBook('coverAuthor') || book?.coverAuthor || book?.author || ''}
                        genre={watchBook('genre') || book?.genre || ''}
                        coverStyle={watchBook('coverStyle') || book?.coverStyle || 'modern'}
                        size="lg"
                      />
                    </div>

                    {/* Customize Options Form */}
                    <form onSubmit={handleBookSubmit(async (data) => {
                      setSavingBook(true);
                      try {
                        const res = await API.put(`/books/${id}/cover`, {
                          coverStyle: data.coverStyle,
                          coverAuthor: data.coverAuthor,
                          title: data.title,
                          subtitle: data.subtitle
                        });
                        setBook(prev => ({
                          ...prev,
                          coverStyle: data.coverStyle,
                          coverAuthor: data.coverAuthor,
                          title: data.title,
                          subtitle: data.subtitle
                        }));
                        triggerToast('Cover settings updated');
                      } catch {
                        triggerToast('Failed to update cover style', 'error');
                      } finally {
                        setSavingBook(false);
                      }
                    })} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cover Style</label>
                        <select {...registerBook('coverStyle')} className="w-full text-slate-900 p-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none bg-white">
                          <option value="modern">Modern</option>
                          <option value="minimal">Minimal</option>
                          <option value="technical">Technical</option>
                          <option value="editorial">Editorial</option>
                          <option value="classic">Classic</option>
                          <option value="creative">Creative</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cover Author Name</label>
                        <input type="text" {...registerBook('coverAuthor')} className="w-full text-slate-900 p-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none" placeholder="Author name displayed on cover" />
                      </div>
                      <div className="pt-2">
                        <button type="submit" disabled={savingBook} className="w-full px-5 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                          {savingBook ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Cover Settings
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {workspaceTab === 'project' && (
                  <div className="p-6 space-y-5">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base mb-1">Assign Book to Project</h3>
                      <p className="text-xs text-slate-500 mb-4">Move this book into one of your projects to keep them organized.</p>
                      
                      <div className="flex gap-4 items-center">
                        <select
                          value={book?.projectId || ''}
                          onChange={async (e) => {
                            const val = e.target.value || null;
                            try {
                              await API.put(`/books/${id}/assign-project`, { projectId: val });
                              setBook(prev => ({ ...prev, projectId: val }));
                              triggerToast('Project assignment updated');
                            } catch {
                              triggerToast('Failed to assign project', 'error');
                            }
                          }}
                          className="flex-1 text-slate-900 p-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none bg-white"
                        >
                          <option value="">No Project (Unassigned)</option>
                          {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>
                        {book?.projectId && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await API.put(`/books/${id}/assign-project`, { projectId: null });
                                setBook(prev => ({ ...prev, projectId: null }));
                                triggerToast('Unassigned from project');
                              } catch {
                                triggerToast('Failed to unassign project', 'error');
                              }
                            }}
                            className="px-4 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition text-sm font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Mobile-only Stats */}
            <div className="xl:hidden bg-white rounded-2xl border border-slate-200 p-6">
               <h3 className="font-bold text-slate-800 mb-4">Book Progress</h3>
               <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                  <div className="bg-emerald-500 h-3 rounded-full transition-all duration-500" style={{ width: `${stats.progress}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>{stats.completedChapters} of {stats.totalChapters} Chapters</span>
                  <span>{stats.progress}%</span>
                </div>
            </div>

          </div>
        </main>

        {/* RIGHT SIDEBAR (Book Info) */}
        <aside className="hidden xl:flex flex-col w-80 bg-white border-l border-slate-200 z-10">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-lg">Overview</h2>
          </div>
          
          <div className="p-6 space-y-8 overflow-y-auto">
            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                  <Activity size={16} className="text-indigo-500" /> Completion
                </h3>
                <span className="text-indigo-600 font-bold text-sm">{stats.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                <div className="bg-indigo-500 h-3 rounded-full transition-all duration-500" style={{ width: `${stats.progress}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 font-medium">{stats.completedChapters} of {stats.totalChapters} chapters completed</p>
            </div>

            {/* Statistics */}
            <div>
              <h3 className="font-semibold text-slate-700 text-sm mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-slate-400 mb-1"><FileText size={18} /></div>
                  <div className="text-xl font-bold text-slate-800">{stats.totalWords.toLocaleString()}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Total Words</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-slate-400 mb-1"><Clock size={18} /></div>
                  <div className="text-xl font-bold text-slate-800">{stats.readingTimeStr}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Read Time</div>
                </div>
              </div>
            </div>

            {/* Information */}
            <div>
              <h3 className="font-semibold text-slate-700 text-sm mb-3">Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Genre</span>
                  <span className="font-medium text-slate-800">{book.genre || 'Not specified'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Target</span>
                  <span className="font-medium text-slate-800">{book.targetAudience || 'General'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tone</span>
                  <span className="font-medium text-slate-800">{book.writingTone || 'Standard'}</span>
                </div>
              </div>
            </div>
            
          </div>
        </aside>
      </div>
    </div>

    {/* Share Modal */}
    {showShareModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
        <div
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users size={20} className="text-indigo-600" /> Share Book
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{book.title}</p>
            </div>
            <button onClick={() => setShowShareModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Invite Form */}
            <InlineShareForm bookId={id} onShared={(newShare) => setShares(prev => {
              const exists = prev.findIndex(s => s.userId?._id === newShare.userId?._id);
              if (exists >= 0) { const u = [...prev]; u[exists] = newShare; return u; }
              return [...prev, newShare];
            })} />

            {/* Current Collaborators */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Current Collaborators</p>
              {shares.length === 0 ? (
                <div className="text-center py-5 border border-dashed border-slate-200 rounded-xl">
                  <Users size={20} className="text-slate-300 mx-auto mb-1.5" />
                  <p className="text-sm text-slate-400">No collaborators yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {shares.map(share => (
                    <div key={share._id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {share.userId?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{share.userId?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{share.userId?.email}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        share.role === 'editor' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>{share.role}</span>
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Remove ${share.userId?.name}'s access?`)) return;
                          try {
                            await API.delete(`/shares/${id}/share/${share.userId?._id}`);
                            setShares(prev => prev.filter(s => s.userId?._id !== share.userId?._id));
                            triggerToast('Access revoked');
                          } catch { triggerToast('Failed to revoke', 'error'); }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
);
}

// Inline invite form used inside BookDetails share modal
function InlineShareForm({ bookId, onShared }) {
const [email, setEmail] = useState('');
const [role, setRole] = useState('editor');
const [loading, setLoading] = useState(false);

const handleShare = async (e) => {
  e.preventDefault();
  if (!email.trim()) return;
  setLoading(true);
  try {
    const res = await API.post(`/shares/${bookId}/share`, { email: email.trim(), role });
    triggerToast(`Shared with ${email} as ${role}`);
    setEmail('');
    if (onShared) onShared(res.data.share);
  } catch (err) {
    triggerToast(err.response?.data?.message || 'Failed to share', 'error');
  } finally {
    setLoading(false);
  }
};

return (
  <form onSubmit={handleShare}>
    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Invite Collaborator</p>
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="colleague@example.com"
          className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 text-slate-900"
        />
      </div>
      <select
        value={role}
        onChange={e => setRole(e.target.value)}
        className="border border-slate-200 text-sm px-3 py-2.5 rounded-xl focus:outline-none text-slate-900 bg-white"
      >
        <option value="editor">Editor</option>
        <option value="viewer">Viewer</option>
      </select>
      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        Invite
      </button>
    </div>
  </form>
);
}