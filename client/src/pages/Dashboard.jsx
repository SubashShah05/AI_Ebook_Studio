import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { triggerToast } from '../utils/helpers';
import { Plus, BookOpen, FileText, PenTool, Sparkles, TrendingUp, MoreVertical, Calendar, Bot, Users } from 'lucide-react';
import BookCard from '../components/BookCard'; // Re-use existing BookCard

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharedBooks, setSharedBooks] = useState([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await API.get('/dashboard');
        setStats(res.data);
      } catch (err) {
        triggerToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();

    // Fetch books to find shared-with-me
    API.get('/books').then(res => {
      const all = res.data || [];
      setSharedBooks(all.filter(b => {
        const ownerId = b.owner?._id || b.owner;
        return ownerId?.toString() !== user?._id?.toString();
      }));
    }).catch(() => {});
  }, [user?._id]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this book completely?')) return;
    try {
      await API.delete(`/books/${id}`);
      triggerToast('Book deleted.');
      setStats(prev => ({
        ...prev,
        recentBooks: prev.recentBooks.filter(b => b._id !== id),
        totalBooks: prev.totalBooks - 1
      }));
    } catch (err) {
      triggerToast('Failed to delete book', 'error');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-20 bg-slate-200 dark:bg-[#252B45] rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-[#252B45] rounded-xl animate-pulse"></div>)}
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 h-96 bg-slate-200 dark:bg-[#252B45] rounded-xl animate-pulse"></div>
          <div className="w-full lg:w-80 h-96 bg-slate-200 dark:bg-[#252B45] rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Unable to load your dashboard.</h2>
        <button onClick={() => window.location.reload()} className="bg-[#8B5CF6] text-white px-6 py-2 rounded-lg">Try Again</button>
      </div>
    );
  }

  const usedPercent = stats ? Math.min(100, Math.round(((stats.aiUsed || 0) / (stats.aiLimit || 1)) * 100)) : 0;
  const strokeDashoffset = 251.2 * (1 - usedPercent / 100);

  return (
    <motion.div 
      className="p-6 max-w-[1600px] mx-auto w-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Dashboard Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Welcome back, {user?.name.split(' ')[0]}! <span className="animate-wave inline-block origin-bottom-right">👋</span>
          </h1>
          <p className="text-slate-500 dark:text-[#CBD5E1] text-sm mt-1">Keep writing, keep creating. Your next bestseller is waiting.</p>
        </div>
        <Link 
          to="/create" 
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] flex-shrink-0"
        >
          <Plus size={18} /> Create New Book
        </Link>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Total Books */}
        <div className="bg-white dark:bg-[#0B1020] p-5 rounded-xl border border-slate-200 dark:border-[#252B45] hover:border-[#8B5CF6]/50 transition group cursor-pointer active:scale-95">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-xl group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-[#CBD5E1]">Total Books</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalBooks}</h3>
            </div>
          </div>
        </div>

        {/* Total Chapters */}
        <div className="bg-white dark:bg-[#0B1020] p-5 rounded-xl border border-slate-200 dark:border-[#252B45] hover:border-amber-500/50 transition group cursor-pointer active:scale-95">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-500/20 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-[#CBD5E1]">Total Chapters</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalChapters}</h3>
            </div>
          </div>
        </div>

        {/* Words Generated */}
        <div className="bg-white dark:bg-[#0B1020] p-5 rounded-xl border border-slate-200 dark:border-[#252B45] hover:border-blue-500/50 transition group cursor-pointer active:scale-95">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-500 rounded-xl group-hover:scale-110 transition-transform">
              <PenTool size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-[#CBD5E1]">Words Generated</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.totalWords > 1000 ? (stats.totalWords / 1000).toFixed(1) + 'K' : stats.totalWords}
              </h3>
            </div>
          </div>
        </div>

        {/* AI Generations */}
        <div className="bg-white dark:bg-[#0B1020] p-5 rounded-xl border border-slate-200 dark:border-[#252B45] hover:border-emerald-500/50 transition group cursor-pointer active:scale-95">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-[#CBD5E1]">AI Generations</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.aiUsed || 0}</h3>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Two Column Layout: Main Content + Sidebar Panels */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Main Column: Books Grid */}
        <motion.div variants={itemVariants} className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Books</h2>
            <Link to="/books" className="text-sm text-[#8B5CF6] hover:text-[#7C3AED] font-medium flex items-center gap-1">
              View All Books &rarr;
            </Link>
          </div>

          {stats.recentBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
              {stats.recentBooks.map(book => (
                <BookCard key={book._id} book={book} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0B1020] border border-dashed border-slate-300 dark:border-[#252B45] rounded-xl p-10 text-center flex flex-col items-center justify-center">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-white">Your bookshelf is empty</h3>
              <p className="text-slate-500 dark:text-[#CBD5E1] text-sm mt-1 mb-6">Create your first AI-powered ebook and bring your idea to life.</p>
              <Link to="/create" className="bg-indigo-50 dark:bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-indigo-100 dark:hover:bg-[#8B5CF6]/20 font-medium px-5 py-2.5 rounded-lg transition">
                Create Your First Book
              </Link>
            </div>
          )}

          {/* Writing Progress Section */}
          <div className="mt-6 bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-[#252B45] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Writing Progress</h2>
            </div>
            <div className="h-48 flex items-center justify-center border border-dashed border-slate-200 dark:border-[#252B45] rounded-lg bg-slate-50 dark:bg-[#0f1523]">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-[#CBD5E1]">Chart data will populate as you write.</p>
              </div>
            </div>
          </div>

        </motion.div>

        {/* Right Sidebar Panels */}
        <motion.div variants={itemVariants} className="w-full xl:w-80 space-y-6 flex-shrink-0">
          
           {/* AI Usage Card */}
          <div className="bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-[#252B45] rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
              AI Usage <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-[#252B45] px-2 py-0.5 rounded">This Month</span>
            </h3>
            
            <div className="text-center py-6">
              <div className="inline-block relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-[#252B45]" />
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={strokeDashoffset} className="text-[#8B5CF6]" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{usedPercent}%</span>
                  <span className="text-[10px] text-slate-500 uppercase font-medium">Used</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">{stats.aiUsed || 0} / {stats.aiLimit || 20} generations used.</p>
            </div>

            <div className="mt-2 text-center">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Plan: <strong className="text-indigo-600 capitalize">{stats.plan || 'Free'}</strong></span>
              <Link to="/analytics" className="text-xs font-medium text-[#8B5CF6] hover:text-[#7C3AED] hover:underline flex items-center justify-center gap-1">
                <Sparkles size={12} /> View Detailed Usage
              </Link>
            </div>
          </div>

          {/* Team Summary Widget */}
          <div className="bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-[#252B45] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={15} className="text-[#8B5CF6]" /> Team
              </h3>
              <Link to="/team" className="text-xs text-[#8B5CF6] hover:underline">Manage</Link>
            </div>
            {sharedBooks.length === 0 ? (
              <div className="text-center py-4">
                <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-[#CBD5E1]">No shared books yet.</p>
                <Link to="/team" className="text-xs font-medium text-[#8B5CF6] hover:underline mt-1 inline-block">
                  Start collaborating →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {sharedBooks.slice(0, 3).map(book => (
                  <Link
                    key={book._id}
                    to={`/books/${book._id}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#252B45]/50 transition group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                      <BookOpen size={13} className="text-[#8B5CF6]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white truncate group-hover:text-[#8B5CF6] transition">{book.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">by {book.owner?.name || 'Someone'}</p>
                    </div>
                  </Link>
                ))}
                {sharedBooks.length > 3 && (
                  <Link to="/team" className="block text-center text-xs text-[#8B5CF6] hover:underline pt-1">
                    +{sharedBooks.length - 3} more
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-[#252B45] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</h3>
              <Link to="/analytics" className="text-xs text-[#8B5CF6] hover:underline">View All</Link>
            </div>
            
            <div className="space-y-4">
              {(!stats.recentActivities || stats.recentActivities.length === 0) ? (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 dark:text-[#CBD5E1]">No recent activity to display.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentActivities.map(act => (
                    <div key={act._id} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <div>
                        <span>
                          {act.type === 'ai_usage' && `AI ${act.metadata?.action || 'operation'} triggered`}
                          {act.type === 'writing_activity' && `Saved ${act.metadata?.wordCount || 0} words`}
                          {act.type === 'export_created' && `Exported ${act.metadata?.format?.toUpperCase() || ''}`}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(act.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
              <Bot size={80} />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1">Write Smarter with AI</h3>
              <p className="text-sm text-indigo-100 mb-4 max-w-[200px]">Use AI Assistant to improve, expand, or rewrite your content.</p>
              <Link to="/ai-assistant" className="inline-block bg-white text-[#8B5CF6] text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition">
                Open AI Assistant
              </Link>
            </div>
          </div>

        </motion.div>
      </div>

    </motion.div>
  );
}