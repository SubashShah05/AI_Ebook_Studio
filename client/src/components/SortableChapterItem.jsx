import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, FileText, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SortableChapterItem({ chapter, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: chapter._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between gap-3 shadow-sm hover:border-slate-300 transition"
    >
      <div className="flex items-center gap-3 overflow-hidden flex-grow">
        <button {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600 p-1">
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="overflow-hidden flex-grow">
          <Link to={`/chapters/${chapter._id}`} className="font-semibold text-slate-800 hover:text-indigo-600 transition block truncate">
            {chapter.title}
          </Link>
          <p className="text-xs text-slate-500 truncate">{chapter.description || 'No description listed.'}</p>
        </div>
      </div>
      <button 
        onClick={() => onDelete(chapter._id)}
        className="text-slate-400 hover:text-rose-500 p-2 rounded transition flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}