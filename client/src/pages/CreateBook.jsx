import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import { triggerToast } from '../utils/helpers';
import { Sparkles, ArrowRight, Loader2, CheckCircle2, AlertTriangle, Book, GripVertical, Plus, Trash2, StopCircle, LayoutTemplate, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableChapterItem({ id, chapter, index, updateChapter, removeChapter }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-start shadow-sm mb-3">
      <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
        <GripVertical size={20} />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <span className="bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded text-xs">CH {index + 1}</span>
          <input 
            type="text" 
            value={chapter.title} 
            onChange={(e) => updateChapter(id, 'title', e.target.value)}
            className="font-bold text-slate-800 w-full border-none focus:ring-0 p-0"
            placeholder="Chapter Title"
          />
        </div>
        <textarea 
          value={chapter.description} 
          onChange={(e) => updateChapter(id, 'description', e.target.value)}
          className="w-full text-sm text-slate-600 border border-slate-200 rounded-lg p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
          rows={2}
          placeholder="Chapter Description"
        />
      </div>
      <button onClick={() => removeChapter(id)} className="text-red-400 hover:text-red-600 p-1">
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default function CreateBook() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState(1); // 1: Form, 2: Outline, 3: Generation
  const [loading, setLoading] = useState(false);
  const [generatedBookId, setGeneratedBookId] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState(null); // template info banner
  
  // Step 1 Form Data
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    description: '',
    genre: '',
    targetAudience: '',
    writingTone: '',
    language: 'English',
    chapterCount: 5
  });

  // Step 2 Outline Data
  const [outline, setOutline] = useState(null);

  // Step 3 Generation Data
  const [generationProgress, setGenerationProgress] = useState(null);

  // Pre-fill from template state OR user onboarding preferences
  useEffect(() => {
    const tpl = location.state?.template;
    if (tpl) {
      setActiveTemplate(tpl);
      setFormData(prev => ({
        ...prev,
        genre: tpl.genre || prev.genre,
        targetAudience: tpl.targetAudience || prev.targetAudience,
        writingTone: tpl.writingTone || prev.writingTone,
        language: tpl.language || prev.language,
        chapterCount: tpl.chapterCount || prev.chapterCount
      }));
    } else if (user && step === 1 && !formData.genre && !formData.targetAudience) {
      setFormData(prev => ({
        ...prev,
        genre: user.preferredGenre || '',
        targetAudience: user.targetAudience || '',
        writingTone: user.writingStyle || '',
        language: user.preferredLanguage || 'English'
      }));
    }
  }, [user, location.state]);

  // Polling for generation progress
  useEffect(() => {
    let intervalId;
    if (step === 3 && generatedBookId) {
      const checkProgress = async () => {
        try {
          const res = await API.get(`/books/${generatedBookId}`);
          setGenerationProgress(res.data);
          
          if (res.data.status === 'ready' || res.data.status === 'failed' || res.data.status === 'draft') {
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error("Failed to poll progress");
        }
      };
      
      checkProgress();
      intervalId = setInterval(checkProgress, 3000);
    }
    return () => clearInterval(intervalId);
  }, [step, generatedBookId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateOutline = async (e) => {
    e.preventDefault();
    if (!formData.topic.trim() || !formData.title.trim()) {
      triggerToast('Title and Topic are required', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/ai/outline', formData);
      const outlineData = {
        ...res.data,
        chapters: res.data.chapters.map((ch, idx) => ({ ...ch, id: `ch-${idx}-${Date.now()}` }))
      };
      setOutline(outlineData);
      setStep(2);
      triggerToast('Outline generated successfully!');
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to generate outline', 'error');
    } finally {
      setLoading(false);
    }
  };

  // DnD Handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setOutline((prev) => {
        const oldIndex = prev.chapters.findIndex((ch) => ch.id === active.id);
        const newIndex = prev.chapters.findIndex((ch) => ch.id === over.id);
        return {
          ...prev,
          chapters: arrayMove(prev.chapters, oldIndex, newIndex),
        };
      });
    }
  };

  const updateChapter = (id, field, value) => {
    setOutline(prev => ({
      ...prev,
      chapters: prev.chapters.map(ch => ch.id === id ? { ...ch, [field]: value } : ch)
    }));
  };

  const removeChapter = (id) => {
    setOutline(prev => ({
      ...prev,
      chapters: prev.chapters.filter(ch => ch.id !== id)
    }));
  };

  const addChapter = () => {
    setOutline(prev => ({
      ...prev,
      chapters: [...prev.chapters, { id: `ch-new-${Date.now()}`, title: 'New Chapter', description: 'Describe the chapter here...' }]
    }));
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const bookRes = await API.post('/books', { ...formData, title: outline.title, subtitle: outline.subtitle });
      await API.put(`/books/${bookRes.data._id}/outline`, { chapters: outline.chapters });
      triggerToast('Draft saved successfully!');
      navigate('/dashboard');
    } catch (err) {
      triggerToast('Failed to save draft', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBook = async () => {
    setLoading(true);
    try {
      const bookRes = await API.post('/books', { ...formData, title: outline.title, subtitle: outline.subtitle });
      await API.put(`/books/${bookRes.data._id}/outline`, { chapters: outline.chapters });
      await API.post(`/books/${bookRes.data._id}/generate`);
      
      setGeneratedBookId(bookRes.data._id);
      setStep(3);
      triggerToast('Book generation started!');
    } catch (err) {
      triggerToast('Failed to start generation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelGeneration = async () => {
    if (!generatedBookId) return;
    try {
      await API.post(`/books/${generatedBookId}/cancel`);
      triggerToast('Generation cancelled');
      // Let polling catch the cancelled status
    } catch (err) {
      triggerToast('Failed to cancel', 'error');
    }
  };

  const handleRetryChapter = async (chapterId) => {
    // Actually we didn't add a specific route for retry chapter, but we can reuse the book generation 
    // since it skips completed chapters!
    try {
      await API.post(`/books/${generatedBookId}/generate`);
      triggerToast('Retrying generation...');
    } catch (err) {
      triggerToast('Failed to retry', 'error');
    }
  };

  // UI RENDERERS
  
  if (step === 1) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create a New Book</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Turn your idea into a structured, AI-powered ebook.</p>
        </div>

        {/* Template Banner */}
        {activeTemplate && (
          <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutTemplate size={20} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider block">Using Template</span>
                <span className="font-bold text-indigo-800 dark:text-indigo-200">{activeTemplate.name}</span>
              </div>
            </div>
            <button type="button" onClick={() => setActiveTemplate(null)} className="p-1.5 text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition" aria-label="Remove template">
              <X size={16} />
            </button>
          </div>
        )}

        <form onSubmit={handleGenerateOutline} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Book Title *</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full text-slate-900 border border-slate-200 p-3 rounded-lg focus:outline-none focus:border-indigo-500 transition" placeholder="e.g., The Rust Programming Guide" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Topic / Idea *</label>
              <textarea name="topic" required value={formData.topic} onChange={handleChange} rows={3} className="w-full text-slate-900 border border-slate-200 p-3 rounded-lg focus:outline-none focus:border-indigo-500 transition resize-none" placeholder="Please enter what you want your book to be about." />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description (Optional)</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full text-slate-900 border border-slate-200 p-3 rounded-lg focus:outline-none focus:border-indigo-500 transition resize-none" placeholder="Additional context for the AI..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Genre *</label>
                <select name="genre" required value={formData.genre} onChange={handleChange} className="w-full text-slate-900 border border-slate-200 p-3 rounded-lg focus:outline-none focus:border-indigo-500 bg-white">
                  <option value="">Select Genre</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Self-Help">Self-Help</option>
                  <option value="Business">Business</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Target Audience *</label>
                <input type="text" name="targetAudience" required value={formData.targetAudience} onChange={handleChange} className="w-full text-slate-900 border border-slate-200 p-3 rounded-lg focus:outline-none focus:border-indigo-500" placeholder="e.g., Beginners, Experts" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Writing Tone</label>
                <select name="writingTone" value={formData.writingTone} onChange={handleChange} className="w-full text-slate-900 border border-slate-200 p-3 rounded-lg focus:outline-none focus:border-indigo-500 bg-white">
                  <option value="">Select Tone</option>
                  <option value="Professional">Professional</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Academic">Academic</option>
                  <option value="Humorous">Humorous</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Language *</label>
                <select name="language" required value={formData.language} onChange={handleChange} className="w-full text-slate-900 border border-slate-200 p-3 rounded-lg focus:outline-none focus:border-indigo-500 bg-white">
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Number of Chapters *</label>
                <select name="chapterCount" required value={formData.chapterCount} onChange={handleChange} className="w-full text-slate-900 border border-slate-200 p-3 rounded-lg focus:outline-none focus:border-indigo-500 bg-white">
                  <option value={3}>3 Chapters (Short)</option>
                  <option value={5}>5 Chapters</option>
                  <option value={8}>8 Chapters (Standard)</option>
                  <option value={10}>10 Chapters</option>
                  <option value={12}>12 Chapters</option>
                  <option value={15}>15 Chapters</option>
                  <option value={20}>20 Chapters (Long)</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium p-3.5 rounded-xl transition mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating Outline...</> : <><Sparkles className="w-5 h-5" /> Generate Outline</>}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 2 && outline) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Book Outline</h1>
          <p className="text-slate-500 mt-2">Review, edit, and reorder your chapters before generating the book.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <input 
            type="text" 
            value={outline.title} 
            onChange={(e) => setOutline({...outline, title: e.target.value})}
            className="text-2xl font-bold text-slate-900 w-full border-none focus:ring-0 p-0 mb-2"
          />
          <input 
            type="text" 
            value={outline.subtitle} 
            onChange={(e) => setOutline({...outline, subtitle: e.target.value})}
            className="text-lg text-slate-500 w-full border-none focus:ring-0 p-0"
            placeholder="Subtitle (optional)"
          />
        </div>

        <div className="mb-6">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={outline.chapters.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {outline.chapters.map((ch, idx) => (
                <SortableChapterItem key={ch.id} id={ch.id} index={idx} chapter={ch} updateChapter={updateChapter} removeChapter={removeChapter} />
              ))}
            </SortableContext>
          </DndContext>
          
          <button onClick={addChapter} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-indigo-500 hover:text-indigo-600 transition flex items-center justify-center gap-2">
            <Plus size={20} /> Add Chapter
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 border-t border-slate-200 pt-6">
          <button onClick={() => setStep(1)} className="px-6 py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition">
            Back
          </button>
          <div className="flex gap-4">
            <button onClick={handleSaveDraft} disabled={loading} className="px-6 py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-50">
              Save Draft
            </button>
            <button onClick={handleGenerateBook} disabled={loading} className="px-8 py-3 bg-indigo-600 rounded-xl font-medium text-white hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? 'Starting...' : 'Generate Book'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3 && generationProgress) {
    const totalChapters = generationProgress.chapters.length;
    const completedChapters = generationProgress.chapters.filter(c => c.status === 'completed').length;
    const progressPercent = Math.round((completedChapters / totalChapters) * 100) || 0;
    
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {generationProgress.status === 'ready' ? 'Your ebook is ready.' : 'Creating your ebook...'}
          </h1>
          <p className="text-slate-500 mt-2">
            {generationProgress.status === 'ready' ? 'All chapters have been successfully generated.' : 'Please wait while AI generates your content. This may take a few minutes.'}
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <div className="mb-8">
            <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
              <span>Overall Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-indigo-600 h-4 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            {generationProgress.chapters.map((ch, idx) => (
              <div key={ch._id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50">
                <div className="flex items-center gap-3">
                  {ch.status === 'completed' && <CheckCircle2 className="text-emerald-500 w-5 h-5" />}
                  {ch.status === 'generating' && <Loader2 className="text-indigo-500 w-5 h-5 animate-spin" />}
                  {ch.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>}
                  {ch.status === 'failed' && <AlertTriangle className="text-red-500 w-5 h-5" />}
                  <span className={`font-medium ${ch.status === 'completed' ? 'text-slate-800' : 'text-slate-500'}`}>
                    Chapter {idx + 1}: {ch.title}
                  </span>
                </div>
                {ch.status === 'failed' && generationProgress.status !== 'ready' && (
                  <button onClick={() => handleRetryChapter(ch._id)} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
                    Retry
                  </button>
                )}
                {ch.status === 'completed' && (
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-medium">Done</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {generationProgress.status === 'generating' && (
            <button onClick={handleCancelGeneration} className="px-6 py-3 border border-red-200 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition flex items-center gap-2">
              <StopCircle size={18} /> Cancel Generation
            </button>
          )}
          
          {(generationProgress.status === 'ready' || generationProgress.status === 'failed') && (
            <>
              <button onClick={() => navigate(`/books/${generatedBookId}`)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm">
                Open Book
              </button>
              <button onClick={() => navigate('/dashboard')} className="px-8 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition">
                Go to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );
}