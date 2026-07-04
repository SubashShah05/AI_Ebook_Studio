import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { triggerToast } from '../utils/helpers';
import { Sparkles, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function CreateBook() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewOutline, setPreviewOutline] = useState(null);
  const navigate = useNavigate();

  const handleGenerateOutline = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await API.post('/ai/outline', { topic });
      setPreviewOutline(res.data);
      triggerToast('AI outline structured correctly. Review setup below.');
    } catch (err) {
      triggerToast('AI pipeline generation timeout or invalid schema configuration setup match', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndBuild = async () => {
    if (!previewOutline) return;
    setLoading(true);
    try {
      // Step 1: Create Book entity core structure tracking setup
      const bookRes = await API.post('/books', {
        title: previewOutline.title,
        subtitle: previewOutline.subtitle,
      });
      const createdBookId = bookRes.data._id;

      // Step 2: Concurrently create outline template chapters structures tracking sequence array loop sequence
      for (let i = 0; i < previewOutline.chapters.length; i++) {
        const ch = previewOutline.chapters[i];
        await API.post('/chapters', {
          bookId: createdBookId,
          title: ch.title,
          description: ch.description,
        });
      }

      triggerToast('eBook structured pipeline database schema models populated smoothly.');
      navigate(`/books/${createdBookId}`);
    } catch (err) {
      triggerToast('Failed tracking model configuration creation setup', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Content Pipeline Architect</h1>
        <p className="text-slate-500 mt-2">Enter your core thematic context topic. Google Gemini will dynamically compute high-level structured chapters layout map configuration blocks automatically.</p>
      </div>

      {!previewOutline ? (
        <form onSubmit={handleGenerateOutline} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Book Concept Idea / Theme Topic</label>
            <input 
              type="text" 
              required
              placeholder="e.g., Ultimate Mastering Handbook for Real-World Microservices using Rust Architecture Engine Development Patterns"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full border border-slate-200 p-3 rounded-lg focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium p-3 rounded-lg transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Engineering Structural Outline Parameters...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Generate Structured Outline Architecture
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 block mb-1">AI Output Proposal Verified</span>
                <h2 className="text-xl font-extrabold text-slate-900">{previewOutline.title}</h2>
                <p className="text-slate-600 text-sm italic mt-0.5">{previewOutline.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 border-b pb-3 mb-4">Calculated Chapter Layout Architecture Matrix</h3>
            <div className="space-y-4">
              {previewOutline.chapters.map((ch, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                  <h4 className="font-bold text-slate-800 text-sm">{ch.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{ch.description}</p>
                </div>
              ))}
            </div>
            
            <div className="flex gap-4 border-t pt-5 mt-6">
              <button 
                onClick={() => setPreviewOutline(null)} 
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg transition"
              >
                Back / Rewrite
              </button>
              <button 
                onClick={handleConfirmAndBuild} 
                className="w-2/3 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition"
              >
                Assemble & Instantiate Workspace Structure <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}