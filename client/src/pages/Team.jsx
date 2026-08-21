import React, { useEffect, useState, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { triggerToast } from '../utils/helpers';
import {
  Users, BookOpen, Shield, Crown, Eye, Edit3, Trash2,
  Plus, Search, Loader2, X, Mail, ChevronDown, UserCheck,
  ArrowRight, AlertTriangle
} from 'lucide-react';

const ROLE_HIERARCHY = { owner: 4, admin: 3, editor: 2, viewer: 1 };

const ROLE_META = {
  owner:  { label: 'Owner',  color: 'text-amber-400',   bg: 'bg-amber-500/20',  border: 'border-amber-500/30',  icon: Crown },
  admin:  { label: 'Admin',  color: 'text-rose-400',    bg: 'bg-rose-500/20',   border: 'border-rose-500/30',   icon: Shield },
  editor: { label: 'Editor', color: 'text-indigo-400',  bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', icon: Edit3 },
  viewer: { label: 'Viewer', color: 'text-emerald-400', bg: 'bg-emerald-500/20',border: 'border-emerald-500/30',icon: Eye },
};

function Avatar({ name, size = 'md' }) {
  const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };
  const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  const colorIndex = (name?.charCodeAt(0) || 0) % colors.length;
  return (
    <div className={`${sizeMap[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  );
}

function RoleBadge({ role }) {
  const meta = ROLE_META[role] || ROLE_META.viewer;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${meta.bg} ${meta.color} ${meta.border}`}>
      <Icon size={11} />
      {meta.label}
    </span>
  );
}

function ShareModal({ book, onClose, onShared }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [shares, setShares] = useState([]);
  const [loadingShares, setLoadingShares] = useState(true);
  const [revoking, setRevoking] = useState(null);

  useEffect(() => {
    API.get(`/shares/${book._id}/shares`)
      .then(res => setShares(res.data || []))
      .catch(() => triggerToast('Failed to load collaborators', 'error'))
      .finally(() => setLoadingShares(false));
  }, [book._id]);

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await API.post(`/shares/${book._id}/share`, { email: email.trim(), role });
      triggerToast(`Shared with ${email} as ${role}`);
      setShares(prev => {
        const existing = prev.findIndex(s => s.userId?.email === email.trim());
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = res.data.share;
          return updated;
        }
        return [...prev, res.data.share];
      });
      setEmail('');
      if (onShared) onShared();
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to share book', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (targetUserId, targetName) => {
    if (!window.confirm(`Remove ${targetName}'s access to this book?`)) return;
    setRevoking(targetUserId);
    try {
      await API.delete(`/shares/${book._id}/share/${targetUserId}`);
      setShares(prev => prev.filter(s => s.userId?._id !== targetUserId));
      triggerToast('Access revoked');
    } catch (err) {
      triggerToast('Failed to revoke access', 'error');
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#0B1020] border border-[#252B45] rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#252B45]">
          <div>
            <h2 className="text-lg font-bold text-white">Share Book</h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{book.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-[#252B45] rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Invite Form */}
          <form onSubmit={handleShare} className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Invite Collaborator</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0f1523] border border-[#252B45] text-white text-sm rounded-xl focus:outline-none focus:border-[#8B5CF6]/60 placeholder:text-slate-600"
                />
              </div>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="bg-[#0f1523] border border-[#252B45] text-white text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#8B5CF6]/60"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 shrink-0"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                Invite
              </button>
            </div>
          </form>

          {/* Collaborators List */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Current Collaborators
            </label>
            {loadingShares ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-[#8B5CF6]" />
              </div>
            ) : shares.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-[#252B45] rounded-xl">
                <Users size={24} className="text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No collaborators yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {shares.map(share => (
                  <div key={share._id} className="flex items-center gap-3 p-3 bg-[#0f1523] border border-[#252B45] rounded-xl">
                    <Avatar name={share.userId?.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{share.userId?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{share.userId?.email}</p>
                    </div>
                    <RoleBadge role={share.role} />
                    <button
                      onClick={() => handleRevoke(share.userId?._id, share.userId?.name)}
                      disabled={revoking === share.userId?._id}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Revoke access"
                    >
                      {revoking === share.userId?._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Team() {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [shareModalBook, setShareModalBook] = useState(null);
  const [activeTab, setActiveTab] = useState('my-books'); // my-books | shared-with-me

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/books');
      const allBooks = res.data || [];
      // Separate owned vs. shared with me
      setBooks(allBooks.filter(b => b.owner?._id === user?._id || b.owner === user?._id));
      setSharedWithMe(allBooks.filter(b => {
        const ownerId = b.owner?._id || b.owner;
        return ownerId !== user?._id && ownerId?.toString() !== user?._id?.toString();
      }));
    } catch (err) {
      triggerToast('Failed to load books', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredBooks = (activeTab === 'my-books' ? books : sharedWithMe).filter(
    b => b.title?.toLowerCase().includes(search.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 max-w-6xl mx-auto"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <Users size={20} className="text-[#8B5CF6]" />
              </div>
              Team & Collaboration
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 ml-[52px]">
              Manage who has access to your books and collaborate with others.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Books Owned', value: books.length, icon: BookOpen, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/20' },
          { label: 'Shared With Me', value: sharedWithMe.length, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
          { label: 'Total Books', value: books.length + sharedWithMe.length, icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/20' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-[#252B45] rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tabs + Search */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex bg-slate-100 dark:bg-[#0f1523] p-1 rounded-xl gap-1">
          {[
            { id: 'my-books', label: `My Books (${books.length})` },
            { id: 'shared-with-me', label: `Shared With Me (${sharedWithMe.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#252B45] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search books..."
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-[#252B45] text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-[#8B5CF6]/60 placeholder:text-slate-400"
          />
        </div>
      </motion.div>

      {/* Books Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <Loader2 size={28} className="animate-spin text-[#8B5CF6] mx-auto" />
            <p className="text-slate-400 text-sm">Loading collaboration data...</p>
          </div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-white dark:bg-[#0B1020] border border-dashed border-slate-300 dark:border-[#252B45] rounded-2xl p-12 text-center">
          {activeTab === 'my-books' ? (
            <>
              <BookOpen size={36} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-white">No books to share yet</h3>
              <p className="text-slate-500 text-sm mt-1 mb-5">Create your first book and invite collaborators to get started.</p>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8B5CF6] text-white text-sm font-semibold rounded-xl hover:bg-[#7C3AED] transition"
              >
                <Plus size={16} /> Create a Book
              </Link>
            </>
          ) : (
            <>
              <Users size={36} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-white">No shared books</h3>
              <p className="text-slate-500 text-sm mt-1">Books shared with you by teammates will appear here.</p>
            </>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredBooks.map(book => (
            <BookTeamCard
              key={book._id}
              book={book}
              isOwned={activeTab === 'my-books'}
              onShare={() => setShareModalBook(book)}
              currentUserId={user?._id}
            />
          ))}
        </motion.div>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {shareModalBook && (
          <ShareModal
            book={shareModalBook}
            onClose={() => setShareModalBook(null)}
            onShared={fetchData}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BookTeamCard({ book, isOwned, onShare, currentUserId }) {
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const statusColors = {
    draft: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    ready: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    generating: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
    failed: 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400',
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-[#0B1020] border border-slate-200 dark:border-[#252B45] rounded-2xl p-5 hover:border-[#8B5CF6]/40 transition-all group"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
          <BookOpen size={18} className="text-[#8B5CF6]" />
        </div>
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusColors[book.status] || statusColors.draft}`}>
          {book.status || 'Draft'}
        </span>
      </div>

      {/* Book title */}
      <h3 className="font-bold text-slate-900 dark:text-white truncate mb-1 group-hover:text-[#8B5CF6] transition">
        {book.title}
      </h3>
      <p className="text-xs text-slate-500 truncate mb-4">{book.genre || 'No genre'}</p>

      {/* Owner info if shared-with-me */}
      {!isOwned && book.owner && (
        <div className="flex items-center gap-2 mb-4">
          <Avatar name={book.owner?.name || 'U'} size="sm" />
          <p className="text-xs text-slate-500">
            by <span className="text-slate-700 dark:text-slate-300 font-medium">{book.owner?.name || 'Owner'}</span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-[#252B45]">
        <Link
          to={`/books/${book._id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-[#8B5CF6] hover:bg-[#8B5CF6]/10 rounded-lg transition"
        >
          Open <ArrowRight size={14} />
        </Link>
        {isOwned && (
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#252B45] rounded-lg transition"
          >
            <Users size={14} /> Share
          </button>
        )}
      </div>
    </motion.div>
  );
}
