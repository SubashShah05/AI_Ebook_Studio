import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { triggerToast } from '../utils/helpers';
import { BookOpen, CheckCircle, XCircle, Loader2, Users, ArrowRight } from 'lucide-react';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const token = searchParams.get('token');
  const bookId = searchParams.get('bookId');
  const role = searchParams.get('role');
  const bookTitle = searchParams.get('title');

  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [bookInfo, setBookInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // If user is not logged in, save invite URL and redirect to login
    if (!user) {
      const inviteUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem('pendingInviteUrl', inviteUrl);
      navigate('/login', { replace: true });
      return;
    }

    // Fetch book info to show invite details
    if (bookId) {
      API.get(`/books/${bookId}`)
        .then(res => setBookInfo(res.data))
        .catch(() => {
          // Book might not yet be accessible - that's OK, we still show invite
        });
    }
  }, [user, bookId, navigate]);

  const handleAccept = async () => {
    if (!bookId) {
      setErrorMessage('Invalid invitation link. Missing book reference.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      // The shareController already handled the actual share creation when the invite was sent.
      // Accept = verify the current user has a share record and navigate to the book.
      await API.get(`/books/${bookId}`);
      setStatus('success');
      triggerToast('Invitation accepted! Welcome to the collaboration.');
      setTimeout(() => navigate(`/books/${bookId}`), 1500);
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err.response?.status === 403
          ? 'This invitation link is invalid or has expired. Please ask the book owner to re-share.'
          : err.response?.data?.message || 'Failed to accept invitation.'
      );
    }
  };

  const roleLabels = {
    editor: { label: 'Editor', desc: 'You can read and edit chapters', color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
    viewer: { label: 'Viewer', desc: 'You can read chapters in read-only mode', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    admin: { label: 'Admin', desc: 'You can manage this book and its collaborators', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  };
  const roleInfo = roleLabels[role] || roleLabels.viewer;

  return (
    <div className="min-h-screen bg-[#060B18] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-[#0B1020] border border-[#252B45] rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Book Invitation</h1>
            <p className="text-indigo-200 text-sm">You've been invited to collaborate</p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Status States */}
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4 py-4"
              >
                <CheckCircle size={48} className="text-emerald-400 mx-auto" />
                <div>
                  <h2 className="text-xl font-bold text-white">Invitation Accepted!</h2>
                  <p className="text-slate-400 text-sm mt-1">Redirecting you to the book workspace...</p>
                </div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
                  <XCircle size={20} className="text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-rose-400 font-semibold text-sm">Invitation Failed</p>
                    <p className="text-slate-400 text-xs mt-1">{errorMessage}</p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#252B45] hover:bg-[#2e3657] text-white rounded-xl transition font-medium text-sm"
                >
                  Go to Dashboard
                </Link>
              </motion.div>
            )}

            {(status === 'idle' || status === 'loading') && (
              <>
                {/* Book Info */}
                <div className="bg-[#0f1523] border border-[#252B45] rounded-xl p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center shrink-0">
                    <BookOpen size={20} className="text-[#8B5CF6]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Book</p>
                    <h3 className="text-white font-semibold truncate">
                      {bookInfo?.title || bookTitle || 'Loading book details...'}
                    </h3>
                    {bookInfo?.genre && (
                      <p className="text-xs text-slate-500 mt-0.5">{bookInfo.genre}</p>
                    )}
                  </div>
                </div>

                {/* Role Badge */}
                <div className="bg-[#0f1523] border border-[#252B45] rounded-xl p-4">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-3">Your Access Level</p>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold ${roleInfo.bg} ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                    <p className="text-slate-400 text-sm">{roleInfo.desc}</p>
                  </div>
                </div>

                {/* Logged in as */}
                {user && (
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="w-8 h-8 rounded-full bg-[#252B45] flex items-center justify-center text-white font-bold text-sm border border-[#8B5CF6]/30 shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <p>Joining as <strong className="text-white">{user.name}</strong> ({user.email})</p>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={handleAccept}
                  disabled={status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-xl transition disabled:opacity-50 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Accepting Invitation...
                    </>
                  ) : (
                    <>
                      Accept Invitation
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500">
                  Don't want to join?{' '}
                  <Link to="/dashboard" className="text-[#8B5CF6] hover:text-[#7C3AED]">
                    Go to Dashboard
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Branding */}
        <p className="text-center text-xs text-slate-600 mt-6 flex items-center justify-center gap-1.5">
          <BookOpen size={12} />
          AI Ebook Studio
        </p>
      </motion.div>
    </div>
  );
}
