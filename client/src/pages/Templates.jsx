import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import { Search, BookOpen, ChevronRight, X, Users, MessageSquare, Star, Layers } from 'lucide-react';

const CATEGORIES = ['All', 'Technical', 'Educational', 'Business', 'Self Improvement', 'Marketing', 'Fiction', 'Research'];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
};

function TemplateCard({ template, index, onUse, onPreview }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="group relative rounded-2xl p-[2px] overflow-hidden flex flex-col"
    >
      {/* Animated gradient border (only visible on hover) */}
      <div className="absolute inset-[-50%] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 group-hover:animate-border-spin transition-opacity duration-300"></div>

      {/* Inner card content */}
      <div className="relative z-10 flex flex-col flex-1 h-full bg-white dark:bg-slate-800 rounded-[14px] overflow-hidden">
        {/* Cover Preview */}
        <div
          className="h-36 flex items-center justify-center text-5xl font-black relative overflow-hidden border-b border-slate-100 dark:border-slate-700/50"
          style={{ background: `linear-gradient(135deg, ${template.accentColor}22, ${template.accentColor}44)` }}
        >
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${template.accentColor}33, transparent)` }} />
          <span className="relative text-5xl z-10">{template.icon}</span>
          <span
            className="absolute bottom-2 right-3 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: `${template.accentColor}22`, color: template.accentColor }}
          >
            {template.category}
          </span>
        </div>

        {/* Info */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{template.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex-1 mb-4 leading-relaxed">{template.description}</p>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <span className="flex items-center gap-1.5"><Layers size={13} /> {template.defaultChapterCount} chapters</span>
            <span className="flex items-center gap-1.5"><Users size={13} /> {template.defaultAudience}</span>
            <span className="flex items-center gap-1.5"><MessageSquare size={13} /> {template.defaultTone}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPreview(template)}
              className="flex-1 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Preview
            </button>
            <button
              onClick={() => onUse(template)}
              className="flex-1 px-4 py-2 text-sm font-bold text-white rounded-xl transition flex items-center justify-center gap-1.5 hover:opacity-90"
              style={{ backgroundColor: template.accentColor }}
            >
              Use <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TemplatePreviewModal({ template, onClose, onUse }) {
  if (!template) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div
          className="p-6 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${template.accentColor}22, ${template.accentColor}44)` }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <X size={18} />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{template.icon}</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block" style={{ background: `${template.accentColor}22`, color: template.accentColor }}>{template.category}</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{template.name}</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{template.description}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Chapters', value: template.defaultChapterCount },
              { label: 'Audience', value: template.defaultAudience },
              { label: 'Tone', value: template.defaultTone },
              { label: 'Genre', value: template.defaultGenre },
              { label: 'Language', value: template.defaultLanguage },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
                <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{value}</div>
              </div>
            ))}
          </div>

          {/* Chapter Structure */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers size={14} /> Chapter Structure
            </h3>
            <div className="space-y-2">
              {template.chapters.map((ch, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl">
                  <span
                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white mt-0.5"
                    style={{ backgroundColor: template.accentColor }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{ch.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ch.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => { onUse(template); onClose(); }}
            className="w-full py-3 text-white font-bold rounded-xl transition text-base"
            style={{ backgroundColor: template.accentColor }}
          >
            Use This Template →
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await API.get('/templates');
        setTemplates(res.data);
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter(t => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    const matchSearch = !search.trim() || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleUseTemplate = (template) => {
    // Navigate to CreateBook with template pre-fill via state
    navigate('/create', {
      state: {
        template: {
          id: template._id,
          name: template.name,
          genre: template.defaultGenre,
          targetAudience: template.defaultAudience,
          writingTone: template.defaultTone,
          language: template.defaultLanguage,
          chapterCount: template.defaultChapterCount,
          chapters: template.chapters
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1523] pb-16">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Templates</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Start with a structure designed for your kind of book.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl h-72 animate-pulse border border-slate-200 dark:border-slate-700" />
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No templates found for "{search || activeCategory}"</p>
            <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="mt-4 text-indigo-600 text-sm font-semibold hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template, i) => (
              <TemplateCard
                key={template._id}
                template={template}
                index={i}
                onUse={handleUseTemplate}
                onPreview={setPreviewTemplate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <TemplatePreviewModal
            template={previewTemplate}
            onClose={() => setPreviewTemplate(null)}
            onUse={handleUseTemplate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
