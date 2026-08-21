import React from 'react';

const COVER_STYLES = {
  modern: {
    bg: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700',
    titleColor: 'text-white',
    subtitleColor: 'text-indigo-200',
    authorColor: 'text-indigo-300',
    accent: 'bg-white/10',
    border: 'border-white/20',
    genreColor: 'text-indigo-200',
  },
  minimal: {
    bg: 'bg-white',
    titleColor: 'text-slate-900',
    subtitleColor: 'text-slate-600',
    authorColor: 'text-slate-400',
    accent: 'bg-indigo-600',
    border: 'border-slate-200',
    genreColor: 'text-indigo-600',
  },
  technical: {
    bg: 'bg-slate-900',
    titleColor: 'text-emerald-400',
    subtitleColor: 'text-slate-300',
    authorColor: 'text-slate-500',
    accent: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    genreColor: 'text-emerald-500',
  },
  editorial: {
    bg: 'bg-amber-50',
    titleColor: 'text-slate-900',
    subtitleColor: 'text-slate-600',
    authorColor: 'text-amber-700',
    accent: 'bg-amber-600',
    border: 'border-amber-200',
    genreColor: 'text-amber-700',
  },
  classic: {
    bg: 'bg-gradient-to-b from-slate-800 to-slate-900',
    titleColor: 'text-amber-400',
    subtitleColor: 'text-slate-300',
    authorColor: 'text-slate-400',
    accent: 'bg-amber-400/20',
    border: 'border-amber-400/30',
    genreColor: 'text-amber-400',
  },
  creative: {
    bg: 'bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600',
    titleColor: 'text-white',
    subtitleColor: 'text-rose-100',
    authorColor: 'text-rose-200',
    accent: 'bg-white/20',
    border: 'border-white/30',
    genreColor: 'text-rose-100',
  }
};

export const COVER_STYLE_LABELS = [
  { id: 'modern', label: 'Modern' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'technical', label: 'Technical' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'classic', label: 'Classic' },
  { id: 'creative', label: 'Creative' },
];

export default function BookCover({ 
  title = 'Untitled Book',
  subtitle = '',
  author = '',
  genre = '',
  coverStyle = 'modern',
  size = 'md', // sm, md, lg
  className = ''
}) {
  const style = COVER_STYLES[coverStyle] || COVER_STYLES.modern;

  const sizes = {
    sm: 'w-24 h-32',
    md: 'w-40 h-56',
    lg: 'w-56 h-80',
    xl: 'w-72 h-96',
    full: 'w-full h-full',
  };

  const textSizes = {
    sm: { title: 'text-[10px]', subtitle: 'text-[8px]', author: 'text-[7px]', genre: 'text-[7px]' },
    md: { title: 'text-sm', subtitle: 'text-[10px]', author: 'text-[10px]', genre: 'text-[9px]' },
    lg: { title: 'text-xl', subtitle: 'text-sm', author: 'text-sm', genre: 'text-xs' },
    xl: { title: 'text-2xl', subtitle: 'text-base', author: 'text-sm', genre: 'text-xs' },
    full: { title: 'text-3xl', subtitle: 'text-lg', author: 'text-base', genre: 'text-sm' },
  };

  const ts = textSizes[size] || textSizes.md;

  return (
    <div className={`${sizes[size]} ${style.bg} ${size !== 'full' ? 'rounded-xl' : 'rounded-2xl'} border ${style.border} shadow-lg flex flex-col overflow-hidden relative select-none ${className}`}>
      {/* Top accent line */}
      <div className={`${style.accent} h-1 w-full shrink-0`} />
      
      {/* Content */}
      <div className="flex-1 flex flex-col justify-between p-3">
        {/* Genre tag */}
        {genre && (
          <span className={`${ts.genre} font-bold uppercase tracking-widest ${style.genreColor} opacity-80`}>
            {genre}
          </span>
        )}
        
        {/* Title */}
        <div className="flex-1 flex items-center">
          <h2 className={`${ts.title} font-black ${style.titleColor} leading-tight break-words line-clamp-4`}>
            {title}
          </h2>
        </div>
        
        {/* Subtitle + Author */}
        <div>
          {subtitle && (
            <p className={`${ts.subtitle} ${style.subtitleColor} leading-tight mb-2 line-clamp-2`}>
              {subtitle}
            </p>
          )}
          {author && (
            <p className={`${ts.author} font-semibold ${style.authorColor} mt-1`}>
              {author}
            </p>
          )}
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className={`${style.accent} h-1 w-full shrink-0`} />
    </div>
  );
}
