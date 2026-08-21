import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Sparkles, Wand2, Bot } from 'lucide-react';

export default function AIToolsRedirect() {
  const location = useLocation();
  
  let title = "AI Assistant";
  let icon = <Bot className="w-16 h-16 text-indigo-500 mb-4" />;
  let description = "The AI Assistant is available directly within your book's chapter editor.";
  
  if (location.pathname.includes('writer')) {
    title = "AI Writer";
    icon = <Sparkles className="w-16 h-16 text-emerald-500 mb-4" />;
    description = "The AI Writer is integrated seamlessly into your chapter editor.";
  } else if (location.pathname.includes('outline')) {
    title = "AI Outline Generator";
    icon = <Wand2 className="w-16 h-16 text-purple-500 mb-4" />;
    description = "The AI Outline generator is available when you create a new book or edit its structure.";
  }

  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#0f1523]">
      <div className="max-w-md w-full bg-white dark:bg-[#0B1020] rounded-2xl shadow-xl border border-slate-200 dark:border-[#252B45] p-10 text-center">
        <div className="flex justify-center">{icon}</div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{title}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          {description} Please select a book to open the editor and start using AI features.
        </p>
        
        <div className="flex flex-col gap-3">
          <Link 
            to="/books" 
            className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            <BookOpen size={18} /> Select a Book
          </Link>
          <Link 
            to="/create" 
            className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-[#252B45] dark:hover:bg-slate-700 text-slate-700 dark:text-white font-medium px-4 py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            <Wand2 size={18} /> Create New Book
          </Link>
        </div>
      </div>
    </div>
  );
}
