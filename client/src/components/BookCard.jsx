import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Edit2, Trash2 } from 'lucide-react';

export default function BookCard({ book, onDelete }) {
  const fallbackImg = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400";
  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-md border border-slate-100 transition overflow-hidden flex flex-col justify-between active:scale-[0.98]">
      <div className="p-0 relative h-48 bg-slate-100">
        <img 
          src={book.coverImage ? `${apiBase}${book.coverImage}` : fallbackImg} 
          alt={book.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {book.status === 'draft' && <span className="bg-slate-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow">DRAFT</span>}
          {book.status === 'generating' && <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow animate-pulse">GENERATING...</span>}
          {book.status === 'ready' && <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow">READY</span>}
          {book.status === 'failed' && <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow">FAILED</span>}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-white font-bold text-lg leading-tight truncate">{book.title}</h3>
          <p className="text-slate-200 text-xs truncate">{book.subtitle || 'No Subtitle'}</p>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow justify-between">
        <p className="text-xs text-slate-500 font-medium mb-4">By {book.author}</p>
        <div className="flex items-center justify-between gap-2 mt-auto">
          <Link 
            to={`/books/${book._id}`} 
            className="flex-grow inline-flex items-center justify-center gap-1.5 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold py-2 px-3 rounded-lg transition"
          >
            <Book className="w-3.5 h-3.5" /> Workspace
          </Link>
          <button 
            onClick={() => onDelete(book._id)}
            className="text-slate-400 hover:text-rose-600 p-2 border border-slate-100 hover:border-rose-100 rounded-lg transition"
            title="Delete eBook"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}